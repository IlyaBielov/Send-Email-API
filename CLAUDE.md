# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

Section **08-send-email** (Udemy "Section 12: Send Emails", 8 lessons) of a Node.js/Express course. A tiny standalone project: one route `GET /send` that sends an email — first a test email through **Nodemailer + Ethereal** (fake SMTP inbox), then a real one through **SendGrid**. No front-end, no database.

The starter is the course's code (empty `controllers/sendEmail.js`), prepared on 2026-11-16: dependencies bumped, `db/connect.js` simplified, `.env` created. `README.MD` is empty in this section, so `../final/` is the only reference. No git repo yet — create one (like 03–06.5) when Ilya first asks to commit; push only when he says so.

A completed reference implementation lives at `../final/` — consult it to see where a lesson is heading. Do **not** copy-paste from `final/`; Ilya is learning and types the code himself. Offer snippets inline or explain instead.

## Commands

- `npm install`
- `npm run dev` — nodemon (local); `npm start` — plain node
- No lint/test setup. Port 5000 is shared with other sections' dev servers — run one at a time.

## Environment

`.env` (gitignored):
- `PORT=5000`
- `SENDGRID_API_KEY` — empty until the SendGrid lesson (SendGrid → Settings → API Keys). Ethereal needs no key.

No `MONGO_URI`: `app.js` never calls `connectDB`.

## Target architecture (`../final/`)

- **app.js** — `express.json()`, `GET /` with a link to `/send`, `GET /send` → `sendEmail`, notFound + errorHandler.
- **controllers/sendEmail.js** — `sendEmailEthereal` (`nodemailer.createTestAccount()`, `createTransport({ host: 'smtp.ethereal.email', port: 587, auth })`, `transporter.sendMail({ from, to, subject, html })`, responds with `info`) and `sendEmail` (`sgMail.setApiKey(process.env.SENDGRID_API_KEY)`, `sgMail.send(msg)`); only `sendEmail` is exported in the final.

## Version differences vs the course

Bumped: `mongoose` 9.12.1 (exact, unused here), `jsonwebtoken` 9, `dotenv` 16, `express` 4.21, `nodemon` 3, **`nodemailer` 10** (course: 6.x), **`@sendgrid/mail` 8** (course: 7.x — pulled a vulnerable axios). The APIs used in the course (`createTestAccount`, `createTransport`, `sendMail`, `setApiKey`, `send`) are unchanged. `npm audit --omit=dev` leaves only low-severity `deepmerge` inside the latest `@sendgrid/mail` (npm's "fix" is a downgrade — ignore). Node 22 (`engines`).

Gotchas to watch for in the lessons:
- The final hardcodes the author's Ethereal login (`marlene.legros@ethereal.email`) — it won't work. Use `testAccount.user` / `testAccount.pass` from `createTestAccount()`, or create a mailbox at ethereal.email; `nodemailer.getTestMessageUrl(info)` gives a link to view the sent message.
- SendGrid requires a verified sender (Settings → Sender Authentication) and its plans have changed since the course was recorded — check what the account offers; Ethereal is enough to learn the concept.
- `GET /send` sends an email on every page load (fine for a demo; a real API would use POST).
- `middleware/authentication.js` requires `../models/User`, which doesn't exist — leftover, never used.

## Course workflow

- When Ilya asks for help implementing something, explain the concept and show the code inline — don't write it to his files unless he explicitly asks.
- If he's stuck, compare his code against `../final/` mentally and point out specific differences rather than dumping the whole reference.
- After a lesson he runs `/lesson-explain`; he often asks to commit afterwards; push only when he says so.
