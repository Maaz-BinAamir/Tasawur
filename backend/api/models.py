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
    likes = models.IntegerField(default=0)
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
