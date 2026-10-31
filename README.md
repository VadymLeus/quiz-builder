# Quiz Builder

A small full-stack app for building quizzes. You can create a quiz with several types of questions, see all quizzes in a list, open any quiz in a read-only view and delete quizzes you no longer need.

- **Backend:** Node.js, Express 4, TypeScript, Prisma 5 + SQLite, Zod
- **Frontend:** Next.js (Pages Router), React, TypeScript, React Hook Form + Zod, CSS Modules
- **Tooling:** ESLint and Prettier in both projects

## Features

- Create a quiz with a title and one or more questions, added and removed dynamically
- Three question types:
  - **True / False** – radio buttons for the correct answer
  - **Short answer** – a text input with the expected answer
  - **Multiple choice** – several options, one or more of them marked as correct
- Quiz list with title, number of questions and a delete button
- Modify an existing quiz: the same form is reused and pre-filled with the saved data
- Quiz detail page that shows the structure of the quiz in read-only mode (correct answers are pre-selected)
- Validation on both sides: the form shows field errors, and the API validates every request again with Zod
- Responsive layout (works on phones)

## Project structure

```
quiz-builder/
├── backend/
│   ├── prisma/            # schema.prisma, migrations, seed script, sample-quiz.json
│   └── src/
│       ├── config/        # environment variables (validated with Zod)
│       ├── controllers/   # parse the request, call the service, send the response
│       ├── services/      # business logic and database access (Prisma)
│       ├── routes/        # URL -> controller mapping
│       ├── schemas/       # Zod schemas for request bodies
│       ├── middleware/    # error handling
│       └── lib/           # Prisma client, HttpError, async handler
├── frontend/
│   ├── pages/             # /create, /quizzes, /quizzes/[id]
│   ├── components/        # layout, quiz form, list item, read-only question view
│   ├── services/          # API client (fetch wrapper)
│   ├── schemas/           # Zod schema and mapper for the form
│   ├── types/             # shared TypeScript types
│   └── styles/            # global CSS and CSS Modules
└── README.md
```

## Requirements

- Node.js 20 or newer (LTS recommended) and npm
- Git

No database server is needed: the app uses a local SQLite file.

## Getting started

Run the backend and the frontend in two separate terminals.

### 1. Backend (http://localhost:4000)

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

On Windows PowerShell and Command Prompt, `cp` can be replaced with `copy .env.example .env`.

What these commands do:

- `npm install` installs dependencies and generates the Prisma client.
- `cp .env.example .env` creates your local configuration (see "Environment variables" below). The `.env` file is not committed.
- `npx prisma migrate dev --name init` creates the SQLite database `backend/prisma/dev.db` and applies the migrations from `backend/prisma/migrations`. When you clone a repository that already contains migrations you can use `npm run db:deploy` instead.
- `npm run dev` starts the API with auto-reload. Check it with `http://localhost:4000/health`.

For a production-style run use `npm run build` and then `npm start`.

### 2. Frontend (http://localhost:3000)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The root URL redirects to the quiz list.

## Database setup

The database is SQLite, managed with Prisma.

| Command                             | What it does                                                |
| ----------------------------------- | ----------------------------------------------------------- |
| `npx prisma migrate dev --name <n>` | Create and apply a migration after changing `schema.prisma` |
| `npm run db:deploy`                 | Apply existing migrations (use this on a fresh clone)       |
| `npm run db:seed`                   | Insert the sample quiz (skipped if it already exists)       |
| `npm run db:studio`                 | Open Prisma Studio, a browser UI to inspect the data        |

To start from scratch, delete `backend/prisma/dev.db` and run the migration command again.

## Creating a sample quiz

Pick any of these:

**a) In the UI.** Open http://localhost:3000/create, enter a title, add questions with the buttons under the form and press "Create quiz".

**b) With the seed script.** From `backend`:

```bash
npm run db:seed
```

This inserts the quiz from `backend/prisma/sample-quiz.json` ("JavaScript Basics": one True / False, one short answer and one multiple choice question).

**c) With the API.** From `backend`, with the server running:

```bash
curl -X POST http://localhost:4000/quizzes \
  -H "Content-Type: application/json" \
  -d @prisma/sample-quiz.json
```

On Windows PowerShell use `curl.exe` instead of `curl`, and put the command on one line.

## API

Base URL: `http://localhost:4000`

| Method   | Path           | Description                                       | Success |
| -------- | -------------- | ------------------------------------------------- | ------- |
| `POST`   | `/quizzes`     | Create a quiz with its questions                  | `201`   |
| `GET`    | `/quizzes`     | List quizzes (title and number of questions)      | `200`   |
| `GET`    | `/quizzes/:id` | Full quiz with all questions                      | `200`   |
| `PUT`    | `/quizzes/:id` | Replace the title and questions of a quiz         | `200`   |
| `DELETE` | `/quizzes/:id` | Delete a quiz (its questions are removed as well) | `204`   |
| `GET`    | `/health`      | Health check                                      | `200`   |

### Request body of `POST /quizzes` and `PUT /quizzes/:id`

```json
{
  "title": "JavaScript Basics",
  "questions": [
    {
      "type": "BOOLEAN",
      "text": "JavaScript and Java are the same language.",
      "correctAnswer": false
    },
    {
      "type": "INPUT",
      "text": "Which keyword declares a constant?",
      "correctAnswer": "const"
    },
    {
      "type": "CHECKBOX",
      "text": "Which of these are primitive types?",
      "options": [
        { "text": "string", "isCorrect": true },
        { "text": "object", "isCorrect": false }
      ]
    }
  ]
}
```

Rules: a title and at least one question are required; a `CHECKBOX` question needs 2 to 10 options and at least one correct option; texts cannot be empty.

### Response of `GET /quizzes`

```json
[
  {
    "id": "cmv...",
    "title": "JavaScript Basics",
    "questionCount": 3,
    "createdAt": "2026-10-31T13:15:40.133Z"
  }
]
```

### Errors

Every error has the same shape. `details` is present for validation errors.

```json
{
  "error": {
    "message": "Validation failed",
    "details": [
      { "path": "questions.0.text", "message": "Question text is required" }
    ]
  }
}
```

Status codes: `400` invalid input or malformed JSON, `404` quiz or route not found, `500` unexpected error.

## Environment variables

Real `.env` files are never committed; the repository contains only `.env.example` templates.

**`backend/.env`**

| Variable       | Default                 | Description                                            |
| -------------- | ----------------------- | ------------------------------------------------------ |
| `DATABASE_URL` | `file:./dev.db`         | SQLite file, relative to the `backend/prisma` folder   |
| `PORT`         | `4000`                  | Port of the API                                        |
| `CORS_ORIGIN`  | `http://localhost:3000` | Origin(s) allowed to call the API, separated by commas |

**`frontend/.env.local`**

| Variable              | Default                 | Description                 |
| --------------------- | ----------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL of the backend API |

## Code quality

Both projects use ESLint and Prettier. Run these in `backend` and in `frontend`:

```bash
npm run format        # format all files with Prettier
npm run format:check  # check formatting without changing files
npm run lint          # ESLint
npm run typecheck     # TypeScript, no emit
```

## Design notes

- **Layers in the backend.** Controllers only translate HTTP to function calls, services hold the logic, and Prisma is used only inside services. Errors from any layer end up in one error middleware, so responses are consistent.
- **Validation twice.** The browser form is validated for fast feedback, and the API validates again because it can never trust the client. The question type is a discriminated union (`z.discriminatedUnion`), so each type is validated with its own rules.
- **Data model.** `Quiz` has many `Question`s, and a multiple-choice `Question` has many `AnswerOption`s. Deleting a quiz cascades to its questions and options. The question type is stored as a string because Prisma 5 does not support enums on SQLite; the allowed values are enforced by Zod.
- **Form state.** The form uses one flat shape for all question types, so the data never has to be reshaped. The fields that matter for a question are picked by its type, both in validation and when the request body is built.
- **Modifying.** `PUT /quizzes/:id` accepts the same body as `POST`. The old questions are deleted and the new ones are created inside one database transaction, so a quiz is never left half-updated.
- **Deleting.** The quiz disappears from the page only after the server confirmed the deletion. Errors are shown above the list.

## Possible improvements

- Automated tests (API tests with Supertest, component tests with Testing Library)
- Reordering questions by drag and drop
- A mode for taking a quiz and scoring the answers
- Pagination and search in the quiz list
- Docker Compose with PostgreSQL
