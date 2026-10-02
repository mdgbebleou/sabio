from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer
from apps.academics.models import ClassRoom
from apps.students.models import Student
from users.permissions import IsAdminUserRole, IsTeacherUserRole

class AttendanceBulkSaveView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def post(self, request):
        classroom_id = request.data.get('classroom_id')
        date_str = request.data.get('date')  # Format: YYYY-MM-DD
        records_data = request.data.get('records', [])

        try:
            classroom = ClassRoom.objects.get(id=classroom_id)
        except ClassRoom.DoesNotExist:
            return Response({"error": "Classroom not found"}, status=status.HTTP_404_NOT_FOUND)

        session, _ = AttendanceSession.objects.get_or_create(
            classroom=classroom,
            date=date_str,
            defaults={'recorded_by': request.user}
        )

        for item in records_data:
            student_id = item.get('student_id')
            record_status = item.get('status', 'PRESENT')
            remark = item.get('remark', '')

            AttendanceRecord.objects.update_or_create(
                session=session,
                student_id=student_id,
                defaults={'status': record_status, 'remark': remark}
            )

        return Response({"message": "Daily attendance saved successfully!"}, status=status.HTTP_200_OK)

class AttendanceHistoryListView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        classroom_id = request.query_params.get('classroom_id')
        sessions = AttendanceSession.objects.all().order_by('-date')

        if classroom_id:
            sessions = sessions.filter(classroom_id=classroom_id)

        history = []
        for sess in sessions:
            total_students = Student.objects.filter(classroom=sess.classroom).count()
            present_cnt = sess.records.filter(status='PRESENT').count()
            absent_cnt = sess.records.filter(status='ABSENT').count()
            late_cnt = sess.records.filter(status='LATE').count()

            history.append({
                "id": sess.id,
                "date": sess.date.strftime('%b %d, %Y'),
                "raw_date": sess.date.strftime('%Y-%m-%d'),
                "class_name": sess.classroom.name,
                "total_students": total_students,
                "present": present_cnt,
                "absent": absent_cnt,
                "late": late_cnt,
                "status": "Recorded"
            })

        return Response(history, status=status.HTTP_200_OK)