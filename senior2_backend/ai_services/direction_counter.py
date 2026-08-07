"""
direction_counter.py
====================

Virtual vertical counting line logic.

Crossing rules:
  - Person centroid moves from LEFT to RIGHT  → ENTER (+1)
  - Person centroid moves from RIGHT to LEFT → EXIT (-1)

Each track ID is remembered individually to prevent double counting.
"""

import logging

import config

logger = logging.getLogger(__name__)

_LEFT = "left"
_RIGHT = "right"
_ON = "on"


class DirectionCounter:

    def __init__(self, frame_width: int):
        # Vertical line position
        self._line_x: float = frame_width * config.LINE_POSITION
        self._tolerance: int = config.LINE_CROSS_TOLERANCE

        # track_id -> last position
        self._last_position: dict[int, str] = {}

        logger.info(
            "DirectionCounter initialized — line_x=%.1f px, tolerance=±%d px",
            self._line_x,
            self._tolerance,
        )

    @property
    def line_x(self) -> float:
        return self._line_x


    def update(self, tracks: list) -> list[dict]:

        events = []
        current_ids = set()

        for track in tracks:

            tid = track.id
            current_ids.add(tid)

            cx, cy = track.centroid

            position = self._classify(cx)


            if position == _ON:
                continue


            if tid not in self._last_position:
                self._last_position[tid] = position
                continue


            prev = self._last_position[tid]


            if prev == position:
                continue


            # LEFT -> RIGHT = ENTER
            if prev == _LEFT and position == _RIGHT:

                events.append({
                    "track_id": tid,
                    "direction": "enter"
                })

                logger.debug(
                    "ENTER track_id=%d cx=%.1f",
                    tid,
                    cx
                )


            # RIGHT -> LEFT = EXIT
            elif prev == _RIGHT and position == _LEFT:

                events.append({
                    "track_id": tid,
                    "direction": "exit"
                })

                logger.debug(
                    "EXIT track_id=%d cx=%.1f",
                    tid,
                    cx
                )


            self._last_position[tid] = position



        # remove lost tracks
        lost_ids = set(self._last_position) - current_ids

        for tid in lost_ids:
            del self._last_position[tid]


        return events



    def _classify(self, cx: float) -> str:

        """
        Classify centroid x-position relative to vertical line.
        """

        if cx < self._line_x - self._tolerance:
            return _LEFT


        if cx > self._line_x + self._tolerance:
            return _RIGHT


        return _ON