from django.urls import path
from .views import (
    UserProfileView,
    RegisterView,
    UserListView,
    DashboardSummaryView,
    user_list,
    login_view,
    ParentPortalSummaryView
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('login/', login_view, name='login'),
    path('register/', RegisterView.as_view(), name='user-register'),
    path('list/', user_list, name='user-list'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('parent/portal/', ParentPortalSummaryView.as_view(), name='parent-portal-summary'),
]