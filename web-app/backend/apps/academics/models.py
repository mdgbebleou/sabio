from django.db import models
from django.conf import settings
from apps.students.models import Student

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ClassRoom(models.Model):
    name = models.CharField(max_length=50) # e.g. JHS 2A
    class_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'TEACHER'},
        related_name='assigned_classes'
    )

    def __str__(self):
        return self.name

class Assessment(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SUBMITTED = 'SUBMITTED', 'Submitted'

    title = models.CharField(max_length=100) # e.g., Second Term Examination
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assessments')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='assessments')
    academic_year = models.CharField(max_length=20, default='2025/2026')
    term = models.CharField(max_length=20, default='Second Term')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    def __str__(self):
        return f"{self.classroom.name} - {self.subject.name} ({self.title})"

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='student_grades')
    ca_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # Out of 30
    exam_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # Out of 70
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'assessment']

    @property
    def total_score(self):
        return float(self.ca_score) + float(self.exam_score)

    @property
    def letter_grade(self):
        score = self.total_score
        if score >= 80: return 'A'
        if score >= 70: return 'B'
        if score >= 60: return 'C'
        if score >= 50: return 'D'
        return 'F'

    @property
    def remark(self):
        score = self.total_score
        if score >= 80: return 'Excellent'
        if score >= 70: return 'Very Good'
        if score >= 60: return 'Good'
        if score >= 50: return 'Pass'
        return 'Needs Improvement'

    def __str__(self):
        return f"{self.student.first_name} - Total: {self.total_score}% ({self.letter_grade})"