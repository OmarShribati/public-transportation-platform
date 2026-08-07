"""
tracker.py
==========
ByteTrack wrapper via Ultralytics built-in tracker.

Assigns a persistent integer ID to each detected person across frames.
The direction counter uses these IDs to determine if the same person
has crossed the counting line.
"""

import logging

import numpy as np
from ultralytics import YOLO

import config

logger = logging.getLogger(__name__)


class PersonTracker:
    """
    Uses YOLOv8 + ByteTrack to detect AND track people in one step.

    Replaces the two-step (detect → track) pipeline with the built-in
    Ultralytics tracker, which is simpler to configure and maintain.

    Usage:
        tracker = PersonTracker()
        tracks = tracker.update(frame)
        # tracks → list of Track objects, each with .id and .bbox (x1,y1,x2,y2)
    """

    def __init__(self):
        logger.info("Initialising PersonTracker with YOLOv8 + ByteTrack")
        self._model = YOLO(config.YOLO_MODEL)

    def update(self, frame: np.ndarray) -> list:
        """
        Run detection + tracking on a single frame.

        Returns:
            List of Track namedtuple-like objects:
                track.id    → int, persistent person ID
                track.bbox  → (x1, y1, x2, y2) floats
                track.conf  → float confidence
        """
        results = self._model.track(
            frame,
            classes=[config.DETECTION_CLASS],
            conf=config.DETECTION_CONFIDENCE,
            tracker="bytetrack.yaml",
            persist=True,          # keeps track state between calls
            verbose=False,
        )

        tracks = []
        boxes = results[0].boxes

        if boxes is None or boxes.id is None:
            return tracks

        ids = boxes.id.cpu().numpy().astype(int)
        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()

        for track_id, bbox, conf in zip(ids, xyxy, confs):
            tracks.append(_Track(id=int(track_id), bbox=tuple(bbox), conf=float(conf)))

        return tracks


class _Track:
    """Simple data container for a single tracked person."""

    __slots__ = ('id', 'bbox', 'conf')

    def __init__(self, id: int, bbox: tuple, conf: float):
        self.id = id
        self.bbox = bbox    # (x1, y1, x2, y2)
        self.conf = conf

    @property
    def centroid(self) -> tuple[float, float]:
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    def __repr__(self):
        cx, cy = self.centroid
        return f"Track(id={self.id}, centroid=({cx:.0f},{cy:.0f}), conf={self.conf:.2f})"