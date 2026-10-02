from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.students.models import Student

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'
        PARENT = 'PARENT', 'Parent'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ADMIN)

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    phone_number = models.CharField(max_length=20, blank=True)
    wards = models.ManyToManyField(Student, related_name='parents')

    def __str__(self):
        return f"Parent: {self.user.get_full_name() or self.user.username}"