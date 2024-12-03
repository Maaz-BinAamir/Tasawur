from django.urls import path
from .views import create_user, google_login, login_user, user_profile, create_posts, update_posts, delete_post, post_details, home_posts, other_user_profile, update_user
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('signup/', create_user, name='create_user'),
    path('login/', login_user, name='login_user'),
    path("auth/google/", google_login, name="google_login"),
    path('update_user/', update_user, name='update_user'),
    path('profile/<int:user_id>', other_user_profile, name='other_user_profile'),
    path('profile/', user_profile, name='user_profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('homeposts/', home_posts, name='home_posts'),
    path('posts/<int:post_id>/', post_details, name='post_details'),
    path('posts/create/', create_posts, name='create_posts'),
    path('posts/update/<int:post_id>/', update_posts, name='update_posts'),
    path('posts/delete/<int:post_id>/', delete_post, name='delete_post'),
]
