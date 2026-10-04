# I-Track

I-Track is a lightweight full-stack issue tracking application that allows authenticated users to create, manage, filter, and discuss issues through a centralized dashboard. It includes role-based access control, issue assignment, status and priority management, comments, authentication, and database persistence.

## Features

### Authentication

* User registration and login
* Secure password hashing with bcrypt
* JWT-based authentication
* HTTP-only authentication cookie
* Protected application routes
* Logout functionality

### Issue Management

* Create issues
* View individual issues
* Edit issue title and description
* Change priority and status
* Assign and reassign issues
* Add comments
* View issue creator and assignee
* Filter issues by:

  * Status
  * Priority
  * Assigned user

### Role-Based Access Control

I-Track has two roles:

* **STANDARD** — can create and manage issues and comments but cannot assign issues to users.
* **ADMIN** — has the additional ability to assign and reassign issues.

Authorization is enforced on the server rather than relying only on the frontend.

### Dashboard

The dashboard provides:

* Total issue count
* Issue counts by status
* Issue counts by priority
* Issues assigned to the logged-in user
* Filtering controls
* Responsive issue table
* Status and priority charts
* Light/dark theme support

## Technology Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Frontend         | Next.js 16, React 19             |
| Styling          | Tailwind CSS 4                   |
| Data fetching    | TanStack Query                   |
| Charts           | Recharts                         |
| Backend          | Next.js API Routes               |
| Authentication   | JWT (`jose`) + HTTP-only cookies |
| Password hashing | bcryptjs                         |
| ORM              | Prisma 7                         |
| Database         | MySQL 8.4                        |
| Database adapter | Prisma MariaDB adapter           |
| Language         | TypeScript                       |
| Containerization | Docker / Docker Compose          |

## Architecture

```text
┌──────────────────────────────┐
│          Browser             │
│     React / Next.js UI       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Next.js API Routes     │
│                              │
│ Authentication               │
│ Issue CRUD                   │
│ Comments                     │
│ Authorization                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           Prisma             │
│       ORM / Data Access      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          MySQL 8.4           │
│                              │
│ User                         │
│ Issue                        │
│ Comment                      │
└──────────────────────────────┘
```

The application can also be run as a Docker Compose deployment:

```text
Docker Compose
├── Next.js application
└── MySQL database
```

## Database Design

The core data model contains three entities:

### User

Stores:

* Name
* Unique email
* Password hash
* Role
* Creation timestamp

A user can:

* Create multiple issues
* Be assigned multiple issues
* Create multiple comments

### Issue

Stores:

* Title
* Description
* Priority
* Status
* Creator
* Optional assignee
* Creation and update timestamps

Each issue has exactly one creator and can have zero or one assignee.

### Comment

Stores:

* Comment content
* Author
* Associated issue
* Creation timestamp

This creates the following relationships:

```text
User 1 ──────── * Issue
       creator

User 1 ──────── * Issue
       assignee

User 1 ──────── * Comment

Issue 1 ─────── * Comment
```

Foreign keys and indexes are used to maintain referential integrity and support common queries.

## Issue Workflow

Issues use four statuses:

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

A resolved issue can also be moved back to `IN_PROGRESS` if the problem is not actually fixed.

Priorities are:

```text
LOW
MEDIUM
HIGH
```

## Security Decisions

Several security decisions were made during implementation:

* Passwords are never stored directly; only bcrypt hashes are stored.
* Email addresses are normalized to lowercase.
* Authentication tokens are stored in HTTP-only cookies.
* The authenticated user's ID is obtained server-side rather than trusting a client-provided creator ID.
* Role checks are performed inside API routes.
* Standard users cannot bypass assignment restrictions by manipulating frontend requests.
* User email addresses are unique at the database level.
* Foreign keys protect issue and comment relationships.
* Environment variables are used for database credentials and JWT secrets.
* `.env` files are excluded from Docker build contexts.

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:3306/i_track"
SHADOW_DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:3306/prisma_shadow"
JWT_SECRET="your-long-random-secret"
```

Do not commit `.env` to Git.

## Local Development

### Prerequisites

* Node.js 22+
* MySQL 8+
* npm

### Install dependencies

```bash
npm install
```

### Configure the database

Create the required MySQL databases and application user, then configure `DATABASE_URL` in `.env`.

Run the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client when required:

```bash
npx prisma generate
```

### Start the application

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Production build

Verify the production build with:

```bash
npm run build
```

Start the production server with:

```bash
npm run start
```

## Docker

The repository includes:

* `Dockerfile`
* `docker-compose.yml`
* `.dockerignore`

The Docker configuration builds a Next.js standalone production application and provides a MySQL 8.4 service.

### Start with Docker Compose

```bash
docker compose up --build
```

The application is exposed on:

```text
http://localhost:3000
```

The Docker setup runs the Prisma migrations before starting the Next.js server.


## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Issues

```text
GET  /api/issues
POST /api/issues

GET   /api/issues/:id
PATCH /api/issues/:id
```

### Comments

```text
GET  /api/issues/:id/comments
POST /api/issues/:id/comments
```

Issue listing supports filtering by status, priority, and assigned user.

## Design Decisions

### Next.js API Routes

The backend was implemented using Next.js API routes rather than introducing a separate Express server.

This keeps the project lightweight and allows the frontend and backend to share a single deployment unit.

### Prisma

Prisma provides:

* Type-safe database access
* Schema-based database design
* Migrations
* Relationship handling
* Query abstraction

### TanStack Query

TanStack Query manages server state on the client and provides caching, loading states, mutation handling, and query invalidation.

### Server-Side Authorization

Permissions are enforced in API routes rather than only hiding UI controls.

This means a user cannot gain additional privileges simply by modifying frontend requests.

## Known Limitations

The current implementation intentionally focuses on the core assessment requirements.

Potential improvements include:

* User-selection dropdowns instead of entering assignee IDs
* Activity/audit history
* Email notifications
* Pagination for large issue lists
* Optimistic updates
* Automated tests
* More granular permissions
* Issue deletion/archive functionality
* Production-grade secret management
* Automated CI/CD

## Project Structure

```text
i-track/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   └── issues/
│   ├── components/
│   ├── dashboard/
│   ├── issues/
│   ├── login/
│   ├── register/
│   ├── generated/
│   └── lib/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── next.config.ts
├── prisma7.config.ts
├── package.json
└── README.md
```

## Development Approach

The project was developed incrementally, with separate commits for major milestones including:

1. Project initialization
2. Database schema
3. User registration
4. Authentication
5. Database adapter configuration
6. Login endpoint
7. Issue CRUD and comments
8. Initial UI and themes
9. Dashboard and complete issue tracking UI
10. Docker deployment configuration

This incremental approach made it easier to isolate and debug problems while keeping the project history understandable.

## Future Improvements

With additional development time, I-Track could evolve into a more complete issue management platform by adding:

* Automated test coverage
* CI/CD pipelines
* Rich activity logs
* Email-based invitations
* Notifications
* Advanced search
* Pagination
* File attachments
* More granular permissions
* Production monitoring and logging
* Improved user and assignee management

## License

This project was developed for an assessment.
