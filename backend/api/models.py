from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    profile_picture = models.URLField(max_length=1024, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.username
    
class Posts(models.Model):
    image = models.URLField(max_length=1024)
    description = models.TextField()
    time_created = models.DateTimeField(auto_now_add=True)
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')

class Follower_Following(models.Model):
    following = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='following')
    follower = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='followers')
    
class logs(models.Model):
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=1024)
    time = models.DateTimeField(auto_now_add=True)
    
class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} at {self.timestamp}"
    
class Comments(models.Model):
    post_id = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='comments')
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    time_created = models.DateTimeField(auto_now_add=True)

class SavedPosts(models.Model):
    post_id = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='saved_posts')
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_posts')

class PostLikes(models.Model):
    post_id = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='post_likes')
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='liked_posts')
    
class CommentLikes(models.Model):
    comment_id = models.ForeignKey(Comments, on_delete=models.CASCADE, related_name='comment_likes')
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='liked_comments')

class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=1024)

class UserPreferences(models.Model):
    user_id = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='preferences')
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='users')
    
class PostCategories(models.Model):
    post_id = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='categories')
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')