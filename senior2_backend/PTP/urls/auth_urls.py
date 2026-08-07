# from django.urls import path

# from PTP.views import LoginView, LogoutView, RegistrationView


# urlpatterns = [
#     path('register/', RegistrationView.as_view(), name='auth-register'),
#     path('login/', LoginView.as_view(), name='auth-login'),
#     path('logout/', LogoutView.as_view(), name='auth-logout'),
# ]

from django.urls import path

# from PTP.views.auth_views import (
#     LoginView,
#     LogoutView,
#     RegistrationView
# )
from PTP.views.auth_views import LoginView, RegistrationView
from PTP.views.logout_views import LogoutView
urlpatterns = [
    path('register', RegistrationView.as_view(), name='auth-register'),
    path('login', LoginView.as_view(), name='auth-login'),
    path('logout', LogoutView.as_view(), name='auth-logout'),
]