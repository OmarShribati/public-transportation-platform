from django.urls import path

from PTP.views import LoginView, LogoutView, RegistrationView


urlpatterns = [
    path('register', RegistrationView.as_view(), name='auth-register'),
    path('login', LoginView.as_view(), name='auth-login'),
    path('logout', LogoutView.as_view(), name='auth-logout'),
]
