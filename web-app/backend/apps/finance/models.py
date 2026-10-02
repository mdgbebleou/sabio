from django.db import models
from django.contrib.auth import get_user_model
from apps.academics.models import ClassRoom
from apps.students.models import Student

User = get_user_model()

class FeeStructure(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('DRAFT', 'Draft'),
        ('ARCHIVED', 'Archived'),
    )

    name = models.CharField(max_length=150)  # e.g. JHS 2 — Second Term
    academic_year = models.CharField(max_length=20, default='2025/2026')
    term = models.CharField(max_length=20, default='Second Term')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='fee_structures')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def total_amount(self):
        return sum(item.amount for item in self.items.all())

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


class FeeItem(models.Model):
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100)  # e.g., Tuition Fee, ICT Lab, PTA Levy
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name}: GHS {self.amount}"


class StudentInvoice(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def update_balances(self):
        payments_sum = sum(p.amount_paid for p in self.payments.all())
        self.amount_paid = payments_sum
        self.balance_due = self.total_amount - payments_sum
        self.save()


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('MOBILE_MONEY', 'Mobile Money'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CASH', 'Cash'),
        ('CHEQUE', 'Cheque'),
    )

    invoice = models.ForeignKey(StudentInvoice, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='MOBILE_MONEY')
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.invoice.update_balances()