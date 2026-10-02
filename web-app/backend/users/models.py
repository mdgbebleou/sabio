from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
        PARENT = 'PARENT', 'Parent'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ADMIN
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"