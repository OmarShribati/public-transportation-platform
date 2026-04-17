#!/usr/bin/env python
"""Validation script to check project setup and imports."""
import os
import sys

project_root = os.path.dirname(__file__)
sys.path.insert(0, project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'p_transportation_p.settings')


def test_imports():
    try:
        import django
        django.setup()

        from p_transportation_p.settings import INSTALLED_APPS
        from PTP.admin import UserAdmin
        from PTP.models.user import User
        from PTP.models.user_manager import UserManager
        from PTP.serializers.registration_serializers import UserRegistrationSerializer
        from PTP.services.account_service import AccountService
        from PTP.views.auth_views import RegistrationView

        print('Main project settings imported successfully')
        print('PTP app modules imported successfully')
        print('Installed apps:', INSTALLED_APPS)
        return True
    except ImportError as exc:
        print(f'Import error: {exc}')
        return False


if __name__ == '__main__':
    success = test_imports()
    sys.exit(0 if success else 1)