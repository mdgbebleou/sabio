from django.urls import path
from .views import StudentListCreateView, StudentDetailView, StudentOverviewMetricsView

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='student-list-create'),
    path('metrics/', StudentOverviewMetricsView.as_view(), name='student-metrics'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
]