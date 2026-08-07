"""
config.py
=========
All tunable settings for the AI passenger counting service.
Change values here only — no other file needs editing to switch
camera source, model, or backend URL.
"""

# ── Camera ────────────────────────────────────────────────────────────────────

# 0 = first USB webcam, 1 = second USB webcam
# For IP camera replace with: "rtsp://user:pass@192.168.1.100:554/stream"
# For video file replace with: "C:/path/to/test_video.mp4"
CAMERA_SOURCE = 0

# Frame resolution (width, height).
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# ── YOLO Detection ────────────────────────────────────────────────────────────

# Model size: yolov8n (fastest/CPU), yolov8s, yolov8m, yolov8l
YOLO_MODEL = "yolov8n.pt"

# Only detect people (COCO class 0)
DETECTION_CLASS = 0

# Minimum confidence to accept a detection (0.0 – 1.0)
DETECTION_CONFIDENCE = 0.4

# ── ByteTrack ─────────────────────────────────────────────────────────────────

# How many frames a track can be "lost" before it's deleted
TRACK_BUFFER = 30

# ── Virtual Counting Line ─────────────────────────────────────────────────────

# The virtual line is drawn horizontally across the frame.
# LINE_POSITION is a ratio of the frame height (0.0 = top, 1.0 = bottom).
LINE_DIRECTION = "vertical"
LINE_POSITION = 0.5

# Pixels a tracked centroid must cross past the line to register as an event.
LINE_CROSS_TOLERANCE = 5

# ── Django Backend ────────────────────────────────────────────────────────────

# Base URL of your Django backend
DJANGO_API_BASE_URL = "http://127.0.0.1:8000"

# Driver auth token — copy from your login response.
# The AI service authenticates AS the driver, so vehicle_id is resolved
# automatically from the driver's active trip. No hardcoded VEHICLE_ID needed.
DRIVER_AUTH_TOKEN = "xfHexgebavKFmHRnJs0yuuemla47Gxba3lcxSsuD"

# How often (in seconds) to send the count to the backend.
# 0 = send on every change immediately.
SEND_INTERVAL_SECONDS = 2

# How many times to retry a failed API call before giving up
API_RETRY_COUNT = 3

# ── Debug Window ─────────────────────────────────────────────────────────────

DEBUG_WINDOW = True
DEBUG_WINDOW_TITLE = "PTP Passenger Counter — Debug View"