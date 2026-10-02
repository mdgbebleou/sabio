from rest_framework import serializers
from .models import Student
from django.db.models import Avg, Sum

class StudentSerializer(serializers.ModelSerializer):
    parent_name = serializers.ReadOnlyField(source='parent.get_full_name')
    class_name = serializers.ReadOnlyField(source='classroom.name')
    
    # Dynamic Figma Table Metrics
    academic_avg = serializers.SerializerMethodField()
    attendance_rate = serializers.SerializerMethodField()
    fee_status = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'admission_number', 
            'date_of_birth', 
            'gender', 
            'status',
            'classroom',
            'class_name',
            'parent', 
            'parent_name', 
            'academic_avg',
            'attendance_rate',
            'fee_status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_academic_avg(self, obj):
        avg = obj.grades.aggregate(Avg('score'))['score__avg']
        return round(avg, 1) if avg else 0.0

    def get_attendance_rate(self, obj):
        total = obj.attendance_records.count()
        if not total:
            return 100.0
        present = obj.attendance_records.filter(status='PRESENT').count()
        return round((present / total) * 100, 1)

    def get_fee_status(self, obj):
        paid = obj.payments.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0.0
        # Placeholder comparison logic (e.g., base target of $500)
        target = 500.00
        if paid >= target:
            return {"status": "PAID", "amount_due": 0.00}
        return {"status": "OVERDUE", "amount_due": target - float(paid)}