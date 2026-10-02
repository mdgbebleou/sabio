from django.db import models
from django.conf import settings
from apps.students.models import Student

class Announcement(models.Model):
    title = models.CharField(max_length=255)
    sender_name = models.CharField(max_length=100, default="Bright Future Academy")
    content = models.TextField()
    category = models.CharField(max_length=50, default="Announcements")
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{'[PINNED] ' if self.is_pinned else ''}{self.title}"

class MessageThread(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='message_threads')
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parent_threads')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_threads')
    subject = models.CharField(max_length=255)
    last_message_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Thread: {self.subject} ({self.student.first_name})"

class DirectMessage(models.Model):
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"From {self.sender.username} at {self.created_at.strftime('%H:%M')}"
