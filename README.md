# Applicant portal

Run `npm ci` and `npm run dev` in this directory. The applicant portal listens on port 3002.

For production, build with `npm run build` and run `npm start`. Route application.matramites.tech to this service. Set BACKEND_URL at build time to the backend origin reachable from the Next.js server (default http://localhost:5000). The browser calls the same-origin /backend proxy. On final approval, applicants are sent to https://matramites.tech/login to sign in with their existing credentials. NEXT_PUBLIC_MEMBER_PORTAL_URL can override that destination at build time.
