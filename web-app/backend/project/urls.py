from django.contrib import admin
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib import admin
from django.urls import path, include

class APIRootView(APIView):
    def get(self, request):
        return Response({
            "system": "Integrated School Management System API",
            "status": "Online",
            "version": "1.0.0",
            "available_endpoints": {
                "admin": "/admin/",
                "auth": "/api/token/",
                "users": "/api/users/",
                "students": "/api/students/",
                "academics": "/api/academics/",
                "finance": "/api/finance/",
                "attendance": "/api/attendance/",
                "communication": "/api/communication/"
            }
        }, status=status.HTTP_200_OK)

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/academics/', include('apps.academics.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/communication/', include('apps.communication.urls')),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
]