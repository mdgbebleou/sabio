from rest_framework import serializers
from .models import Subject, ClassRoom, Assessment, Grade

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code']

class ClassRoomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='class_teacher.get_full_name')

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'class_teacher', 'teacher_name']

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.first_name')
    student_last_name = serializers.ReadOnlyField(source='student.last_name')
    student_admission_id = serializers.ReadOnlyField(source='student.admission_number')
    total_score = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    remark = serializers.ReadOnlyField()

    class Meta:
        model = Grade
        fields = [
            'id', 
            'student', 
            'student_name', 
            'student_last_name',
            'student_admission_id',
            'assessment', 
            'ca_score', 
            'exam_score', 
            'total_score', 
            'letter_grade', 
            'remark',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class AssessmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    student_grades = GradeSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = [
            'id', 
            'title', 
            'subject', 
            'subject_name', 
            'classroom', 
            'classroom_name', 
            'academic_year', 
            'term', 
            'status',
            'student_grades'
        ]