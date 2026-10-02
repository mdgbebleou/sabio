from django.db import models
from django.conf import settings
from apps.students.models import Student
from apps.academics.models import ClassRoom

class AttendanceSession(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendance_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['classroom', 'date']

    def __str__(self):
        return f"{self.classroom.name} - {self.date}"

class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        LATE = 'LATE', 'Late'

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)
    remark = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['session', 'student']

    def __str__(self):
        return f"{self.student.first_name} - {self.session.date}: {self.status}"