from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.first_name')
    student_last_name = serializers.ReadOnlyField(source='student.last_name')
    student_admission_id = serializers.ReadOnlyField(source='student.admission_number')

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'student',
            'student_name',
            'student_last_name',
            'student_admission_id',
            'status',
            'remark'
        ]

class AttendanceSessionSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    records = AttendanceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id',
            'classroom',
            'classroom_name',
            'date',
            'recorded_by',
            'records',
            'created_at'
        ]