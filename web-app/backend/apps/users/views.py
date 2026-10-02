from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail

# Dynamically reference custom User model (users.User)
User = get_user_model()

class ProvisionUserView(APIView):
    # GET: Fetch all provisioned users from custom User database
    def get(self, request):
        try:
            users = User.objects.all().order_by('-date_joined')
            user_data = []
            for u in users:
                user_data.append({
                    'id': f"USR-{u.id}",
                    'name': f"{u.first_name} {u.last_name}".strip() or u.username,
                    'email': u.email or u.username,
                    'role': getattr(u, 'role', 'Admin') if hasattr(u, 'role') else ('Admin' if u.is_superuser else 'Teacher'),
                    'status': 'Active' if u.is_active else 'Suspended',
                    'linkedEntity': 'System User',
                    'lastLogin': u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else 'Never'
                })
            return Response(user_data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error fetching users:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # POST: Provision a new user safely using get_user_model()
    def post(self, request):
        try:
            name = request.data.get('name', '')
            email = request.data.get('email', '')
            role = request.data.get('role', 'Teacher')
            temp_password = request.data.get('tempPassword', 'Temp1234!')

            if not email:
                return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

            name_parts = name.strip().split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            # Create user on the custom User model
            user, created = User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_staff': True if role in ['Admin', 'Accountant'] else False,
                    'is_superuser': True if role == 'Admin' else False
                }
            )

            # Assign custom role field if present on model
            if hasattr(user, 'role'):
                user.role = role

            user.set_password(temp_password)
            user.save()

            if request.data.get('sendEmail', True):
                try:
                    send_mail(
                        "Welcome to SABIO SMIS - Account Credentials",
                        f"Hello {name},\n\nYour account has been created.\nRole: {role}\nUsername: {email}\nPassword: {temp_password}\n\nLogin: http://localhost:5173/login",
                        None,
                        [email],
                        fail_silently=True
                    )
                except Exception as email_err:
                    print("Email dispatch warning:", email_err)

            return Response({"message": "User provisioned successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("User provisioning error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({"error": "Account is suspended. Contact administrator."}, status=status.HTTP_403_FORBIDDEN)
            
            user_role = getattr(user, 'role', 'Admin') if hasattr(user, 'role') else ('Admin' if user.is_superuser else 'Teacher')
            
            # Send first_name back to frontend (fallback to 'User' if empty)
            first_name = user.first_name if user.first_name else "User"

            return Response({
                "message": "Login successful",
                "username": user.username,
                "first_name": first_name,
                "role": user_role
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)