from django.contrib import admin
from . import models


# Customize admin site text
admin.site.site_header = "Tasawur's Admin"  # Header displayed at the top
admin.site.site_title = "Tasawur's Admin Portal"  # Title on the browser tab
admin.site.index_title = "Welcome to Tasawur's Admin"  # Title on the index page


# Register your models here.
admin.site.register(models.CustomUser)
admin.site.register(models.Posts)
admin.site.register(models.PostLikes)
admin.site.register(models.SavedPosts)
admin.site.register(models.Category)
admin.site.register(models.PostCategories)
admin.site.register(models.UserPreferences)
admin.site.register(models.Follower_Following)
admin.site.register(models.logs)
admin.site.register(models.Comments)
admin.site.register(models.CommentLikes)
admin.site.register(models.Message)
