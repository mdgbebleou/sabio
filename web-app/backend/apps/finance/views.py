import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


class FeeStructureListCreateView(APIView):
    def get(self, request):
        data = [
            {"id": 1, "name": "Tuition Fee - JHS", "amount": 1500.00, "term": "Term 1"},
            {"id": 2, "name": "PTA Levy", "amount": 150.00, "term": "Term 1"},
            {"id": 3, "name": "ICT & Practical Lab Fee", "amount": 100.00, "term": "Term 1"}
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({"message": "Fee structure created successfully"}, status=status.HTTP_201_CREATED)


class StudentInvoiceListCreateView(APIView):
    def get(self, request):
        data = [
            {"id": 1, "student_name": "Daniel Mensah", "invoice_no": "INV-2026-001", "total_amount": 1750.00, "paid_amount": 1250.00, "status": "PARTIAL"},
            {"id": 2, "student_name": "Grace Addo", "invoice_no": "INV-2026-002", "total_amount": 1750.00, "paid_amount": 1750.00, "status": "PAID"}
        ]
        return Response(data, status=status.HTTP_200_OK)


class PaymentRecordListCreateView(APIView):
    def get(self, request):
        data = [
            {"id": 9482, "student_name": "Daniel Mensah", "amount_paid": 1250.00, "date": "2026-08-10", "mode": "Mobile Money"}
        ]
        return Response(data, status=status.HTTP_200_OK)


class DefaulterTrackerListView(APIView):
    def get(self, request):
        data = [
            {"id": 1, "student_name": "Kofi Osei", "classroom": "JHS 2", "balance_due": 850.00, "days_overdue": 45}
        ]
        return Response(data, status=status.HTTP_200_OK)


class GenerateFeeReceiptPDFView(APIView):
    def get(self, request, transaction_id=None):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#1e3a8a'), alignment=1)
        subtitle_style = ParagraphStyle('SubTitleStyle', parent=styles['Normal'], fontSize=10, leading=13, textColor=colors.HexColor('#64748b'), alignment=1)
        header_style = ParagraphStyle('HeaderStyle', parent=styles['Heading2'], fontSize=12, leading=15, textColor=colors.HexColor('#0f172a'))

        # Document Header
        story.append(Paragraph("<b>BRIGHT FUTURE ACADEMY</b>", title_style))
        story.append(Paragraph("Official Payment Receipt • Financial Directorate", subtitle_style))
        story.append(Spacer(1, 15))

        # Receipt Info Table
        receipt_info = [
            ["Receipt No:", f"REC-2026-{transaction_id or '9482'}", "Date:", "August 10, 2026"],
            ["Student Name:", "Daniel Mensah", "Admission No:", "ST00124"],
            ["Classroom:", "JHS 2", "Payment Mode:", "Mobile Money (MTN MoMo)"]
        ]
        t_receipt = Table(receipt_info, colWidths=[100, 160, 100, 160])
        t_receipt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0f172a')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0'))
        ]))
        story.append(t_receipt)
        story.append(Spacer(1, 15))

        # Itemized Payment Table
        story.append(Paragraph("<b>Payment Breakdown</b>", header_style))
        story.append(Spacer(1, 8))

        items = [
            ["Description", "Billed Amount", "Amount Paid"],
            ["Tuition Fee (Term 2)", "GHS 1,500.00", "GHS 1,000.00"],
            ["PTA Levy", "GHS 150.00", "GHS 150.00"],
            ["ICT & Practical Lab Fee", "GHS 100.00", "GHS 100.00"],
            ["TOTAL PAID TODAY", "", "GHS 1,250.00"]
        ]
        t_items = Table(items, colWidths=[260, 130, 130])
        t_items.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('ALIGN', (1,0), (2,-1), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#dcfce7')),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ]))
        story.append(t_items)
        story.append(Spacer(1, 15))

        # Balance Summary
        summary_data = [
            ["Total Academic Fee:", "GHS 2,250.00"],
            ["Total Cumulative Paid:", "GHS 1,250.00"],
            ["Outstanding Balance:", "GHS 1,000.00"]
        ]
        t_summary = Table(summary_data, colWidths=[380, 140])
        t_summary.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('FONTNAME', (0,2), (-1,2), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0,2), (-1,2), colors.HexColor('#dc2626')),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 25))

        # Authorization Stamp Block
        auth_data = [
            ["___________________________", "___________________________"],
            ["Accounts Officer Signature", "Official Institutional Stamp"]
        ]
        t_auth = Table(auth_data, colWidths=[260, 260])
        t_auth.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#64748b'))
        ]))
        story.append(t_auth)

        doc.build(story)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Receipt_REC-2026-{transaction_id or "9482"}.pdf"'
        response.write(pdf)
        return response