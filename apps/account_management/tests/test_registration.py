from django.test import TestCase
from django.urls import reverse

from apps.account_management.models.user import User


class AccountRegistrationTests(TestCase):
    def test_register_passenger(self):
        data = {
            'email': 'passenger@example.com',
            'full_name': 'Passenger One',
            'phone': '1234567890',
            'password': 'StrongPassword123',
        }
        response = self.client.post(reverse('account-register'), data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.first()
        self.assertTrue(user.is_passenger)

    def test_register_driver(self):
        data = {
            'email': 'driver@example.com',
            'full_name': 'Driver One',
            'phone': '0987654321',
            'password': 'StrongPassword123',
            'role': 'driver',
        }
        response = self.client.post(reverse('account-register'), data)
        self.assertEqual(response.status_code, 201)
        user = User.objects.first()
        self.assertTrue(user.is_driver)
