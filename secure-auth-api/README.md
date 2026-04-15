# Secure Auth API

Production-ready authentication backend for an e-commerce app with:
- JWT authentication using HTTP-only cookies
- Google and GitHub OAuth with Passport.js
- Two-factor authentication (TOTP with Speakeasy)
- Password reset via email (Nodemailer)
- Rate limiting, validation, and secure defaults

## Setup

1. Install dependencies:
   npm install

2. Copy environment template:
   cp .env.example .env

3. Update all environment variables in .env.

4. Start dev server:
   npm run dev

## Folder Structure

src/
- config/
  - db.js
  - passport.js
- controllers/
  - auth.controller.js
  - user.controller.js
- middleware/
  - auth.middleware.js
  - error.middleware.js
  - rateLimit.middleware.js
  - validate.middleware.js
- models/
  - User.js
- routes/
  - auth.routes.js
  - user.routes.js
- services/
  - email.service.js
  - token.service.js
- utils/
  - asyncHandler.js
  - crypto.util.js
- validators/
  - auth.validators.js
- app.js
- server.js

## Main APIs

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-2fa
- POST /api/auth/2fa/setup
- POST /api/auth/2fa/enable
- POST /api/auth/2fa/disable
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/logout
- GET /api/auth/google
- GET /api/auth/google/callback
- GET /api/auth/github
- GET /api/auth/github/callback
- GET /api/users/me (protected)

## Notes

- JWT is stored in HTTP-only cookie configured via COOKIE_NAME.
- OAuth callbacks set JWT cookie, then redirect to CLIENT_URL.
- Reset token is stored hashed in DB.
- Passwords are hashed with bcryptjs.
