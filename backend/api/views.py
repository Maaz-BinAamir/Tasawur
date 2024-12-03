from supabase import create_client, Client
from api.models import CustomUser, Posts
from django.db import models
from .serializers import PostsSerializer, UserSerializer
from django.contrib.auth import authenticate
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

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
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'profile_pic': user.profile_picture,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'bio': user.bio,
    }, status=status.HTTP_200_OK)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def other_user_profile(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    return Response({
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'profile_pic': user.profile_picture,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'bio': user.bio,
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
            print("user's pic", user.profile_picture)
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
    print('filename', filename)
    
    try:
        # Upload the image to Supabase storage
        upload_response = supabase.storage.from_('posts').upload(filename,image.read())

    
        if not upload_response:
            return Response({'error': 'Failed to upload image to Supabase'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get the public URL of the uploaded image
        image_url = supabase.storage.from_('posts').get_public_url(filename)
        print("image_url", image_url)
        
        # Prepare post data
        data = {
            "description": request.data.get("description"),
            "image": request.data.get("image"), 
            "image": image_url, 
            "user_id": request.user.id
            }
        
        print("data", data)
        # Serialize and save the post
        serializer = PostsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
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

    post.delete()
    return Response({'message': 'Post deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def post_details(request, post_id):
    post = Posts.objects.get(id=post_id)
    user = post.user_id
    return Response({
        'id': post.id,
        'author': user.username,
        'profile_pic': user.profile_picture,
        'url': post.image,
        'description': post.description,
        'likes': post.likes,
        'time_created': post.time_created,
        
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_posts(request):
    # Fetch all posts (you can add filters if needed)
    posts = Posts.objects.all().order_by('-time_created')
    # Serialize all posts
    serializer = PostsSerializer(posts, many=True)
    return Response(serializer.data)