import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'p_transportation_p.settings')

application = get_wsgi_application()