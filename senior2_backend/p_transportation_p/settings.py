# import os
# from pathlib import Path
# import dj_database_url
# from corsheaders.defaults import default_headers

# # المسارات الأساسية
# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = 'replace-this-with-a-secure-secret-key'
# DEBUG = True

# # السماح لجميع المضيفين
# ALLOWED_HOSTS = ["*"]

# INSTALLED_APPS = [
#     'daphne',      
#     'channels',
#     'corsheaders', 
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'rest_framework',
#     'rest_framework.authtoken',
#     'PTP.apps.PTPConfig',
# ]

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# # --- إعدادات CORS و CSRF ---
# CORS_ALLOW_ALL_ORIGINS = True 
# CORS_ALLOW_CREDENTIALS = True

# CORS_ALLOW_HEADERS = list(default_headers) + [
#     "accept",
#     "authorization",
#     "content-type",
#     "user-agent",
#     "x-csrftoken",
#     "x-requested-with",
# ]

# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:5173",
#     "https://web-production-d9b56.up.railway.app",
# ]

# ROOT_URLCONF = 'p_transportation_p.urls'
# ASGI_APPLICATION = 'p_transportation_p.asgi.application'
# WSGI_APPLICATION = 'p_transportation_p.wsgi.application'

# # --- تصليح الـ TEMPLATES (حل أخطاء الـ SystemCheckError) ---
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',      # ضروري للأدمن
#                 'django.contrib.messages.context_processors.messages', # ضروري للأدمن
#             ],
#         },
#     },
# ]

# # --- إعدادات قاعدة البيانات ---
# DATABASES = {
#     'default': dj_database_url.config(
#         default=os.environ.get('DATABASE_URL'),
#         conn_max_age=600,
#     )
# }

# # --- تصليح الـ Redis و CHANNEL_LAYERS ---
# REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')

# # معالجة SSL لروابط Redis السحابية (Railway)
# if REDIS_URL.startswith('rediss://'):
#     REDIS_HOSTS = [f"{REDIS_URL}?ssl_cert_reqs=none"]
# else:
#     REDIS_HOSTS = [REDIS_URL]

# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": REDIS_HOSTS,
#         },
#     },
# }

# AUTH_USER_MODEL = 'PTP.User'

# LANGUAGE_CODE = 'ar-sy'
# TIME_ZONE = 'Asia/Damascus'
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True

# STATIC_URL = '/static/'
# MEDIA_URL = '/media/'
# MEDIA_ROOT = BASE_DIR / 'media'

# OSRM_BASE_URL = os.environ.get('OSRM_BASE_URL', 'https://router.project-osrm.org')
# OSRM_PROFILE = os.environ.get('OSRM_PROFILE', 'driving')
# GEOCODING_USER_AGENT = os.environ.get('GEOCODING_USER_AGENT', 'PublicTransportationPlatform/1.0')

# DAMASCUS_ROUTE_BOUNDS = {
#     'min_latitude': '33.430000',
#     'max_latitude': '33.580000',
#     'min_longitude': '36.180000',
#     'max_longitude': '36.380000',
# }

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# 2222222

# import os
# from pathlib import Path

# # المسارات الأساسية
# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = 'replace-this-with-a-secure-secret-key'
# DEBUG = True

# # السماح لجميع المضيفين (ضروري للتعامل مع بورتات الويب المختلفة والـ Ngrok)
# ALLOWED_HOSTS = ["*"]

# INSTALLED_APPS = [
#     'daphne',      # يجب أن تكون أولاً لضمان عمل الـ Websockets
#     'channels',
#     'corsheaders', # مكتبة حل مشكلة الـ CORS للويب
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'rest_framework',
#     'rest_framework.authtoken',
#     'PTP.apps.PTPConfig',
# ]

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',  # يجب أن تكون في أعلى القائمة
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# # إعدادات الـ CORS للسماح لمشروع الويب (React) بالاتصال
# CORS_ALLOW_ALL_ORIGINS = True  # في مرحلة التطوير نتركها True
# CORS_ALLOW_CREDENTIALS = True

# ROOT_URLCONF = 'p_transportation_p.urls'
# ASGI_APPLICATION = 'p_transportation_p.asgi.application'
# WSGI_APPLICATION = 'p_transportation_p.wsgi.application'

# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# # إعدادات السوكيت (الطبقة البرمجية للاتصال اللحظي)
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels.layers.InMemoryChannelLayer',
#     },
# }

# # إعدادات قاعدة البيانات (MySQL XAMPP)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'ptp',       
#         'USER': 'root',         
#         'PASSWORD': '',         
#         'HOST': '127.0.0.1',
#         'PORT': '3306',
#         'OPTIONS': {
#             'charset': 'utf8mb4',
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         },
#     }
# }

# AUTH_USER_MODEL = 'PTP.User'

# # إعدادات الوقت والمنطقة (ضبطتها لدمشق لتناسب بيانات النقل)
# LANGUAGE_CODE = 'ar-sy'
# TIME_ZONE = 'Asia/Damascus'
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True

# STATIC_URL = '/static/'
# MEDIA_URL = '/media/'
# MEDIA_ROOT = BASE_DIR / 'media'

# # إعدادات الخرائط والمسارات OSRM
# OSRM_BASE_URL = os.environ.get('OSRM_BASE_URL', 'https://router.project-osrm.org')
# OSRM_PROFILE = os.environ.get('OSRM_PROFILE', 'driving')
# GEOCODING_USER_AGENT = os.environ.get('GEOCODING_USER_AGENT', 'PublicTransportationPlatform/1.0')

# # حدود دمشق الجغرافية للتحقق من البيانات
# DAMASCUS_ROUTE_BOUNDS = {
#     'min_latitude': '33.430000',
#     'max_latitude': '33.580000',
#     'min_longitude': '36.180000',
#     'max_longitude': '36.380000',
# }

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

import os
from pathlib import Path

from corsheaders.defaults import default_headers


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = 'replace-this-with-a-secure-secret-key'

DEBUG = True

ALLOWED_HOSTS = [
    "*",
]


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    "https://deduct-same-praising.ngrok-free.dev",
]


# ============================================================
# INSTALLED APPS
# ============================================================

INSTALLED_APPS = [
    'daphne',
    'channels',
    'corsheaders',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',

    'drf_spectacular',

    'PTP.apps.PTPConfig',
    'django_extensions',
]

# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    # يجب أن يكون CorsMiddleware في أعلى القائمة
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',

    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = [
    "https://deduct-same-praising.ngrok-free.dev",
    "http://localhost:5173",
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True


# السماح بالـ Headers الافتراضية
# بالإضافة إلى Header الخاص بـ ngrok
CORS_ALLOW_HEADERS = list(default_headers) + [
    "ngrok-skip-browser-warning",
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = 'p_transportation_p.urls'


# ============================================================
# ASGI / WSGI
# ============================================================

ASGI_APPLICATION = 'p_transportation_p.asgi.application'

WSGI_APPLICATION = 'p_transportation_p.wsgi.application'


# ============================================================
# TEMPLATES
# ============================================================

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


# ============================================================
# CHANNELS / WEBSOCKETS
# ============================================================

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


# ============================================================
# DATABASE - MYSQL
# ============================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',

        'NAME': 'ptp',

        'USER': 'root',

        'PASSWORD': '',

        'HOST': '127.0.0.1',

        'PORT': '3306',

        'OPTIONS': {
            'charset': 'utf8mb4',

            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}


# ============================================================
# CUSTOM USER MODEL
# ============================================================

AUTH_USER_MODEL = 'PTP.User'


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = 'ar-sy'

TIME_ZONE = 'Asia/Damascus'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = '/static/'


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = '/media/'

MEDIA_ROOT = BASE_DIR / 'media'


# ============================================================
# OSRM ROUTING
# ============================================================

OSRM_BASE_URL = os.environ.get(
    'OSRM_BASE_URL',
    'https://router.project-osrm.org'
)

OSRM_PROFILE = os.environ.get(
    'OSRM_PROFILE',
    'driving'
)

GEOCODING_USER_AGENT = os.environ.get(
    'GEOCODING_USER_AGENT',
    'PublicTransportationPlatform/1.0'
)


# ============================================================
# DAMASCUS ROUTE BOUNDS
# ============================================================

DAMASCUS_ROUTE_BOUNDS = {
    'min_latitude': '33.200000',

    'max_latitude': '33.900000',

    'min_longitude': '35.900000',

    'max_longitude': '36.900000',
}


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Smart Public Transportation Platform API',
    'DESCRIPTION': 'API documentation for the Smart Public Transportation Platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,

    'SECURITY': [
        {
            'TokenAuth': [],
        }
    ],

    'COMPONENT_SPLIT_REQUEST': True,
}