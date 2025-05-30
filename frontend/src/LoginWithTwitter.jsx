import React from 'react';
import { generatePKCECodes } from './pkce';

const CLIENT_ID = 'enter_your_twitter_client_id_here'; 
const REDIRECT_URI = 'http://localhost:5173/callback';
const SCOPE = 'tweet.read users.read offline.access tweet.write'; 

function LoginWithTwitter() {
  const handleLogin = async () => {
    const { codeVerifier, codeChallenge } = await generatePKCECodes();
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state: 'state', 
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <button onClick={handleLogin} style={{ padding: '12px 24px', fontSize: '18px', background: '#1da1f2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        Login with Twitter (OAuth 2.0)
      </button>
    </div>
  );
}

export default LoginWithTwitter; 