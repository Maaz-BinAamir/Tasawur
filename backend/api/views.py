from supabase import create_client, Client
from api.models import Category, CustomUser, Follower_Following, PostCategories, Posts, Comments, PostLikes, CommentLikes, UserPreferences
from django.db import models
from .serializers import CategoriesSerializer, PostsSerializer, PreferencesSerializer, UserSerializer, CommentsSerializer, CommentSaveSerializer
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
import random

url = "https://kwebqbdcvbwonprlzwuy.supabase.co"  # Replace with your Supabase URL
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZWJxYmRjdmJ3b25wcmx6d3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NDUxNDIsImV4cCI6MjA0ODAyMTE0Mn0.urhzDnWoKR14FmLG58bNCZ5-l-SEOhpG0Lk1-DI2vG8"  # Replace with your Supabase API Key
supabase: Client = create_client(url, key)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('access_token')
   
    if not token:
        return Response({'error': 'No token provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), "168844986010-vejil6mcti4b0aarthtbgbj0ivf3f2ql.apps.googleusercontent.com"
        )
        print(idinfo)
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split("@")[0],
                'first_name': first_name,
                'last_name': last_name,
            }
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    posts = Posts.objects.filter(user_id=user.id)
    preferences = UserPreferences.objects.filter(user_id=user.id)
    followers = Follower_Following.objects.filter(following=user.id).count()
    following = Follower_Following.objects.filter(follower=user.id).count()
    
    serialized_posts = PostsSerializer(posts, many=True)
    serialized_preferences = PreferencesSerializer(preferences, many=True)
    # print(serialized_preferences.data)
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'profile_pic': user.profile_picture,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'bio': user.bio,
        'posts': serialized_posts.data,
        'preferences': serialized_preferences.data,
        'followers' : followers,
        'following' : following,
    }, status=status.HTTP_200_OK)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def other_user_profile(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    posts = Posts.objects.filter(user_id=user_id)
    followers = Follower_Following.objects.filter(following=user.id).count()
    following = Follower_Following.objects.filter(follower=user.id).count()
    hasFollowed = Follower_Following.objects.filter(following=user.id, follower=request.user.id).exists()
    
    serialized_posts = PostsSerializer(posts, many=True)
    
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'profile_pic': user.profile_picture,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'bio': user.bio,
        'posts': serialized_posts.data,
        'followers' : followers,
        'following' : following,
        'hasFollowed': hasFollowed,
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    try:
        user = CustomUser.objects.get(id=request.user.id)
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    profile_picture = request.FILES.get('profile_picture')
    if profile_picture:
        filename = f"{user.id}_{profile_picture.name}"
        
        try:
            # Remove old image if exists
            if user.profile_picture:
                old_filename = user.profile_picture.split('/')[-1][:-1]
                supabase.storage.from_('profiles').remove([old_filename])

            # Upload the new profile picture
            upload_response = supabase.storage.from_('profiles').upload(filename, profile_picture.read())
            if not upload_response:
                return Response({'error': 'Failed to upload image to Supabase.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get the public URL of the uploaded image
            image_url = supabase.storage.from_('profiles').get_public_url(filename)
            user.profile_picture = image_url
        except Exception as e:
            print('error', f"Image upload failed: {str(e)}")
            return Response({'error': f"Image upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    data = {
        "first_name": request.data.get("first_name"),
        "last_name": request.data.get("last_name"),
        "bio": request.data.get("bio"),
    }
    
    serializer = UserSerializer(user, data=data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        
        preferences = request.data.get("preferences")
        
        current_preferences = UserPreferences.objects.filter(user_id=user)
        
        
        for current_preference in current_preferences:
            if str(current_preference.category_id.id) not in preferences:
                current_preference.delete()

        for preference_id in preferences:
            if not preference_id.isnumeric():
                continue
            preference = Category.objects.get(id=preference_id)
            UserPreferences.objects.get_or_create(user_id=user, category_id=preference)
                
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_posts(request):
    # Get max_id and handle empty table case
    max_id = Posts.objects.all().aggregate(models.Max('id'))['id__max'] or 0

    # Extract the file from the request
    image = request.FILES.get('image')
    # print(image.read())
    
    if not image:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate a unique filename
    filename = f"{max_id + 1}_{image.name}"
    
    try:
        # Upload the image to Supabase storage
        upload_response = supabase.storage.from_('posts').upload(filename,image.read())

    
        if not upload_response:
            return Response({'error': 'Failed to upload image to Supabase'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get the public URL of the uploaded image
        image_url = supabase.storage.from_('posts').get_public_url(filename)
        
        # Prepare post data
        data = {
            "description": request.data.get("description"),
            "image": request.data.get("image"), 
            "image": image_url, 
            "user_id": request.user.id
            }        
        
        # Serialize and save the post
        serializer = PostsSerializer(data=data)
        if serializer.is_valid():
            post = serializer.save()
            
            categories = request.data.get("categories")
            
            for category_id in categories:
                category = Category.objects.get(id=category_id)
                PostCategories.objects.create(post_id=post, category_id=category)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("error :", str(e))
        return Response({'error': f"Image upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_posts(request, post_id):
    try:
        post = Posts.objects.get(id=post_id)
    except Posts.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PostsSerializer(post, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Posts.objects.get(id=post_id)
    except Posts.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
    try:
        # Remove the image from Supabase storage
        filename = post.image.split('/')[-1][:-1]
        supabase.storage.from_('posts').remove([filename])
    except:
        return Response({'error': 'Failed to delete image from Supabase.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    post.delete()
    return Response({'message': 'Post deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def post_details(request, post_id):
    hasLiked = PostLikes.objects.filter(post_id=post_id, user_id=request.user.id).exists()
    likes = PostLikes.objects.filter(post_id=post_id).count()
    post = Posts.objects.get(id=post_id)
    user = post.user_id
    comments = Comments.objects.filter(post_id=post_id)
    
    serialized_user = UserSerializer(user)
    serialized_comments = CommentsSerializer(comments, many=True)
    return Response({
        'id': post.id,
        'author': serialized_user.data,
        'profile_pic': user.profile_picture,
        'url': post.image,
        'description': post.description,
        'likes': likes,
        'hasLiked': hasLiked,
        'time_created': post.time_created,
        'comments': serialized_comments.data,
        'isAuthor': user.id == request.user.id,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_posts(request):
    # Fetch the query parameters
    query = request.query_params.get('q', '').strip()
    category = request.query_params.get('category', '').strip()
    print("query", query)
    print("category", category)
    # Base queryset
    posts = Posts.objects.all().order_by('-time_created')

    # Filter by search query
    if query:
        posts = posts.filter(description__icontains=query)

    # Filter by category
    if category:
        posts = posts.filter(categories__category_id=category)

    # If no query and category, apply percentage-based recommendation
    if not query and not category:
        user = request.user

        # Fetch user's preferred categories
        preferred_category_ids = UserPreferences.objects.filter(user_id=user.id).values_list(
            'category_id', flat=True
        )

        # 50% posts from preferred categories
        preferred_posts = Posts.objects.filter(
            categories__category_id__in=preferred_category_ids
        ).order_by('-time_created')
        preferred_posts = list(preferred_posts[:50])  # Limit to recent 50 posts

        # 30% posts from most liked (random from top 50 posts with most likes)
        top_liked_posts = Posts.objects.annotate(
            like_count=models.Count('post_likes')
        ).order_by('-like_count')[:50]
        random_top_liked_posts = random.sample(list(top_liked_posts), min(15, len(top_liked_posts)))

        # 20% posts from artists with 0-5 likes (random)
        low_liked_posts = Posts.objects.annotate(
            like_count=models.Count('post_likes')
        ).filter(like_count__range=(0, 5))
        random_low_liked_posts = random.sample(list(low_liked_posts), min(10, len(low_liked_posts)))

        # Combine posts into a final list
        combined_posts = preferred_posts[:25] + random_top_liked_posts + random_low_liked_posts
        random.shuffle(combined_posts)  # Shuffle for randomness

        # Serialize and return combined posts
        serializer = PostsSerializer(combined_posts, many=True)
        return Response(serializer.data)

    # Serialize the filtered posts
    serializer = PostsSerializer(posts, many=True)
    print(serializer.data)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    data = {
        "post_id": post_id,
        "user_id": request.user.id,
        "content": request.data.get("content"),
    }
    
    serializer = CommentSaveSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comments(request, post_id):
    comments = Comments.objects.filter(post_id=post_id)
    comments_serializer = CommentsSerializer(comments, many=True, context={'request': request})
    return Response(comments_serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    post = Posts.objects.get(id=post_id)
    user = CustomUser.objects.get(id=request.user.id)
    if (PostLikes.objects.filter(post_id=post, user_id=user).exists()):
        PostLikes.objects.filter(post_id=post, user_id=user).delete()
        return Response({'message': 'Post unliked successfully.'}, status=status.HTTP_204_NO_CONTENT)
    PostLikes.objects.create(post_id=post, user_id=request.user)
    return Response({'message': 'Post liked successfully.'}, status=status.HTTP_201_CREATED)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_comment(request, comment_id):
    comment = Comments.objects.get(id=comment_id)
    user = CustomUser.objects.get(id=request.user.id)
    if (CommentLikes.objects.filter(comment_id=comment, user_id=user).exists()):
        CommentLikes.objects.filter(comment_id=comment, user_id=user).delete()
    CommentLikes.objects.create(comment_id=comment, user_id=user)
    return Response({'message': 'Comment liked successfully.'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    request_user = CustomUser.objects.get(id=request.user.id)
    if (Follower_Following.objects.filter(following=user, follower=request_user).exists()):
        Follower_Following.objects.filter(following=user, follower=request_user).delete()
        return Response({'message': 'User unfollowed successfully.'}, status=status.HTTP_204_NO_CONTENT)
    Follower_Following.objects.create(following=user, follower=request_user)
    return Response({'message': 'User followed successfully.'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def categories(request):
    categories = Category.objects.all()
    categories_serializer = CategoriesSerializer(categories, many=True)
    return Response(categories_serializer.data, status=status.HTTP_200_OK)