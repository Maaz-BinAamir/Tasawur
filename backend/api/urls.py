from django.urls import path
from .views import create_user, google_login, login_user, user_profile
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('signup/', create_user, name='create_user'),
    path('login/', login_user, name='login_user'),
    path("auth/google/", google_login, name="google_login"),
    path('profile/', user_profile, name='user_profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
