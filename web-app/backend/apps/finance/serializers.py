from rest_framework import serializers
from .models import FeeStructure, FeeItem, StudentInvoice, Payment

class FeeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeItem
        fields = ['id', 'name', 'amount']


class FeeStructureSerializer(serializers.ModelSerializer):
    items = FeeItemSerializer(many=True, read_only=True)
    total_amount = serializers.ReadOnlyField()
    class_name = serializers.CharField(source='classroom.name', read_only=True)
    students_assigned_count = serializers.SerializerMethodField()

    class Meta:
        model = FeeStructure
        fields = ['id', 'name', 'academic_year', 'term', 'classroom', 'class_name', 'status', 'total_amount', 'students_assigned_count', 'items']

    def get_students_assigned_count(self, obj):
        return obj.classroom.students.count() if obj.classroom else 0


class StudentInvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    student_last_name = serializers.CharField(source='student.last_name', read_only=True)
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    fee_structure_name = serializers.CharField(source='fee_structure.name', read_only=True)

    class Meta:
        model = StudentInvoice
        fields = ['id', 'student', 'student_name', 'student_last_name', 'admission_number', 'fee_structure', 'fee_structure_name', 'total_amount', 'amount_paid', 'balance_due']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'amount_paid', 'payment_method', 'reference_number', 'payment_date']