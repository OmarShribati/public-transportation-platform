from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models

from PTP.models.user_manager import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, db_column='user_id')
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    password = models.CharField(max_length=128, db_column='password_hash')
    is_admin = models.BooleanField(default=False)
    account_status = models.CharField(max_length=50, default='active')
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
        return not self.is_admin

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
