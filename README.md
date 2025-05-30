# Twitter OAuth 2.0 Authentication System

This project is a full-stack web application that allows users to authenticate with their own Twitter account, view their profile and tweets, and (if permitted) post tweets directly from the app. It uses:

- **Backend:** Django + Django REST Framework (Python)
- **Frontend:** React (Vite)
- **Twitter API:** OAuth 2.0 Authorization Code Flow with PKCE

---

## Features
- **Login with Twitter** (OAuth 2.0 PKCE)
- **View your Twitter profile** (name, username, avatar)
- **View your latest tweets**
- **Post a tweet** (if your Twitter app has write permissions)

---

## Prerequisites
- Python 3.8+
- Node.js 18+
- A [Twitter Developer account](https://developer.twitter.com/en/portal/dashboard) and a registered Twitter App

---

## Twitter App Setup
1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/projects-and-apps) and create a new app.
2. Under **User authentication settings**:
   - Enable **OAuth 2.0** (PKCE).
   - Set **App permissions** to `Read and write` (if you want to post tweets).
   - Add the following to **OAuth 2.0 Redirect URLs**:
     - `http://localhost:5173/callback`
   - Add these scopes:
     - `tweet.read users.read offline.access`
     - `tweet.write` (if you want to post tweets)
3. Save changes and note your **Client ID** and **Client Secret**.

---

## Backend Setup (Django)

1. **Clone the repository and navigate to the backend directory:**
   ```sh
   git clone [<repo-url>](https://github.com/00Manas-Singh00/twitter-post.git)
   cd twitter-post/backend
   ```
2. **Create a virtual environment and activate it:**
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   # or, if requirements.txt is missing:
   pip install django djangorestframework requests-oauthlib django-cors-headers python-dotenv requests
   ```
4. **Create a `.env` file in the `backend` directory with the following:**
   ```env
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   TWITTER_CALLBACK_URL=http://localhost:5173/callback
   # (Optional, for legacy OAuth 1.0a endpoints)
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET_KEY=your_twitter_api_secret_key
   ```
5. **Apply migrations:**
   ```sh
   python manage.py migrate
   ```
6. **Run the backend server:**
   ```sh
   python manage.py runserver
   ```

---

## Frontend Setup (React)

1. **Navigate to the frontend directory:**
   ```sh
   cd ../frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Update the Twitter Client ID in `src/LoginWithTwitter.jsx`:**
   ```js
   const CLIENT_ID = 'your_twitter_client_id';
   ```
4. **Start the frontend dev server:**
   ```sh
   npm run dev
   ```
5. **Open your browser to:**
   ```
   http://localhost:5173
   ```

---

## Usage
1. Click **Login with Twitter**.
2. Authorize the app in the Twitter popup.
3. You will be redirected to your profile page, where you can:
   - View your Twitter profile info
   - See your latest tweets
   - Post a new tweet (if your app has write access)

---

## Notes & Troubleshooting
- **Do not reuse the same authorization code or refresh the callback page.** Always start a new login flow.
- **If you get a 403 when posting a tweet:**
  - Make sure your Twitter app has `Read and write` permissions and the `tweet.write` scope.
  - Log out and log in again to get a new access token with the correct scopes.
  - Free Twitter developer accounts may not allow posting tweets via API.
- **If you get a 429 (rate limit):** Wait before making more requests.
- **All Twitter credentials must be kept secret and never exposed in the frontend.**

---

## License
MIT 
