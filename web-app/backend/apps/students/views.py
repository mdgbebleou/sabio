from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Student
from .serializers import StudentSerializer
from users.permissions import IsAdminUserRole, IsTeacherUserRole

class StudentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get_queryset(self):
        queryset = Student.objects.all()
        search = self.request.query_params.get('search', None)
        class_id = self.request.query_params.get('class_id', None)
        status = self.request.query_params.get('status', None)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(admission_number__icontains=search)
            )
        if class_id:
            queryset = queryset.filter(classroom_id=class_id)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

class StudentOverviewMetricsView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        total = Student.objects.count()
        active = Student.objects.filter(status='ACTIVE').count()
        flagged = Student.objects.filter(status='ATTENTION_REQUIRED').count()

        return Response({
            "metrics": {
                "total_students": total,
                "active_students": active,
                "new_this_term": 38,  # Dynamic calculation can be added based on term dates
                "attention_required": flagged
            },
            "risk_overview": {
                "academic_risk": 12,
                "attendance_risk": 18,
                "fee_risk": 23,
                "incomplete_records": 14
            }
        })

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUserRole]