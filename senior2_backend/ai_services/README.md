# PTP AI Passenger Counting Service

Automatically counts passengers entering and exiting a bus using
YOLOv8 + ByteTrack, then pushes the live count to the Django backend.

---

## Setup

### 1. Install dependencies
```bash
cd ai_service
pip install -r requirements.txt
```

### 2. Configure `config.py`
Open `config.py` and set:

| Setting | What to change |
|---|---|
| `CAMERA_SOURCE` | `0` for USB webcam, RTSP URL for IP cam |
| `DRIVER_AUTH_TOKEN` | Copy token from your login response or DB |
| `VEHICLE_ID` | The vehicle this camera is installed in |
| `DJANGO_API_BASE_URL` | `http://127.0.0.1:8000` for local dev |
| `LINE_POSITION` | Adjust until the line sits at the bus door |

### 3. Make sure Django is running
```bash
# In your Django project root
python manage.py runserver
```

### 4. Make sure the driver has an active trip
The `/api/driver/passenger-count/update` endpoint requires an active trip.
Start a trip via the driver app or Postman before running the AI service.

### 5. Run the service
```bash
cd ai_service
python main.py
```

---

## Debug Window Controls

| Key | Action |
|---|---|
| `Q` | Stop the service cleanly |

### What you see
- **Yellow horizontal line** — virtual counting line
- **Green boxes** — people below the line (on bus side)
- **Red boxes** — people above the line (outside side)
- **ID label** — ByteTrack persistent ID per person
- **Top-left panel** — live count, total IN, total OUT
- **Top-right flash** — ENTER/EXIT event when it happens

---

## Switching Camera Source

Edit `config.py` only — no other file changes needed:

```python
# USB webcam
CAMERA_SOURCE = 0

# IP camera (RTSP)
CAMERA_SOURCE = "rtsp://admin:password@192.168.1.100:554/stream"

# Video file (for testing without hardware)
CAMERA_SOURCE = "C:/path/to/test_video.mp4"

# Raspberry Pi camera (via libcamera-vid pipe) - future
CAMERA_SOURCE = "libcamerasrc ! videoconvert ! appsink"
```

---

## Architecture

```
USB Webcam
    ↓
FrameReader          frame_reader.py   — camera abstraction
    ↓
PersonTracker        tracker.py        — YOLOv8n + ByteTrack
    ↓ tracked IDs + bboxes
DirectionCounter     direction_counter.py — virtual line crossing
    ↓ enter/exit events
CountStateManager    count_state_manager.py — total_in / total_out
    ↓ absolute count
DjangoAPIClient      django_api_client.py — POST to backend
    ↓
Django Backend → WebSocket → React Native App
```