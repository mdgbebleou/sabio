from django.urls import path
from .views import CommunicationFeedView, ThreadChatDetailView, SendMessageView

urlpatterns = [
    path('feed/', CommunicationFeedView.as_view(), name='communication-feed'),
    path('threads/<int:thread_id>/', ThreadChatDetailView.as_view(), name='thread-chat-detail'),
    path('send/', SendMessageView.as_view(), name='send-message'),
]
from django.urls import path
from .views import (
    CommunicationFeedView, 
    ThreadChatDetailView, 
    SendMessageView,
    ParentNotificationsListView,
    AnnouncementDetailView
)

urlpatterns = [
    path('feed/', CommunicationFeedView.as_view(), name='communication-feed'),
    path('threads/<int:thread_id>/', ThreadChatDetailView.as_view(), name='thread-chat-detail'),
    path('send/', SendMessageView.as_view(), name='send-message'),
    path('notifications/', ParentNotificationsListView.as_view(), name='notifications-list'),
    path('announcements/detail/', AnnouncementDetailView.as_view(), name='announcement-detail'),
]