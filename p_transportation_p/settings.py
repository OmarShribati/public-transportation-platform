import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'replace-this-with-a-secure-secret-key'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'PTP.apps.PTPConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'p_transportation_p.urls'
ASGI_APPLICATION = 'p_transportation_p.asgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'p_transportation_p.wsgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'public_transport_db')
MYSQL_USER = os.environ.get('MYSQL_USER', 'transport_user')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')

try:
    from .local_settings import (
        MYSQL_DATABASE,
        MYSQL_HOST,
        MYSQL_PASSWORD,
        MYSQL_PORT,
        MYSQL_USER,
    )
except ImportError:
    pass

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': MYSQL_DATABASE,
        'USER': MYSQL_USER,
        'PASSWORD': MYSQL_PASSWORD,
        'HOST': MYSQL_HOST,
        'PORT': MYSQL_PORT,
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_USER_MODEL = 'PTP.User'

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

OSRM_BASE_URL = os.environ.get('OSRM_BASE_URL', 'https://router.project-osrm.org')
OSRM_PROFILE = os.environ.get('OSRM_PROFILE', 'driving')
OSRM_TIMEOUT_SECONDS = int(os.environ.get('OSRM_TIMEOUT_SECONDS', '10'))
OSRM_MAX_SNAP_DISTANCE_METERS = int(os.environ.get('OSRM_MAX_SNAP_DISTANCE_METERS', '100'))
ROUTE_DEVIATION_THRESHOLD_METERS = int(os.environ.get('ROUTE_DEVIATION_THRESHOLD_METERS', '150'))
PASSENGER_ROUTE_MATCH_THRESHOLD_METERS = int(os.environ.get('PASSENGER_ROUTE_MATCH_THRESHOLD_METERS', '500'))
GEOCODING_BASE_URL = os.environ.get('GEOCODING_BASE_URL', 'https://nominatim.openstreetmap.org/search')
GEOCODING_TIMEOUT_SECONDS = int(os.environ.get('GEOCODING_TIMEOUT_SECONDS', '10'))
GEOCODING_USER_AGENT = os.environ.get('GEOCODING_USER_AGENT', 'PublicTransportationPlatform/1.0')
DAMASCUS_ROUTE_GEOJSON_PATH = os.environ.get(
    'DAMASCUS_ROUTE_GEOJSON_PATH',
    str(BASE_DIR / 'PTP' / 'data' / 'damascus_governorate.geojson'),
)

DAMASCUS_ROUTE_BOUNDS = {
    'min_latitude': os.environ.get('DAMASCUS_MIN_LATITUDE', '33.430000'),
    'max_latitude': os.environ.get('DAMASCUS_MAX_LATITUDE', '33.580000'),
    'min_longitude': os.environ.get('DAMASCUS_MIN_LONGITUDE', '36.180000'),
    'max_longitude': os.environ.get('DAMASCUS_MAX_LONGITUDE', '36.380000'),
}

DAMASCUS_ROUTE_POLYGON = [
    {'latitude': '33.573000', 'longitude': '36.214000'},
    {'latitude': '33.579000', 'longitude': '36.256000'},
    {'latitude': '33.569000', 'longitude': '36.311000'},
    {'latitude': '33.548000', 'longitude': '36.363000'},
    {'latitude': '33.518000', 'longitude': '36.382000'},
    {'latitude': '33.486000', 'longitude': '36.365000'},
    {'latitude': '33.459000', 'longitude': '36.331000'},
    {'latitude': '33.443000', 'longitude': '36.287000'},
    {'latitude': '33.449000', 'longitude': '36.237000'},
    {'latitude': '33.482000', 'longitude': '36.198000'},
    {'latitude': '33.524000', 'longitude': '36.189000'},
]
