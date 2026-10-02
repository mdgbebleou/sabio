from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.students.models import Student
from users.permissions import IsAdminUserRole, IsTeacherUserRole

class ClassRoomListCreateView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        classrooms = [
            {"id": 1, "name": "Form 2A", "level": "JHS 2"},
            {"id": 2, "name": "Form 3A", "level": "JHS 3"},
            {"id": 3, "name": "Form 1A", "level": "SHS 1"}
        ]
        return Response(classrooms, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({"message": "Classroom created successfully"}, status=status.HTTP_201_CREATED)

class SubjectListCreateView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        subjects = [
            {"id": 1, "name": "Integrated Science", "code": "SCI101"},
            {"id": 2, "name": "Mathematics", "code": "MTH101"},
            {"id": 3, "name": "English Language", "code": "ENG101"},
            {"id": 4, "name": "Social Studies", "code": "SOC101"},
            {"id": 5, "name": "Information Tech.", "code": "ICT101"},
            {"id": 6, "name": "French", "code": "FRN101"},
            {"id": 7, "name": "Religious & Moral Ed.", "code": "RME101"},
            {"id": 8, "name": "Creative Arts", "code": "ART101"}
        ]
        return Response(subjects, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({"message": "Subject created successfully"}, status=status.HTTP_201_CREATED)

class AssessmentListCreateView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        assessments = [
            {"id": 1, "name": "Mid-Term Examination", "term": "Second Term", "weight": 40},
            {"id": 2, "name": "Classwork & Quizzes", "term": "Second Term", "weight": 30},
            {"id": 3, "name": "End of Term Exam", "term": "Second Term", "weight": 30}
        ]
        return Response(assessments, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({"message": "Assessment created successfully"}, status=status.HTTP_201_CREATED)

class AssessmentPerformanceOverviewView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request, assessment_id):
        return Response({"message": "Overview data active"}, status=status.HTTP_200_OK)

class BulkGradeSaveView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def post(self, request):
        return Response({"message": "Grades saved successfully"}, status=status.HTTP_200_OK)

class GradeBulkSaveView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def post(self, request):
        return Response({"message": "Grades saved successfully"}, status=status.HTTP_200_OK)

class TeacherPerformanceInsightsView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request, student_id):
        return Response({"message": "Insights active"}, status=status.HTTP_200_OK)

class StudentResultDetailView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request, student_id):
        return Response({
            "student_info": {
                "id": student_id,
                "name": "Daniel Mensah",
                "admission_number": "ST00124",
                "classroom": "JHS 2A",
                "term": "Second Term",
                "academic_year": "2025/2026",
                "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60"
            },
            "summary": {
                "overall_average": "81%",
                "overall_grade": "A",
                "class_position": "7 / 38",
                "subjects_taken": 8,
                "trend": {
                    "status": "Improving",
                    "term_1": 75,
                    "term_2": 81,
                    "term_3": None
                }
            },
            "subjects": [
                {"name": "Integrated Science", "ca_score": 27, "exam_score": 62, "total": "89%", "grade": "A", "remark": "Excellent performance"},
                {"name": "Mathematics", "ca_score": 25, "exam_score": 57, "total": "82%", "grade": "A", "remark": "Keep it up"},
                {"name": "English Language", "ca_score": 24, "exam_score": 55, "total": "79%", "grade": "B", "remark": "Very Good"},
                {"name": "Social Studies", "ca_score": 20, "exam_score": 52, "total": "72%", "grade": "B", "remark": "Good, but can improve"},
                {"name": "Information Tech.", "ca_score": 28, "exam_score": 60, "total": "88%", "grade": "A", "remark": "Excellent"},
                {"name": "French", "ca_score": 15, "exam_score": 50, "total": "65%", "grade": "C", "remark": "Requires more effort"},
                {"name": "Religious & Moral Ed.", "ca_score": 26, "exam_score": 59, "total": "85%", "grade": "A", "remark": "Excellent"},
                {"name": "Creative Arts", "ca_score": 22, "exam_score": 45, "total": "67%", "grade": "C", "remark": "Satisfactory"}
            ],
            "highlights": {
                "strongest": {"subject": "Integrated Science", "score": "89%", "grade": "A"},
                "improvement": {"subject": "French", "score": "65%", "grade": "C"},
                "grade_distribution": {"A": 4, "B": 2, "C": 2, "F": 0}
            },
            "remarks": "Daniel has shown remarkable improvement this term, especially in the Sciences and Information Technology. His overall average of 81% reflects consistent effort and a positive attitude towards learning. While his foundational subjects are strong, I recommend dedicating more study time to French and Creative Arts to achieve a more balanced academic profile. He is a polite and hardworking student who is a pleasure to have in class.",
            "record_info": {
                "status": "Official Result",
                "submitted_by": "Mr. Aryee",
                "submission_date": "Aug 12, 2026",
                "last_modified": "Aug 12, 2026",
                "is_locked": True
            }
        }, status=status.HTTP_200_OK)

import io
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class SystemAnalyticsOverviewView(APIView):
    permission_classes = [IsAdminUserRole | IsTeacherUserRole]

    def get(self, request):
        analytics_data = {
            "summary": {
                "total_students": 450,
                "overall_pass_rate": "94.2%",
                "average_score": "78.5%",
                "top_subject": "Integrated Science"
            },
            "grade_distribution": [
                {"grade": "Grade A", "count": 185, "percentage": 41},
                {"grade": "Grade B", "count": 140, "percentage": 31},
                {"grade": "Grade C", "count": 80, "percentage": 18},
                {"grade": "Grade D", "count": 30, "percentage": 7},
                {"grade": "Grade F", "count": 15, "percentage": 3}
            ],
            "subject_performance": [
                {"subject": "Integrated Science", "average": 84},
                {"subject": "Mathematics", "average": 79},
                {"subject": "English Language", "average": 81},
                {"subject": "Social Studies", "average": 76},
                {"subject": "Information Tech.", "average": 88}
            ]
        }
        return Response(analytics_data, status=status.HTTP_200_OK)

class GenerateStudentReportCardPDFView(APIView):
    def get(self, request, student_id):
        # Create in-memory buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        styles = getSampleStyleSheet()

        # Styles
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1e3a8a'), alignment=1)
        subtitle_style = ParagraphStyle('SubTitleStyle', parent=styles['Normal'], fontSize=11, leading=14, textColor=colors.HexColor('#64748b'), alignment=1)
        section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], fontSize=12, leading=16, textColor=colors.HexColor('#0f172a'))

        # Header
        story.append(Paragraph("<b>BRIGHT FUTURE ACADEMY</b>", title_style))
        story.append(Paragraph("Official Terminal Academic Report Card • Academic Year 2025/2026", subtitle_style))
        story.append(Spacer(1, 15))

        # Student Info Table
        info_data = [
            ["Student Name:", "Daniel Mensah", "Admission No:", "ST00124"],
            ["Classroom:", "JHS 2A", "Term:", "Second Term"],
            ["Class Position:", "7 of 38", "Overall Average:", "81% (Grade A)"]
        ]
        t_info = Table(info_data, colWidths=[100, 160, 100, 160])
        t_info.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0f172a')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0'))
        ]))
        story.append(t_info)
        story.append(Spacer(1, 15))

        # Subject Performance Table
        story.append(Paragraph("<b>Subject Performance Breakdown</b>", section_style))
        story.append(Spacer(1, 8))

        subject_data = [
            ["Subject", "CA (40%)", "Exam (60%)", "Total", "Grade", "Remark"],
            ["Integrated Science", "27", "62", "89%", "A", "Excellent performance"],
            ["Mathematics", "25", "57", "82%", "A", "Keep it up"],
            ["English Language", "24", "55", "79%", "B", "Very Good"],
            ["Social Studies", "20", "52", "72%", "B", "Good effort"],
            ["Information Tech.", "28", "60", "88%", "A", "Outstanding"],
            ["French", "15", "50", "65%", "C", "Needs improvement"],
            ["Religious & Moral Ed.", "26", "59", "85%", "A", "Excellent work"],
            ["Creative Arts", "22", "45", "67%", "C", "Satisfactory"]
        ]
        t_subject = Table(subject_data, colWidths=[130, 60, 60, 50, 50, 170])
        t_subject.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('ALIGN', (1,0), (4,-1), 'CENTER'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        story.append(t_subject)
        story.append(Spacer(1, 15))

        # Class Teacher Remarks
        story.append(Paragraph("<b>Class Teacher & Principal Remarks</b>", section_style))
        story.append(Spacer(1, 6))
        remark_text = "Daniel has shown remarkable progress this term, particularly in Science and Information Technology. His overall performance reflects consistent hard work and a positive learning attitude."
        story.append(Paragraph(f"<i>\"{remark_text}\"</i>", styles['Normal']))
        story.append(Spacer(1, 25))

        # Signatures
        sig_data = [
            ["___________________________", "___________________________"],
            ["Mr. James Aryee (Class Teacher)", "Dr. K. Mensah (School Principal)"]
        ]
        t_sig = Table(sig_data, colWidths=[260, 260])
        t_sig.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#475569'))
        ]))
        story.append(t_sig)

        # Build PDF
        doc.build(story)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="ReportCard_Daniel_Mensah.pdf"'
        response.write(pdf)
        return response

class ParentAcademicPerformanceOverviewView(APIView):
    def get(self, request, student_id=None):
        data = {
            "student_info": {
                "id": 1,
                "name": "Daniel Mensah",
                "classroom": "JHS 2",
                "academic_year": "2026 Academic Year",
                "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60"
            },
            "overall": {
                "score": 78,
                "status_label": "Good Progress",
                "previous_score": 74,
                "diff": "+4%"
            },
            "subjects": [
                {"name": "Mathematics", "score": 82, "status": "Good", "color": "#16a34a"},
                {"name": "English Language", "score": 76, "status": "Good", "color": "#16a34a"},
                {"name": "Integrated Science", "score": 79, "status": "Good", "color": "#16a34a"},
                {"name": "Social Studies", "score": 72, "status": "Good", "color": "#d97706"},
                {"name": "ICT", "score": 88, "status": "Excellent", "color": "#1e3a8a"}
            ]
        }
        return Response(data, status=status.HTTP_200_OK)

class ParentSubjectResultDetailView(APIView):
    def get(self, request, student_id=None, subject_name=None):
        data = {
            "student_info": {
                "name": "Daniel Mensah",
                "classroom": "JHS 2",
                "id_code": "BFA-2026-0142",
                "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60"
            },
            "assessment_info": {
                "title": "MID-TERM EXAMINATION",
                "subject": "Mathematics",
                "performance_badge": "Good Performance",
                "total_percentage": 82,
                "letter_grade": "A",
                "date": "August 2, 2026"
            },
            "comparison": {
                "improvement": "+6%",
                "class_average": "74%"
            },
            "score_breakdown": [
                {"label": "Classwork", "score": "18 / 20"},
                {"label": "Assignments", "score": "17 / 20"},
                {"label": "Class Tests", "score": "15 / 20"},
                {"label": "Mid-Term Examination", "score": "32 / 40"}
            ],
            "total_score": "82 / 100",
            "teacher_feedback": {
                "comment": "Daniel has shown good improvement in Mathematics this term. He demonstrates a strong understanding of the concepts covered. Continued practice with algebraic problem-solving is recommended.",
                "teacher_name": "Mr. James Aryee",
                "teacher_role": "Mathematics Teacher",
                "date": "Aug 3, 2026"
            },
            "intelligent_insight": "Daniel is currently performing above the expected level in Mathematics and has improved compared with his previous assessment.",
            "previous_results": [
                {"type": "Mid-Term Examination", "date": "Aug 02", "score": "82%"},
                {"type": "Class Test", "date": "Jul 20", "score": "76%"},
                {"type": "Assignment", "date": "Jul 12", "score": "79%"}
            ]
        }
        return Response(data, status=status.HTTP_200_OK)

class SchoolIntelligenceOverviewView(APIView):
    def get(self, request):
        data = {
            "kpis": {
                "students": {"value": "1,248", "diff": "+4.2%", "sub": "vs last term"},
                "academic_avg": {"value": "78.6%", "diff": "+3.8%", "sub": "Overall"},
                "attendance": {"value": "86.4%", "diff": "-2.1%", "status": "Needs Attention"},
                "revenue": {"value": "GHS 1.84M", "pct": 82},
                "parent_eng": {"value": "74%", "diff": "+9.6%", "sub": "Active App Users"},
                "teacher_act": {"value": "91%", "diff": "+4.1%", "sub": "Logins"}
            },
            "insights": [
                {"id": 1, "type": "ALERT", "title": "Mathematics performance declined by 7.2% in Form 2.", "tag": "Attention Required"},
                {"id": 2, "type": "INFO", "title": "18 students below 85% attendance threshold.", "tag": "Important"},
                {"id": 3, "type": "INFO", "title": "Outstanding balances increased by 14% - 62% in 3 classes.", "tag": "Important"},
                {"id": 4, "type": "TREND", "title": "Parent engagement increased to 81%.", "tag": "Positive Trend"}
            ],
            "correlations": [
                {"title": "Attendance vs Academics", "desc": "Students with attendance below 80% have academic scores averaging 12% lower than peers."},
                {"title": "Engagement vs Payments", "desc": "Highly engaged parent accounts correlate with higher timely payment rates for school fees."}
            ],
            "exceptions": [
                {"id": 1, "title": "18 Students below attendance threshold", "sub": "Across 5 different classes", "action": "Review List"},
                {"id": 2, "title": "Delayed result submissions", "sub": "Form 2B, Form 3A, Form 1C", "action": "Notify Teachers"},
                {"id": 3, "title": "124 Overdue Accounts", "sub": "Exceeding 30 days past due date", "action": "Send Reminders"}
            ]
        }
        return Response(data, status=status.HTTP_200_OK)

class SchoolReportPreviewView(APIView):
    def get(self, request):
        preview_data = {
            "report_title": "Report Preview: Term 1 Academic Performance",
            "document_id": "REP-894-2A",
            "generated_date": "Oct 24, 2026",
            "scope": "Entire School",
            "executive_summary": "Overall academic performance for Term 1 demonstrates a stable trajectory with an institutional average of 82.4%. Mathematics and Sciences show a 4% improvement over the previous term, correlating with the implementation of the new tutoring initiative.",
            "institutional_avg": "82.4%",
            "avg_diff": "+2.1%",
            "intelligent_insights": [
                {"type": "STEM", "title": "STEM Improvement", "desc": "Grade 10 Physics scores improved by 12% following the lab equipment upgrade. Trend is highly positive."},
                {"type": "ALERT", "title": "Attendance Correlation", "desc": "Students with < 90% attendance in Grade 8 History are averaging 15% below the class median."},
                {"type": "DATA", "title": "Data Quality Check", "desc": "Completeness: 96.5%", "warning": "3 classes missing mid-term grades"}
            ]
        }
        return Response(preview_data, status=status.HTTP_200_OK)