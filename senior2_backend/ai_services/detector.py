"""
detector.py
===========
YOLOv8 people detector.

Returns raw bounding boxes in (x1, y1, x2, y2, confidence) format
for every person detected in a frame.
The tracker consumes this output.
"""

import logging

import numpy as np
from ultralytics import YOLO

import config

logger = logging.getLogger(__name__)


class PeopleDetector:
    """
    Wraps YOLOv8 to detect people (COCO class 0) in a single frame.

    Usage:
        detector = PeopleDetector()
        detections = detector.detect(frame)
        # detections → numpy array shape (N, 5): [x1, y1, x2, y2, conf]
    """

    def __init__(self):
        logger.info("Loading YOLO model: %s", config.YOLO_MODEL)
        self._model = YOLO(config.YOLO_MODEL)
        # Warm up the model with a blank frame so first real frame isn't slow
        self._model.predict(
            np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8),
            classes=[config.DETECTION_CLASS],
            conf=config.DETECTION_CONFIDENCE,
            verbose=False,
        )
        logger.info("YOLO model ready.")

    def detect(self, frame: np.ndarray) -> np.ndarray:
        """
        Run inference on a single BGR frame.

        Returns:
            numpy array of shape (N, 5) — [x1, y1, x2, y2, confidence]
            Empty array (shape 0, 5) if no people detected.
        """
        results = self._model.predict(
            frame,
            classes=[config.DETECTION_CLASS],
            conf=config.DETECTION_CONFIDENCE,
            verbose=False,
        )

        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return np.empty((0, 5), dtype=np.float32)

        # xyxy → (N, 4) float32,  conf → (N, 1) float32
        xyxy = boxes.xyxy.cpu().numpy()
        conf = boxes.conf.cpu().numpy().reshape(-1, 1)

        return np.hstack([xyxy, conf]).astype(np.float32)