from django.urls import path
from .views import (
    ClassRoomListCreateView,
    SubjectListCreateView,
    AssessmentListCreateView,
    AssessmentPerformanceOverviewView,
    BulkGradeSaveView,
    GradeBulkSaveView,
    TeacherPerformanceInsightsView,
    StudentResultDetailView,
    SystemAnalyticsOverviewView,
    GenerateStudentReportCardPDFView,
    ParentAcademicPerformanceOverviewView,
    ParentSubjectResultDetailView,
    SchoolIntelligenceOverviewView,
    SchoolReportPreviewView
)

urlpatterns = [
    path('classrooms/', ClassRoomListCreateView.as_view(), name='classroom-list-create'),
    path('subjects/', SubjectListCreateView.as_view(), name='subject-list-create'),
    path('assessments/', AssessmentListCreateView.as_view(), name='assessment-list-create'),
    path('overview/<int:assessment_id>/', AssessmentPerformanceOverviewView.as_view(), name='assessment-overview'),
    path('save-grades/', BulkGradeSaveView.as_view(), name='bulk-grade-save'),
    path('grade-bulk-save/', GradeBulkSaveView.as_view(), name='grade-bulk-save'),
    path('insights/<int:student_id>/', TeacherPerformanceInsightsView.as_view(), name='teacher-insights'),
    path('results/student/<int:student_id>/', StudentResultDetailView.as_view(), name='student-result-detail'),
    path('analytics/', SystemAnalyticsOverviewView.as_view(), name='system-analytics'),
    path('report-card/pdf/<int:student_id>/', GenerateStudentReportCardPDFView.as_view(), name='generate-report-card-pdf'),
    path('parent/performance/', ParentAcademicPerformanceOverviewView.as_view(), name='parent-performance-overview'),
    path('parent/result-detail/', ParentSubjectResultDetailView.as_view(), name='parent-subject-result-detail'),
    path('intelligence/overview/', SchoolIntelligenceOverviewView.as_view(), name='school-intelligence-overview'),
    path('intelligence/preview/', SchoolReportPreviewView.as_view(), name='school-report-preview'),
]