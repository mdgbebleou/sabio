from django.db import models
from django.conf import settings

class Student(models.Model):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        ATTENTION_REQUIRED = 'ATTENTION_REQUIRED', 'Attention Required'

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    admission_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    # Class association
    classroom = models.ForeignKey(
        'academics.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )

    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wards',
        limit_choices_to={'role': 'PARENT'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.admission_number})"