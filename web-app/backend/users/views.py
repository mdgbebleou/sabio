from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

# 1. LOGIN VIEW (FUNCTION-BASED)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.email,
            'first_name': user.first_name,
            'role': getattr(user, 'role', 'ADMIN')
        })
    return Response({'error': 'Invalid credentials'}, status=400)


# 2. USER LIST VIEW (FUNCTION-BASED)
@api_view(['GET'])
@permission_classes([AllowAny])
def user_list(request):
    users = User.objects.all()
    user_data = []
    
    for u in users:
        user_data.append({
            'id': str(u.id),
            'custom_id': getattr(u, 'custom_id', f"USR-{u.id}"),
            'first_name': u.first_name or u.username.split('@')[0],
            'last_name': u.last_name or '',
            'email': u.email or u.username,
            'role': getattr(u, 'role', 'Admin'),
            'status': 'Active' if u.is_active else 'Suspended',
            'last_active': u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else 'N/A',
        })
        
    return Response(user_data)


# 3. USER LIST VIEW (CLASS-BASED MATCH FOR URLS)
class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return user_list(request._request)


# 4. USER PROFILE VIEW
class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=401)
            
        return Response({
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'role', 'Admin'),
        })


# 5. REGISTER VIEW
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'Parent')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        if User.objects.filter(username=email).exists():
            return Response({'error': 'User with this email already exists.'}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        if hasattr(user, 'role'):
            user.role = role
            user.save()

        return Response({'message': 'User registered successfully.'}, status=201)


# 6. DASHBOARD SUMMARY VIEW
class DashboardSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_users = User.objects.count()
        return Response({
            'total_users': total_users,
            'status': 'Active',
            'system_health': 'Good'
        })


# 7. PARENT PORTAL SUMMARY VIEW
class ParentPortalSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'portal_status': 'Active',
            'announcements': []
        })