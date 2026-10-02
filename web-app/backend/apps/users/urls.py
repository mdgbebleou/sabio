from django.urls import path
from .views import ProvisionUserView, LoginView

urlpatterns = [
    path('provision/', ProvisionUserView.as_view(), name='provision-user'),
    path('login/', LoginView.as_view(), name='login'),
]