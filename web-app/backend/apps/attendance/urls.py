from django.urls import path
from .views import AttendanceBulkSaveView, AttendanceHistoryListView

urlpatterns = [
    path('bulk-save/', AttendanceBulkSaveView.as_view(), name='attendance-bulk-save'),
    path('history/', AttendanceHistoryListView.as_view(), name='attendance-history'),
]