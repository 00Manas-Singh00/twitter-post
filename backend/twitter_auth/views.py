from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from requests_oauthlib import OAuth1Session
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
import os
import requests
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import base64

# Create your views here.

class TwitterLoginView(APIView):
    def get(self, request):
        oauth = OAuth1Session(
            settings.TWITTER_API_KEY,
            client_secret=settings.TWITTER_API_SECRET_KEY,
            callback_uri=settings.TWITTER_CALLBACK_URL
        )
        request_token_url = 'https://api.twitter.com/oauth/request_token'
        fetch_response = oauth.fetch_request_token(request_token_url)
        request.session['resource_owner_key'] = fetch_response.get('oauth_token')
        request.session['resource_owner_secret'] = fetch_response.get('oauth_token_secret')
        base_authorization_url = 'https://api.twitter.com/oauth/authorize'
        authorization_url = oauth.authorization_url(base_authorization_url)
        return JsonResponse({'auth_url': authorization_url})

class TwitterCallbackView(APIView):
    def get(self, request):
        oauth_token = request.GET.get('oauth_token')
        oauth_verifier = request.GET.get('oauth_verifier')
        resource_owner_key = request.session.get('resource_owner_key')
        resource_owner_secret = request.session.get('resource_owner_secret')
        if not (oauth_token and oauth_verifier and resource_owner_key and resource_owner_secret):
            return JsonResponse({'error': 'Missing data in callback.'}, status=400)
        oauth = OAuth1Session(
            settings.TWITTER_API_KEY,
            client_secret=settings.TWITTER_API_SECRET_KEY,
            resource_owner_key=resource_owner_key,
            resource_owner_secret=resource_owner_secret,
            verifier=oauth_verifier
        )
        access_token_url = 'https://api.twitter.com/oauth/access_token'
        oauth_tokens = oauth.fetch_access_token(access_token_url)
        # Store access tokens in session for now (for demo)
        request.session['access_token'] = oauth_tokens.get('oauth_token')
        request.session['access_token_secret'] = oauth_tokens.get('oauth_token_secret')
        # Redirect to frontend (you can change this URL as needed)
        return HttpResponseRedirect('/')

class UserTweetsView(APIView):
    def get(self, request):
        access_token = request.session.get('access_token')
        access_token_secret = request.session.get('access_token_secret')
        if not (access_token and access_token_secret):
            return Response({'error': 'User not authenticated with Twitter.'}, status=status.HTTP_401_UNAUTHORIZED)
        oauth = OAuth1Session(
            settings.TWITTER_API_KEY,
            client_secret=settings.TWITTER_API_SECRET_KEY,
            resource_owner_key=access_token,
            resource_owner_secret=access_token_secret
        )
        url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=20'
        resp = oauth.get(url)
        if resp.status_code != 200:
            return Response({'error': 'Failed to fetch tweets.'}, status=resp.status_code)
        return Response(resp.json())

class PostTweetView(APIView):
    def post(self, request):
        access_token = request.session.get('access_token')
        access_token_secret = request.session.get('access_token_secret')
        if not (access_token and access_token_secret):
            return Response({'error': 'User not authenticated with Twitter.'}, status=status.HTTP_401_UNAUTHORIZED)
        tweet_text = request.data.get('text')
        if not tweet_text:
            return Response({'error': 'Tweet text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        oauth = OAuth1Session(
            settings.TWITTER_API_KEY,
            client_secret=settings.TWITTER_API_SECRET_KEY,
            resource_owner_key=access_token,
            resource_owner_secret=access_token_secret
        )
        url = 'https://api.twitter.com/1.1/statuses/update.json'
        resp = oauth.post(url, data={'status': tweet_text})
        if resp.status_code != 200:
            return Response({'error': 'Failed to post tweet.'}, status=resp.status_code)
        return Response(resp.json())

class LogoutView(APIView):
    def post(self, request):
        request.session.flush()
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class TwitterOAuth2TokenView(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request):
        code = request.data.get('code')
        code_verifier = request.data.get('code_verifier')
        client_id = os.environ.get('TWITTER_CLIENT_ID')
        client_secret = os.environ.get('TWITTER_CLIENT_SECRET')
        redirect_uri = os.environ.get('TWITTER_CALLBACK_URL')

        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'code': code,
            'code_verifier': code_verifier,
        }
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        # Add Basic Auth header if client_secret is present
        if client_secret:
            basic_auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
            headers['Authorization'] = f"Basic {basic_auth}"

        resp = requests.post('https://api.twitter.com/2/oauth2/token', data=data, headers=headers)
        print('TWITTER RESPONSE:', resp.status_code, resp.text)
        return JsonResponse(resp.json(), status=resp.status_code)
    
class TwitterMeView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        print('Access token being sent to Twitter:', access_token)  # <-- Add this line
        headers = {'Authorization': f'Bearer {access_token}'}
        resp = requests.get('https://api.twitter.com/2/users/me', headers=headers)
        print('Twitter response:', resp.status_code, resp.text)  # <-- Add this for debugging
        return JsonResponse(resp.json(), status=resp.status_code)    

class TwitterUserTweetsView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        user_id = request.data.get('user_id')
        headers = {'Authorization': f'Bearer {access_token}'}
        resp = requests.get(f'https://api.twitter.com/2/users/{user_id}/tweets', headers=headers)
        return JsonResponse(resp.json(), status=resp.status_code)

class TwitterPostTweetView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        tweet_text = request.data.get('text')
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        data = {'text': tweet_text}
        resp = requests.post('https://api.twitter.com/2/tweets', headers=headers, json=data)
        return JsonResponse(resp.json(), status=resp.status_code)
