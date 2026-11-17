# Send Email API

A tiny Express server with one route, `GET /send`, that sends an email. It shows two ways to hand
a message to a mail service: over SMTP (Nodemailer + Ethereal, a fake inbox for development) and
over an HTTP API (Twilio Email API).
Built while following the "Send Emails" section of a Node.js / Express course.

No front-end and no database.

## Tech stack

Node.js 22 · Express 4 · Nodemailer 10 · Twilio Email API (built-in `fetch`) ·
express-async-errors · dotenv

## Getting started

```bash
npm install
npm run dev   # nodemon, auto-reload
npm start     # plain node
```

Create `.env` in the project root:

```env
PORT=5000
TWILIO_ACCOUNT_SID=<Account SID from the Twilio console home page>
TWILIO_AUTH_TOKEN=<Auth Token from the same page>
EMAIL_TO=<recipient address>
```

Then open http://localhost:5000 and follow the "send email" link.

## API

| Method | Route   | Description                                             |
|--------|---------|---------------------------------------------------------|
| GET    | `/`     | Page with a link to `/send`                             |
| GET    | `/send` | Sends one email to `EMAIL_TO` and returns Twilio's JSON |

```bash
curl http://localhost:5000/send
# 202 { "operationId": "comms_operation_...", "operationLocation": "/Emails/Operations/comms_operation_..." }
```

`202` means Twilio queued the message, not that it has been delivered. If Twilio rejects the
request, its status code and error body are passed through unchanged.

## How sending works

```
GET /send  ->  sendEmail
                 reads TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN from process.env
                 POST https://comms.twilio.com/v1/Emails
                   Authorization: Basic base64(SID:TOKEN)
                   { from: { address, name }, to: [{ address }], content: { subject, html } }
               <- Twilio's status code and JSON
```

### Ethereal variant

`sendEmailEthereal` in `controllers/sendEmail.js` sends a test message through
[Ethereal](https://ethereal.email): `nodemailer.createTestAccount()` creates a throwaway mailbox,
`createTransport` connects to `smtp.ethereal.email:587`, and `sendMail` sends the message. Nothing
is delivered to a real address; the response includes a `preview` URL where the message can be
viewed. No account or key is needed.

To use it, change the last line of `controllers/sendEmail.js` to
`module.exports = sendEmailEthereal`.

## Project structure

```
app.js                        # json, routes (/ and /send), notFound, errorHandler, start()
controllers/sendEmail.js      # sendEmailEthereal (SMTP), sendEmail (Twilio Email API)
middleware/error-handler.js   # turns thrown errors into { msg } responses
middleware/not-found.js       # 404 for unknown routes
errors/                       # CustomAPIError + BadRequest / Unauthenticated / NotFound
```

## Differences from the course

- The course sends the real email with SendGrid (`@sendgrid/mail`). New SendGrid sign-ups now land
  in the Twilio console without a classic `SG.` API key, so this project calls the Twilio Email API
  with `fetch` instead
- The Ethereal login is taken from `createTestAccount()`; the course hardcodes the author's mailbox
- The Ethereal response also returns a `preview` link (`nodemailer.getTestMessageUrl`)
- The recipient comes from `EMAIL_TO` rather than being written in the code
- Nodemailer 10 instead of 6.x, Express 4.21, Node 22 — the lesson code works the same

## Known limitations

- A Twilio trial account only accepts the subject and HTML of an approved template (console →
  "Try out Email"); any other content returns `400 Invalid template`. The sender is fixed to
  `<Account SID>@twilio.email`
- `GET /send` sends an email on every page load; a real API would use `POST`
- Only `sendEmail` is exported, so the Ethereal variant is not reachable without a code change
- `@sendgrid/mail` is still listed in `package.json` but is not used
- `db/connect.js`, `errors/` and `middleware/authentication.js` are leftovers from the Jobs API
  starter; `authentication.js` requires a `models/User` file that does not exist
