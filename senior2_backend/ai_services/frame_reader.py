"""
frame_reader.py
===============
Camera abstraction layer.

Swap CAMERA_SOURCE in config.py to switch between:
  - USB webcam   → integer (0, 1, 2 …)
  - IP camera    → "rtsp://user:pass@ip:port/stream"
  - Video file   → "C:/path/to/file.mp4"

No other file needs to change.
"""

import logging

import cv2

import config

logger = logging.getLogger(__name__)


class FrameReader:
    """
    Opens the camera/video source and yields frames one at a time.

    Usage:
        reader = FrameReader()
        reader.start()
        frame = reader.read()   # returns None when source is exhausted
        reader.stop()

    Or use as a context manager:
        with FrameReader() as reader:
            while True:
                frame = reader.read()
                if frame is None:
                    break
    """

    def __init__(self, source=None):
        self._source = source if source is not None else config.CAMERA_SOURCE
        self._cap: cv2.VideoCapture | None = None

    def start(self):
        self._cap = cv2.VideoCapture(self._source)

        if not self._cap.isOpened():
            raise RuntimeError(
                f"Cannot open camera source: {self._source!r}. "
                "Check that the webcam is connected or the URL is correct."
            )

        # Set resolution only for webcam (integer source)
        if isinstance(self._source, int):
            self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
            self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)

        actual_w = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_h = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        logger.info("Camera opened: %s  resolution: %dx%d", self._source, actual_w, actual_h)

    def read(self):
        """
        Read the next frame.
        Returns the frame (numpy array) or None if the source is exhausted / failed.
        """
        if self._cap is None:
            raise RuntimeError("Call start() before read().")

        ret, frame = self._cap.read()
        if not ret:
            return None
        return frame

    @property
    def frame_size(self) -> tuple[int, int]:
        """Returns (width, height) of the current source."""
        if self._cap is None:
            raise RuntimeError("Call start() first.")
        w = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        return w, h

    def stop(self):
        if self._cap and self._cap.isOpened():
            self._cap.release()
            logger.info("Camera released.")

    # ── Context manager support ───────────────────────────────────────────────

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *_):
        self.stop()