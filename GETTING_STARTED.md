# Getting Started with CoreComm

Welcome to the CoreComm developer documentation! This guide will help you set up your local development environment and get the application running.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17 or later (LTS recommended).
- **npm**: Comes with Node.js.
- **Git**: For version control.
- **Docker** (Optional): For running local services like Redis or a local Supabase instance.
- **VS Code**: Recommended IDE with the following extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd core-comm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root directory.
2. Add the required environment variables as described in [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

```bash
# Example .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPI_API_KEY=your_vapi_api_key
```

### 4. Database Setup

This project uses Supabase. You need to apply the database migrations to your Supabase project.

1. Log in to your Supabase dashboard.
2. Go to the SQL Editor.
3. Run the SQL scripts located in the `supabase/` directory (or follow `DATABASE_MIGRATION_GUIDE.md`).

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- **`/app`**: Next.js App Router pages and API endpoints.
- **`/components`**: Reusable React components.
- **`/lib`**: Utility functions, Supabase client, and shared logic.
- **`/hooks`**: Custom React hooks.
- **`/supabase`**: Database migrations and types.
- **`/__tests__`**: Unit and integration tests.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code style issues |
| `npm test` | Runs the test suite |

## Troubleshooting

- **Missing Environment Variables**: If the app crashes on startup, double-check your `.env.local` file.
- **Database Connection**: Ensure your IP is allowed in Supabase if you have restrictions enabled.
- **Build Errors**: Run `npm run type-check` to see TypeScript errors.

For more details, refer to the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide (coming soon).
