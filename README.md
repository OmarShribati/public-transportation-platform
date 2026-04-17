# Public Transportation Platform

A Django-based backend for a public transportation system with layered architecture and component-based design.

## Project Structure

```
public_transport_platform/
├── public_transport_platform/          # Main Django project
│   ├── __init__.py
│   ├── settings.py                     # Django settings with MySQL config
│   ├── urls.py                         # Main URL configuration
│   ├── wsgi.py                         # WSGI configuration
│   └── asgi.py                         # ASGI configuration
├── apps/                              # Apps directory containing all system components
│   ├── __init__.py
│   └── account_management/            # Account management component
│       ├── __init__.py
│       ├── admin.py                   # Django admin configuration
│       ├── apps.py                    # Django app configuration
│       ├── forms.py                   # Django forms
│       ├── urls.py                    # App URL configuration
│       ├── models/                    # Models package
│       │   ├── __init__.py
│       │   ├── user.py                # User model
│       │   └── user_manager.py        # User manager
│       ├── views/                     # Views package
│       │   ├── __init__.py
│       │   └── registration_view.py   # Registration API view
│       ├── serializers/               # Serializers package
│       │   ├── __init__.py
│       │   └── user_serializers.py    # User serializers
│       ├── services/                  # Services package
│       │   ├── __init__.py
│       │   └── account_service.py     # Account business logic
│       └── tests/                     # Tests package
│           ├── __init__.py
│           └── test_registration.py   # Registration tests
├── static/                            # Static files
├── templates/                         # Templates
├── media/                             # Media files
├── manage.py                          # Django management script
└── requirements.txt                   # Python dependencies
```

## Architecture

- **Layered Architecture**: Views → Services → Models
- **Component-based**: Each component (account_management) is self-contained with its own layers
- **Package Structure**: Each layer is organized as a Python package with individual files per class
- **Separation of Concerns**: Clear separation between presentation, business logic, and data access
- **Direct Model Access**: Services interact directly with Django models without repository abstraction layer
- **Modular Apps**: All system components are organized under `apps/` directory for better organization

## Architecture Notes

### Current Architecture: Monolithic with Modular Components ✅
**ما لدينا الآن هو الأفضل لمشروعك:**

- ✅ **هيكل منظم**: جميع المكونات في مجلد `apps/` للتنظيم الأفضل
- ✅ **معمارية طبقية**: Views → Services → Models
- ✅ **قاعدة بيانات مشتركة**: سهولة في الاستعلامات والعلاقات
- ✅ **نشر بسيط**: مشروع Django واحد
- ✅ **سهولة التطوير**: لا تعقيد في التواصل بين الخدمات

### Microservices Architecture (نهج مختلف) 🔄
**ليس ما نطبقه الآن:**

- 🔄 **خدمات منفصلة**: كل مكون خدمة مستقلة مع قاعدة بيانات منفصلة
- 🔄 **API منفصلة**: كل خدمة لها API خاص بها
- 🔄 **نشر مستقل**: كل خدمة تنشر بشكل منفصل
- 🔄 **تعقيد أكبر**: إدارة التواصل بين الخدمات، distributed transactions
- 🔄 **مناسب للمشاريع الكبيرة**: فرق تطوير منفصلة لكل خدمة

### لماذا مجلد `apps/`؟
- 📁 **تنظيم أفضل**: جميع مكونات النظام في مكان واحد
- 📁 **سهولة الإضافة**: إضافة مكونات جديدة (route_management, vehicle_management, etc.)
- 📁 **معيار Django**: متبع في مشاريع Django الكبيرة
- 📁 **فصل منطقي**: كل مكون له هيكله الخاص

**الخلاصة**: الهيكل الحالي مثالي لمتطلبات مشروعك! 🎯

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure MySQL Database**:
   Update `public_transport_platform/settings.py` with your MySQL credentials:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'public_transport_db',
           'USER': 'your_mysql_username',
           'PASSWORD': 'your_mysql_password',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

3. **Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

5. **Run Tests**:
   ```bash
   python manage.py test
   ```

6. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Account Management
- `POST /api/accounts/register/` - Register new user (passenger or driver)

## Database Schema

### CustomUser Table
- `email` (EmailField, unique)
- `full_name` (CharField)
- `phone` (CharField)
- `is_driver` (BooleanField)
- `is_passenger` (BooleanField)
- `is_admin` (BooleanField)
- `account_status` (CharField)
- `created_at` (DateTimeField)

## Development

- **Python Version**: 3.8+
- **Django Version**: 4.2.7
- **Database**: MySQL
- **API Framework**: Django REST Framework

## Testing

Run tests with:
```bash
python manage.py test account_management
```

## Deployment

1. Set `DEBUG = False` in settings.py
2. Configure production database settings
3. Set up static files serving
4. Configure allowed hosts
5. Use a production WSGI server (gunicorn, uwsgi)