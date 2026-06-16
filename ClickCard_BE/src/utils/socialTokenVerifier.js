const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

/**
 * Verifies Google + Apple ID tokens server-side and returns a normalised
 * profile { provider, sub, email, name, picture, emailVerified }.
 *
 * Required env:
 *   GOOGLE_CLIENT_ID       — accepted audience for Google id_token verification
 *   APPLE_CLIENT_ID        — accepted audience for Apple id_token (service id / app id)
 *
 * Either can be a comma-separated list to support web + iOS + Android clients.
 */

const googleClient = new OAuth2Client();

const appleJwks = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxAge: 24 * 60 * 60 * 1000,
});

function audList(envVal) {
  return (envVal || '').split(',').map((s) => s.trim()).filter(Boolean);
}

async function verifyGoogleIdToken(idToken) {
  const audiences = audList(process.env.GOOGLE_CLIENT_ID);
  if (audiences.length === 0) {
    throw new Error('GOOGLE_CLIENT_ID not configured on server');
  }
  const ticket = await googleClient.verifyIdToken({
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
  appleJwks.getSigningKey(header.kid, (err, key) => {
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
