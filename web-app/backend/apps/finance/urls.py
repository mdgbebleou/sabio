from django.urls import path
from .views import (
    FeeStructureListCreateView,
    StudentInvoiceListCreateView,
    PaymentRecordListCreateView,
    DefaulterTrackerListView,
    GenerateFeeReceiptPDFView
)

urlpatterns = [
    path('fee-structures/', FeeStructureListCreateView.as_view(), name='fee-structure-list-create'),
    path('invoices/', StudentInvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('payments/', PaymentRecordListCreateView.as_view(), name='payment-list-create'),
    path('defaulters/', DefaulterTrackerListView.as_view(), name='defaulter-list'),
    path('receipt/pdf/<int:transaction_id>/', GenerateFeeReceiptPDFView.as_view(), name='generate-fee-receipt-pdf'),
]