# Public Transportation Platform

Django REST Framework backend for a public transportation platform. The current codebase focuses on account management for passengers, drivers, and administrators, with support for driver approval, profiles, deactivation requests, vehicles, and routes.

## Team Members

- Omar Shribati
- Adnan Alashram
- Shahed Alzoni

## Tech Stack

- Python 3.8+
- Django 4.2.7
- Django REST Framework 3.14.0
- MySQL via `mysqlclient`

## Current Project Structure

```text
Public_Transportation_PLATFORM/
├── manage.py
├── requirements.txt
├── validate_setup.py
├── README.md
├── LICENSE
├── p_transportation_p/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── PTP/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── urls.py
    ├── migrations/
    │   └── ...
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── user_manager.py
    │   ├── driver.py
    │   ├── driver_token.py
    │   ├── route.py
    │   └── vehicle.py
    ├── serializers/
    │   ├── __init__.py
    │   ├── admin_serializers.py
    │   ├── auth_serializers.py
    │   ├── profile_serializers.py
    │   ├── registration_serializers.py
    │   └── user_serializers.py
    ├── services/
    │   ├── __init__.py
    │   └── account_service.py
    └── views/
        ├── __init__.py
        ├── admin_account_views.py
        ├── admin_driver_views.py
        ├── admin_views.py
        ├── auth_views.py
        ├── driver_views.py
        ├── logout_views.py
        ├── passenger_views.py
        └── registration_view.py
```

## Architecture

The project is a single Django project with one main app, `PTP`.

- `p_transportation_p/` contains the Django project configuration, global URL routing, ASGI, and WSGI entry points.
- `PTP/models/` contains database models for users, drivers, driver tokens, routes, and vehicles.
- `PTP/serializers/` contains request validation and response serialization logic.
- `PTP/views/` contains API views for authentication, profiles, admin account management, and driver approval workflows.
- `PTP/services/` contains business logic that should stay outside views when possible.
- `PTP/migrations/` contains Django database migrations and should be committed to version control.

Ignored local-only/generated directories include `venv/`, `media/`, `__pycache__/`, database dumps, and `p_transportation_p/local_settings.py`.

## Main Models

- `User`: custom passenger/admin user model with email login, full name, phone, status, and admin flag.
- `Driver`: driver account model with approval status, account status, license image, vehicle assignment, and deactivation request fields.
- `DriverToken`: authentication token linked one-to-one with a driver.
- `Route`: transit route record.
- `Stop`: real-world bus stop location stored as latitude and longitude coordinates.
- `Vehicle`: vehicle record linked optionally to a route.

## API Routes

All app endpoints are mounted under:

```text
/api/accounts/
```

Available routes:

```text
POST  /api/accounts/register
POST  /api/accounts/login
POST  /api/accounts/logout

GET   /api/accounts/passenger/profile
PATCH /api/accounts/passenger/profile
POST  /api/accounts/passenger/deactivate

GET   /api/accounts/driver/profile
PATCH /api/accounts/driver/profile
POST  /api/accounts/driver/deactivation-request

GET   /api/accounts/admin/accounts
POST  /api/accounts/admin/accounts
PATCH /api/accounts/admin/accounts/<account_type>/<account_id>
POST  /api/accounts/admin/accounts/<account_type>/<account_id>/<action>
POST  /api/accounts/admin/drivers/<driver_id>/<action>
GET   /api/accounts/admin/driver-requests
GET   /api/accounts/admin/stops
POST  /api/accounts/admin/stops
PATCH /api/accounts/admin/stops/<stop_id>
DELETE /api/accounts/admin/stops/<stop_id>

GET   /api/accounts/users
```

Django admin is available at:

```text
/admin/
```

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure MySQL settings.

   You can use environment variables:

   ```bash
   set MYSQL_DATABASE=public_transport_db
   set MYSQL_USER=transport_user
   set MYSQL_PASSWORD=your_mysql_password
   set MYSQL_HOST=127.0.0.1
   set MYSQL_PORT=3306
   ```

   Or create a local-only file named `p_transportation_p/local_settings.py`:

   ```python
   MYSQL_DATABASE = 'public_transport_db'
   MYSQL_USER = 'transport_user'
   MYSQL_PASSWORD = 'your_mysql_password'
   MYSQL_HOST = '127.0.0.1'
   MYSQL_PORT = '3306'
   ```

4. Apply migrations:

   ```bash
   python manage.py migrate
   ```

5. Create an admin user if needed:

   ```bash
   python manage.py createsuperuser
   ```

6. Run the development server:

   ```bash
   python manage.py runserver
   ```

## Validation

Run Django checks:

```bash
python manage.py check
```

Run the setup validation script:

```bash
python validate_setup.py
```

## Notes

- Uploaded media files are stored under `media/` locally and are not committed to Git.
- `p_transportation_p/local_settings.py` is intentionally ignored because it can contain local database credentials.
- The current codebase does not use an `apps/account_management/` directory; the active Django app is `PTP`.
