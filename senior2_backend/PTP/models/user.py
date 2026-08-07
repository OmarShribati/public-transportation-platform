from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models

from PTP.models.user_manager import UserManager


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_PASSENGER = 'passenger'
    ROLE_MERCHANT = 'merchant'
    ROLE_ADMIN = 'admin'

    ROLE_CHOICES = [
        (ROLE_PASSENGER, 'Passenger'),
        (ROLE_MERCHANT, 'Merchant'),
        (ROLE_ADMIN, 'Admin'),
    ]

    id = models.AutoField(primary_key=True, db_column='user_id')
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    password = models.CharField(max_length=128, db_column='password_hash')

    is_admin = models.BooleanField(default=False)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_PASSENGER,
    )

    account_status = models.CharField(
        max_length=50,
        default='active',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone']

    objects = UserManager()

    class Meta:
        db_table = 'user'

    @property
    def is_staff(self):
        return self.is_admin

    @property
    def is_active(self):
        return self.account_status == 'active'

    @property
    def is_passenger(self):
        return self.role == self.ROLE_PASSENGER

    @property
    def is_merchant(self):
        return self.role == self.ROLE_MERCHANT

    def clean(self):
        super().clean()

        if self.is_admin:
            admin_exists = User.objects.filter(is_admin=True)

            if self.pk:
                admin_exists = admin_exists.exclude(pk=self.pk)

            if admin_exists.exists():
                raise ValidationError({
                    'is_admin': 'Only one admin account is allowed.'
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class MerchantProfile(models.Model):

    merchant = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='merchant_profile',
        limit_choices_to={'role': User.ROLE_MERCHANT},
    )

    address = models.CharField(
        max_length=255,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = 'merchant_profile'

    def __str__(self):
        return f'{self.merchant.full_name} - Merchant Profile'