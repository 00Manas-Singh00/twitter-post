export function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(buffer) {
  const digest = await window.crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(digest);
}

export async function generatePKCECodes() {
  const codeVerifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
  const codeChallenge = base64URLEncode(await sha256(new TextEncoder().encode(codeVerifier)));
  return { codeVerifier, codeChallenge };
} 