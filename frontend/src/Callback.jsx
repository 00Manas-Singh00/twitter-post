import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REDIRECT_URI = 'http://localhost:5173/callback';

function Callback() {
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

    if (!code || !codeVerifier) {
      setError('Missing code or code verifier');
      return;
    }

    fetch('http://localhost:8000/api/auth/twitter/oauth2/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setAccessToken(data.access_token);
          sessionStorage.setItem('twitter_access_token', data.access_token);
          navigate('/profile');
        } else {
          setError(JSON.stringify(data));
        }
      })
      .catch(err => setError(err.toString()));
  }, [navigate]);

  if (error) return <div>Error: {error}</div>;
  if (accessToken) return <div>Authenticated! Access token: {accessToken}</div>;
  return <div>Authenticating with Twitter...</div>;
}

export default Callback; 