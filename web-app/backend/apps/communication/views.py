from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Announcement, MessageThread, DirectMessage

class CommunicationFeedView(APIView):
    def get(self, request):
        # 1. Pinned Announcement matching Figma
        pinned = {
            "id": 1,
            "title": "Mid-Term Examination Notice",
            "sender_name": "Bright Future Academy",
            "content": "Dear Parents, please be informed that the mid-term examinations will begin on Monday, September 21st, 2026.",
            "category": "Announcements",
            "date_display": "Today • 9:15 AM",
            "is_pinned": True
        }

        # 2. Direct Message Threads matching Figma
        threads = [
            {
                "id": 1,
                "sender_name": "Mr. James Aryee",
                "role": "Mathematics Teacher",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
                "regarding": "Daniel Mensah • JHS 2",
                "last_message": '"Daniel has shown good improvement in Mathematics. I would recommend..."',
                "time_display": "10:24 AM",
                "unread": True,
                "category": "Teachers"
            },
            {
                "id": 2,
                "sender_name": "Mrs. Ama Boateng",
                "role": "Class Teacher",
                "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60",
                "regarding": "Daniel Mensah • JHS 2",
                "last_message": '"Please remember that the class PTA meeting is scheduled for Friday."',
                "time_display": "Yesterday",
                "unread": False,
                "category": "Teachers"
            },
            {
                "id": 3,
                "sender_name": "School Administration",
                "role": "Bright Future Academy",
                "avatar": "",
                "regarding": "School Wide Notice",
                "last_message": '"Your child\'s academic report for the current term is now available."',
                "time_display": "Aug 05",
                "unread": False,
                "category": "School"
            }
        ]

        return Response({
            "pinned_announcement": pinned,
            "threads": threads
        }, status=status.HTTP_200_OK)

class ThreadChatDetailView(APIView):
    def get(self, request, thread_id):
        # Hardcoded conversation matching Figma "Message Detail (Chat).png"
        chat_data = {
            "thread_id": thread_id,
            "recipient_name": "Mr. James Aryee",
            "recipient_role": "Mathematics Teacher",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
            "regarding": "Daniel Mensah • JHS 2",
            "messages": [
                {
                    "id": 1,
                    "sender_type": "PARENT",
                    "text": "Good morning, Mr. Mensah. I noticed Daniel's Mathematics score has improved. Is there anything specific you recommend he works on at home?",
                    "time": "9:18 AM",
                    "read": True
                },
                {
                    "id": 2,
                    "sender_type": "TEACHER",
                    "text": "Good morning, Ama. Yes, his understanding has improved. I recommend that he continues practicing algebraic problems and spends some additional time reviewing the recent class exercises.",
                    "time": "9:24 AM",
                    "read": True
                },
                {
                    "id": 3,
                    "sender_type": "PARENT",
                    "text": "Thank you. I'll make sure he spends more time on those areas.",
                    "time": "9:31 AM",
                    "read": True
                },
                {
                    "id": 4,
                    "sender_type": "TEACHER",
                    "text": "You're welcome. I'll continue monitoring his progress and keep you updated.",
                    "time": "9:35 AM",
                    "read": True
                }
            ]
        }
        return Response(chat_data, status=status.HTTP_200_OK)

class SendMessageView(APIView):
    def post(self, request):
        return Response({"message": "Message sent successfully!"}, status=status.HTTP_201_CREATED)

class ParentNotificationsListView(APIView):
    def get(self, request):
        data = {
            "unread_count": 2,
            "sections": [
                {
                    "timeframe": "TODAY",
                    "items": [
                        {
                            "id": 101,
                            "type": "RESULT",
                            "title": "New Academic Result",
                            "description": "Daniel Mensah's Mathematics result has been updated.",
                            "time": "10:45 AM",
                            "is_unread": True,
                            "is_important": False,
                            "icon_type": "academic"
                        },
                        {
                            "id": 102,
                            "type": "MESSAGE",
                            "title": "New Message from Mr. Kofi Mensah",
                            "description": "You have received a new message regarding Daniel's Mathematics progress.",
                            "time": "09:15 AM",
                            "is_unread": True,
                            "is_important": False,
                            "icon_type": "message"
                        }
                    ]
                },
                {
                    "timeframe": "YESTERDAY",
                    "items": [
                        {
                            "id": 103,
                            "type": "FEE",
                            "title": "Fee Payment Reminder",
                            "description": "GHS 1,250 remains outstanding for Daniel Mensah.",
                            "time": "Yesterday, 4:30 PM",
                            "is_unread": False,
                            "is_important": True,
                            "icon_type": "alert"
                        },
                        {
                            "id": 104,
                            "type": "ANNOUNCEMENT",
                            "title": "Mid-Term Examination Notice",
                            "description": "Mid-term examinations begin on August 12, 2026.",
                            "time": "Yesterday, 11:00 AM",
                            "is_unread": False,
                            "is_important": False,
                            "icon_type": "calendar"
                        }
                    ]
                },
                {
                    "timeframe": "EARLIER",
                    "items": [
                        {
                            "id": 105,
                            "type": "PAYMENT",
                            "title": "Payment Successful",
                            "description": "Your payment of GHS 1,000 has been successfully recorded.",
                            "time": "Mon, 10:00 AM",
                            "is_unread": False,
                            "is_important": False,
                            "icon_type": "check"
                        },
                        {
                            "id": 106,
                            "type": "ATTENDANCE",
                            "title": "Attendance Update",
                            "description": "Daniel was marked absent from school today.",
                            "time": "Last Friday, 08:30 AM",
                            "is_unread": False,
                            "is_important": False,
                            "icon_type": "info"
                        }
                    ]
                }
            ]
        }
        return Response(data, status=status.HTTP_200_OK)

class AnnouncementDetailView(APIView):
    def get(self, request, id=None):
        announcement = {
            "id": 1,
            "title": "Mid-Term Examination Timetable",
            "publisher": "Bright Future Academy",
            "published_date": "August 7, 2026 • 9:15 AM",
            "audience": "JHS 1–3 Parents",
            "content_paragraphs": [
                "Dear Parents and Guardians,",
                "Please be informed that the Mid-Term Examinations for Junior High School (JHS 1–3) will commence on Monday, August 12, 2026.",
                "We encourage you to review the detailed timetable attached below and ensure your ward is adequately prepared. Adequate rest and a balanced diet during this period are highly recommended to support their performance.",
                "Should you have any questions regarding the schedule, please do not hesitate to contact the academic office.",
                "Best regards,\nAcademic Directorate\nBright Future Academy"
            ],
            "important_dates": [
                {"label": "Examinations Begin", "sub": "Core Subjects Focus", "date": "Aug 12, 2026"},
                {"label": "Examinations End", "sub": "Electives Finalized", "date": "Aug 16, 2026"},
                {"label": "Parent Consultation", "sub": "Review Results", "date": "Aug 28, 2026"}
            ],
            "action_required": {
                "text": "Please review the examination timetable and ensure Daniel is prepared for each subject.",
                "button_text": "View Timetable"
            },
            "attachment": {
                "filename": "Mid-Term Examination Timetable.pdf",
                "filesize": "PDF • 245 KB"
            }
        }
        return Response(announcement, status=status.HTTP_200_OK)