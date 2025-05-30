from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.TwitterLoginView.as_view(), name='twitter-login'),
    path('callback/', views.TwitterCallbackView.as_view(), name='twitter-callback'),
    path('tweets/', views.UserTweetsView.as_view(), name='user-tweets'),
    path('tweet/', views.PostTweetView.as_view(), name='post-tweet'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('oauth2/token/', views.TwitterOAuth2TokenView.as_view(), name='twitter-oauth2-token'),
    path('me/', views.TwitterMeView.as_view(), name='twitter-me'),
    path('user_tweets/', views.TwitterUserTweetsView.as_view(), name='twitter-user-tweets'),
    path('post_tweet/', views.TwitterPostTweetView.as_view(), name='twitter-post-tweet'),
] 