# Applicant portal

Run `npm ci` and `npm run dev` in this directory. The applicant portal listens on port 3002.

Set `NEXT_PUBLIC_API_URL` to the backend origin in `.env`. Local development uses `http://localhost:5000`. Both the API client and the applicant photo proxy use this setting.

For production, set `NEXT_PUBLIC_API_URL` to the public HTTPS backend origin before running `npm run build`, then run `npm start`. On final approval, applicants are sent to https://matramites.tech/login to sign in with their existing credentials. NEXT_PUBLIC_MEMBER_PORTAL_URL can override that destination at build time.
