from .models import CustomUser, Posts, Comments, CommentLikes, Category, UserPreferences
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "password","first_name", "last_name", "bio", "profile_picture"]
        extra_kwargs = {"password": {"write_only": True, "required": True}}
        
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
        
class PostsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posts
        fields = '__all__'
        read_only_fields = ('time_created',)
        
class CommentsSerializer(serializers.ModelSerializer):
    user_id = UserSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comments
        fields = '__all__'
        read_only_fields = ('time_created',)
        
    def get_likes(self, obj):
        return CommentLikes.objects.filter(comment_id=obj.id).count()
    
    def get_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return CommentLikes.objects.filter(comment_id=obj.id, user_id=request.user.id).exists()
        
class CommentSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = '__all__'
        read_only_fields = ('time_created',)
        
class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name"]
        
class PreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ["category_id"]