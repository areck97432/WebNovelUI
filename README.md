# WebNovelUI

A web application designed to provide a clean, distraction-free, and highly responsive environment for reading webnovels. It allows users to browse available novels, read chapters, and customize their reading experience with features like light/dark mode and adjustable font sizes.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Testing](#testing)
- [Deployment](#deployment)

## Project Overview

WebNovelUI aims to offer an immersive reading experience for webnovels. It includes a robust backend for content ingestion and API serving, and a modern React frontend for a seamless user interface. Content is managed through a PostgreSQL database, allowing for efficient retrieval and scalability.

## Features

- **Immersive Reading Experience:** Dedicated reading view with minimal UI elements.
- **Novel Browsing & Discovery:** Landing page displaying a list of available webnovels.
- **Seamless Chapter Navigation:** "Previous Chapter" and "Next Chapter" buttons, and a chapter list for direct jumps.
- **Dynamic Content Handling:** Dynamically loads chapter content and handles new content ingestion.
- **User Interface Customization:** Toggle between Light and Dark mode, and adjustable font size.
- **Admin Content Scan Trigger:** A simple admin interface to trigger content ingestion on demand.
- **Reading Progress Indicator:** Displays current chapter number and total chapters in the reading view.

## Technologies Used

**Backend:**
- Node.js
- NestJS (TypeScript)
- PostgreSQL (Database)
- TypeORM (ORM)

**Frontend:**
- React.js
- Vite (Build Tool)
- TypeScript
- Tailwind CSS
- Axios (HTTP Client)
- React Router DOM (Routing)

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (Node Package Manager)
- PostgreSQL (running instance)
- Git

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Database:**
    Update the database connection details in `backend/src/app.module.ts` to match your PostgreSQL setup. Ensure the database `webnovelui` exists and the user `postgres` (or your chosen user) has access.

    ```typescript
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgre',
      database: 'webnovelui',
      entities: [Novel, Chapter],
      synchronize: true, // Auto-creates schema. Set to false in production.
    }),
    ```

4.  **Prepare Books Directory:**
    Place your webnovel `.txt` files in the `Books/` directory at the project root (e.g., `F:/Coding/WebNovelUI/Books/Emperor's Domination/emperor-s-domination-chapter-1-zn.txt`). The ingestion service expects a specific folder and file naming convention: `{novel-title-slug}/web-novel-slug-chapter-{chapter-number}-zn.txt`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

### Backend

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Start the backend server:**
    ```bash
    npm run start:dev
    ```
    The backend will typically run on `http://localhost:3000`.

3.  **Ingest Content (First Time):**
    Once the backend is running, you can ingest the content from your `Books/` directory into the database. Open your browser and navigate to `http://localhost:5173/admin` (after starting the frontend) and click the "Scan for New Content" button. Alternatively, you can send a POST request to `http://localhost:3000/api/admin/scan-content` using a tool like Postman or curl.

### Frontend

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will typically run on `http://localhost:5173`.

## Testing

### Backend Tests

To run unit and E2E tests for the backend:

```bash
cd backend
npm test
npm run test:e2e
```

### Frontend Tests

To run unit tests for the frontend:

```bash
cd frontend
npm test
```

## Deployment

Dockerfiles are provided for both the backend and frontend to facilitate containerized deployment.

- `backend/Dockerfile`
- `frontend/Dockerfile`

Refer to the respective Dockerfiles for build instructions and consider setting up environment variables for production deployments:

- **Backend:** `DATABASE_URL`, `BOOKS_DIRECTORY`
- **Frontend:** `VITE_API_URL`

Example Docker build and run commands are provided in the `PLAN.md` under section 4.3.