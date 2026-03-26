# AnonyMessage

A full-stack anonymous messaging platform where users can share a unique public link and receive honest, anonymous messages from anyone — without revealing who sent them.

## Features

- **Anonymous messaging** — Anyone with your link can send you a message without creating an account
- **Email verification** — New accounts are verified via a one-time code sent by email
- **Google OAuth** — Sign in with Google
- **AI-powered suggestions** — Powered by Google Gemini 2.5 Flash; suggests open-ended message prompts when composing
- **Dashboard** — View, delete, and paginate through received messages
- **Accept / reject messages** — Toggle whether your profile accepts new messages
- **Shareable profile link** — Each user gets a public URL at `/u/<username>`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Auth | [NextAuth.js v4](https://next-auth.js.org) (Credentials + Google OAuth) |
| Database | PostgreSQL via [Prisma ORM](https://www.prisma.io) |
| Email | [Resend](https://resend.com) + React Email |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) + Google Gemini 2.5 Flash |
| UI | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Validation | [Zod](https://zod.dev) + React Hook Form |

## Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/       # Authenticated user dashboard
│   │   └── u/[u]/           # Public profile (send anonymous message)
│   ├── api/
│   │   ├── auth/            # NextAuth route
│   │   ├── signup/          # Register new user
│   │   ├── verify-code/     # Verify email OTP
│   │   ├── resend-code/     # Resend verification email
│   │   ├── send-message/    # Send anonymous message to a user
│   │   ├── get-messages/    # Fetch messages (paginated)
│   │   ├── delete-message/  # Delete a message
│   │   ├── accept-messages/ # Get / toggle accept-messages setting
│   │   ├── suggest-messages/# AI-generated message suggestions
│   │   ├── check-username-unique/   # Username availability check
│   │   └── check-username-exists/  # Lookup user before sending
│   └── auth/
│       ├── sign-in/
│       ├── sign-up/
│       └── verify-code/
├── lib/          # Prisma client, Resend client, utilities
├── model/        # TypeScript interfaces
├── schemas/      # Zod validation schemas
├── emails/       # React Email templates
└── types/        # NextAuth type extensions
prisma/
└── schema.prisma # Database schema (User + Message models)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Clone & install

```bash
git clone https://github.com/ManbirS07/anonymessage.git
cd anonymessage
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (https://resend.com)
RESEND_API_KEY="your-resend-api-key"

# Google Gemini AI (https://aistudio.google.com)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Public base URL (used to build shareable profile links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/signup` | Register a new user |
| `POST` | `/api/verify-code` | Verify email OTP |
| `POST` | `/api/resend-code` | Resend verification email |
| `GET` | `/api/check-username-unique` | Check username availability |
| `POST` | `/api/check-username-exists` | Check if a user exists |
| `POST` | `/api/send-message` | Send anonymous message to user |
| `GET` | `/api/get-messages` | Get messages for authenticated user (paginated) |
| `DELETE` | `/api/delete-message/[messageId]` | Delete a message |
| `GET` | `/api/accept-messages` | Get current accept-messages status |
| `POST` | `/api/accept-messages` | Toggle accept-messages setting |
| `POST` | `/api/suggest-messages` | Stream AI-generated message suggestions |

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com/new):

1. Push your repository to GitHub
2. Import it in the Vercel dashboard
3. Add all environment variables from the [Configuration](#2-configure-environment-variables) section
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

The `prebuild` script runs `prisma generate` automatically before each build.
