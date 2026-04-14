from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, phone, password=None, is_admin=False, account_status='active'):
        if not email:
            raise ValueError('Users must have an email address')
        if not full_name:
            raise ValueError('Users must have a full name')
        if not phone:
            raise ValueError('Users must have a phone number')

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            full_name=full_name,
            phone=phone,
            is_admin=is_admin,
            account_status=account_status,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, phone, password=None):
        if self.model.objects.filter(is_admin=True).exists():
            raise ValueError('Only one admin account is allowed')
        user = self.create_user(email, full_name, phone, password=password, is_admin=True, account_status='active')
        user.is_superuser = True
        user.save(using=self._db)
        return user
