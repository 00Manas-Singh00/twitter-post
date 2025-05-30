import React, { useEffect, useState } from 'react';

function PostTweetForm({ accessToken, onTweetPosted }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');
    setSuccess('');
    const res = await fetch('http://localhost:8000/api/auth/twitter/post_tweet/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, text }),
    });
    const data = await res.json();
    setPosting(false);
    if (res.status === 201 || data.data) {
      setSuccess('Tweet posted!');
      setText('');
      if (onTweetPosted) onTweetPosted();
    } else {
      setError(data.error || 'Failed to post tweet.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's happening?"
        rows={3}
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 8 }}
        required
        maxLength={280}
        disabled={posting}
      />
      <button type="submit" disabled={posting || !text.trim()} style={{ background: '#1da1f2', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        {posting ? 'Posting...' : 'Tweet'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </form>
  );
}

function TwitterProfile() {
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState('');
  const accessToken = sessionStorage.getItem('twitter_access_token');

  useEffect(() => {
    if (!accessToken) return;

    fetch('http://localhost:8000/api/auth/twitter/me/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    })
      .then(res => res.json())
      .then(userData => {
        setUser(userData.data);
        return fetch('http://localhost:8000/api/auth/twitter/user_tweets/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, user_id: userData.data.id }),
        });
      })
      .then(res => res.json())
      .then(tweetsData => {
        if (tweetsData.status === 429) {
          setError('Rate limit exceeded. Please wait and try again later.');
        } else {
          setTweets(tweetsData.data || []);
        }
      })
      .catch(err => setError('Failed to fetch data.'));
  }, [accessToken]);

  if (!accessToken) return <div style={{textAlign: 'center', marginTop: 40}}>Please log in with Twitter.</div>;
  if (!user) return <div style={{textAlign: 'center', marginTop: 40}}>Loading user info...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f5f8fa', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, maxWidth: 480, width: '100%', marginTop: 40, marginBottom: 32, textAlign: 'center' }}>
        <img
          src={`https://unavatar.io/twitter/${user.username}`}
          alt={user.name}
          style={{ width: 96, height: 96, borderRadius: '50%', marginBottom: 16, border: '2px solid #1da1f2' }}
        />
        <h2 style={{ margin: 0 }}>{user.name}</h2>
        <div style={{ color: '#657786', marginBottom: 8 }}>@{user.username}</div>
        <div style={{ color: '#1da1f2', fontWeight: 500, marginBottom: 8 }}>Twitter Profile</div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 24, maxWidth: 480, width: '100%' }}>
        <PostTweetForm accessToken={accessToken} onTweetPosted={() => window.location.reload()} />
        <h3 style={{ marginTop: 0, color: '#1da1f2' }}>Your Tweets</h3>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tweets.length === 0 && !error && <li style={{ color: '#657786' }}>No tweets found.</li>}
          {tweets.map(tweet => (
            <li key={tweet.id} style={{
              background: '#f5f8fa',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              textAlign: 'left',
              wordBreak: 'break-word',
            }}>
              <div style={{ fontSize: 16 }}>{tweet.text}</div>
              <div style={{ color: '#657786', fontSize: 12, marginTop: 8 }}>
                {new Date(tweet.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TwitterProfile; 