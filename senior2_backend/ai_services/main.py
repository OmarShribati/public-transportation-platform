"""
main.py
=======

Entry point for the PTP AI Passenger Counting Service.

Run:
    cd ai_service
    python main.py

Controls:
    Press Q in debug window to stop.
"""

import logging
import sys
import time

import cv2

import config
from count_state_manager import CountStateManager
from direction_counter import DirectionCounter
from django_api_client import DjangoAPIClient
from frame_reader import FrameReader
from tracker import PersonTracker


# ── Logging ────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("main")


# ── Colors (BGR) ──────────────────────────────────────────────────────────

_GREEN = (0, 255, 0)
_RED = (0, 0, 255)
_YELLOW = (0, 255, 255)
_WHITE = (255, 255, 255)
_BLACK = (0, 0, 0)



def draw_debug(frame, tracks, events, state, line_x, trip_info):

    h, w = frame.shape[:2]
    lx = int(line_x)


    # ── Vertical Counting Line ───────────────────────────────────────────

    cv2.line(
        frame,
        (lx, 0),
        (lx, h),
        _YELLOW,
        2
    )

    cv2.putText(
        frame,
        "COUNTING LINE",
        (lx + 10, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        _YELLOW,
        1
    )

    cv2.putText(
        frame,
        "<- EXIT",
        (lx - 90, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        _RED,
        1
    )

    cv2.putText(
        frame,
        "ENTER ->",
        (lx + 10, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        _GREEN,
        1
    )


    # ── Tracked People ───────────────────────────────────────────────────

    for track in tracks:

        x1, y1, x2, y2 = (
            int(v)
            for v in track.bbox
        )

        cx, cy = track.centroid


        colour = _GREEN if cx > line_x else _RED


        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            colour,
            2
        )


        cv2.circle(
            frame,
            (int(cx), int(cy)),
            4,
            colour,
            -1
        )


        cv2.putText(
            frame,
            f"ID {track.id}",
            (x1, y1 - 6),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            colour,
            1
        )



    # ── Crossing Events ──────────────────────────────────────────────────

    for i, event in enumerate(events):

        label = (
            "ENTER +1"
            if event["direction"] == "enter"
            else "EXIT -1"
        )

        label += f" (ID {event['track_id']})"


        colour = (
            _GREEN
            if event["direction"] == "enter"
            else _RED
        )


        cv2.putText(
            frame,
            label,
            (w - 280, 30 + i * 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            colour,
            2
        )



    # ── Information Panel ────────────────────────────────────────────────

    info = [

        f"Passengers : {state.current_count}",

        f"Total IN   : {state.total_in}",

        f"Total OUT  : {state.total_out}",

        f"Vehicle ID : {trip_info.get('vehicle_id', '?')}",

        f"Trip ID    : {trip_info.get('trip_id', '?')}",
    ]


    for i, text in enumerate(info):

        y = 28 + i * 26


        cv2.rectangle(
            frame,
            (6, y - 18),
            (250, y + 6),
            _BLACK,
            -1
        )


        cv2.putText(
            frame,
            text,
            (10, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            _WHITE,
            2
        )


    return frame





def run():

    logger.info("=" * 60)
    logger.info("PTP AI Passenger Counting Service Starting")
    logger.info("=" * 60)



    api_client = DjangoAPIClient()



    # ── Step 1: Get active trip ──────────────────────────────────────────

    logger.info("Resolving active trip...")

    trip_info = api_client.fetch_active_trip()



    if trip_info is None:

        logger.error(
            "No active trip found.\n"
            "Check DRIVER_AUTH_TOKEN and driver trip."
        )

        api_client.close()

        sys.exit(1)



    vehicle_id = trip_info["vehicle_id"]

    trip_id = trip_info["trip_id"]



    logger.info(
        "Trip resolved vehicle_id=%s trip_id=%s",
        vehicle_id,
        trip_id
    )



    # ── Step 2: AI Components ────────────────────────────────────────────

    tracker = PersonTracker()

    state = CountStateManager()

    last_send_time = 0.0




    # ── Step 3: Camera ──────────────────────────────────────────────────

    with FrameReader() as reader:


        frame_width = reader.frame_size[0]


        # Vertical line
        counter = DirectionCounter(
            frame_width=frame_width
        )



        logger.info(
            "Camera started. Press Q to quit."
        )



        while True:


            frame = reader.read()



            if frame is None:

                break



            # Detect + Track

            tracks = tracker.update(frame)



            # Count

            events = counter.update(tracks)


            state.apply_events(events)



            # Send update to Django

            now = time.monotonic()


            if (
                state.has_changed_since_last_send()
                and
                (
                    config.SEND_INTERVAL_SECONDS == 0
                    or
                    now - last_send_time >= config.SEND_INTERVAL_SECONDS
                )
            ):


                if api_client.send_count(
                    state.current_count
                ):

                    state.mark_sent()

                    last_send_time = now





            # Debug window

            if config.DEBUG_WINDOW:


                debug_frame = draw_debug(

                    frame.copy(),

                    tracks,

                    events,

                    state,

                    counter.line_x,

                    trip_info

                )


                cv2.imshow(
                    config.DEBUG_WINDOW_TITLE,
                    debug_frame
                )



                if cv2.waitKey(1) & 0xFF == ord("q"):

                    break





    # Cleanup

    if config.DEBUG_WINDOW:

        cv2.destroyAllWindows()



    api_client.close()



    logger.info(
        "Service stopped."
    )





if __name__ == "__main__":

    run()