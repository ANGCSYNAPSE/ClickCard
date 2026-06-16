/**
 * Verifies Google + Apple ID tokens server-side and returns a normalised
 * profile { provider, sub, email, name, picture, emailVerified }.
 *
 * Lazy-load `google-auth-library` and `jwks-rsa` inside the functions —
 * `jwks-rsa` >=3 pulls in `jose` (ESM), which crashes Vercel's CommonJS
 * runtime at module load. Lazy requires keep the rest of the app booting
 * even if those modules can't be loaded.
 *
 * Required env:
 *   GOOGLE_CLIENT_ID       — accepted audience for Google id_token verification
 *   APPLE_CLIENT_ID        — accepted audience for Apple id_token (service id / app id)
 *
 * Either can be a comma-separated list to support web + iOS + Android clients.
 */

const jwt = require('jsonwebtoken');

let _googleClient = null;
let _appleJwks = null;

function getGoogleClient() {
  if (_googleClient) return _googleClient;
  const { OAuth2Client } = require('google-auth-library');
  _googleClient = new OAuth2Client();
  return _googleClient;
}

function getAppleJwks() {
  if (_appleJwks) return _appleJwks;
  const jwksClient = require('jwks-rsa');
  _appleJwks = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
    cache: true,
    cacheMaxAge: 24 * 60 * 60 * 1000,
  });
  return _appleJwks;
}

function audList(envVal) {
  return (envVal || '').split(',').map((s) => s.trim()).filter(Boolean);
}

async function verifyGoogleIdToken(idToken) {
  const audiences = audList(process.env.GOOGLE_CLIENT_ID);
  if (audiences.length === 0) {
    throw new Error('GOOGLE_CLIENT_ID not configured on server');
  }
  const ticket = await getGoogleClient().verifyIdToken({
    idToken,
    audience: audiences,
  });
  const p = ticket.getPayload();
  if (!p || !p.email) throw new Error('Google token missing email');
  return {
    provider: 'google',
    sub: p.sub,
    email: p.email,
    name: p.name || [p.given_name, p.family_name].filter(Boolean).join(' '),
    picture: p.picture,
    emailVerified: !!p.email_verified,
  };
}

function getAppleKey(header, callback) {
  getAppleJwks().getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyAppleIdToken(idToken) {
  const audiences = audList(process.env.APPLE_CLIENT_ID);
  if (audiences.length === 0) {
    return Promise.reject(new Error('APPLE_CLIENT_ID not configured on server'));
  }
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getAppleKey,
      {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: audiences,
      },
      (err, payload) => {
        if (err) return reject(err);
        if (!payload || !payload.email) {
          return reject(new Error('Apple token missing email (request name+email scopes on first sign-in)'));
        }
        resolve({
          provider: 'apple',
          sub: payload.sub,
          email: payload.email,
          name: '',
          picture: null,
          emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
        });
      },
    );
  });
}

module.exports = { verifyGoogleIdToken, verifyAppleIdToken };
