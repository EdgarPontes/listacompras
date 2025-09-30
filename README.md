# Smart Shopping List Application

This is a full-stack application for managing smart shopping lists, built with Next.js for the frontend and Node.js (Express) for the backend, connected to a PostgreSQL database. It features user authentication, CRUD operations for shopping lists and items, automatic total value calculation, barcode/QR code scanning, list sharing, and a dark/light theme.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [UI/Design](#uidesign)

## Features

- User Authentication (Register, Login) with JWT.
- Create, Read, Update, and Delete (CRUD) shopping lists.
- Add, update, and delete items within shopping lists.
- Automatic calculation of item total price and list total value.
- Barcode/QR code scanner for quick item entry.
- Share shopping lists with other users with view/edit permissions.
- Dark and Light theme support.
- Responsive UI (Mobile-first).
- Glassmorphism UI elements and micro-animations.

## Project Structure

The project is divided into `frontend` and `backend` directories, with a `shared` directory for common TypeScript types.

```
shopping-list-app/
├── backend/                  # Node.js (Express) API
│   ├── src/                  # Backend source code (services, routes, middleware)
│   ├── prisma/               # Prisma schema and migrations
│   ├── .env                  # Environment variables for backend
│   └── package.json          # Backend dependencies
├── frontend/                 # Next.js application
│   ├── src/                  # Frontend source code (pages, components, hooks)
│   ├── .env.local            # Environment variables for frontend
│   └── package.json          # Frontend dependencies
├── shared/                   # Shared TypeScript types (DTOs, interfaces)
└── README.md                 # Project README
```

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install backend dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `backend` directory and configure your environment variables (see [Environment Variables](#environment-variables) section).

4.  Generate the Prisma client:
    ```bash
    npx prisma generate
    ```

5.  Apply database migrations to create the necessary tables in your PostgreSQL database:
    ```bash
    npx prisma migrate dev --name init
    ```

6.  Start the backend development server:
    ```bash
    npm run dev
    ```
    The backend API will be running on `http://localhost:3001`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env.local` file in the `frontend` directory and configure your environment variables (see [Environment Variables](#environment-variables) section).

4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend application will be accessible at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend` directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_shopping_list?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3001
```

-   `DATABASE_URL`: Your PostgreSQL connection string.
-   `JWT_SECRET`: A strong, secret key used for signing JWT tokens. **Change this to a unique, random string.**
-   `PORT`: The port on which the backend server will run.

### Frontend (`frontend/.env.local`)

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

-   `NEXT_PUBLIC_API_URL`: The URL of your backend API.

## Running the Application

1.  Ensure both backend and frontend development servers are running in separate terminal windows.
2.  Open your web browser and navigate to `http://localhost:3000`.

## Testing

To run frontend tests:

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Run the tests:
    ```bash
    npm test
    ```

## UI/Design

The application's UI is built using:

-   **Tailwind CSS**: For utility-first styling.
-   **shadcn/ui**: A collection of re-usable components.
-   **Framer Motion**: For smooth animations.
-   **next-themes**: For dark/light mode functionality.
-   **Lucide React**: For icons.
-   **Glassmorphism**: Applied to card elements for a modern, translucent effect.
-   **Inter Font**: For clear and legible typography.
