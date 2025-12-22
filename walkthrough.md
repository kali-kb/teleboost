# Teleboost Monorepo

## Overview

this repository is a monorepo containing:
- **apps/backend**: NestJS application with Drizzle ORM and PostgreSQL.
- **apps/bot**: NestJS application using `nestjs-telegraf`.
- **apps/frontend**: Vue.js + Vite application using **Tailwind CSS v4**.
- **packages/database**: Shared Drizzle schema and database utilities.

## Setup

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Environment Variables**:
    A `.env` file has been created in the root. Update it with your credentials:
    - `DATABASE_URL`: PostgreSQL connection string.
    - `BOT_TOKEN`: Your Telegram Bot Token.

    Note: `apps/backend` and `apps/bot` are configured to read from this file (or their own if present).

3.  **Build the Database Package**:
    The shared database package must be built before running the apps:
    ```bash
    pnpm run build
    ```
    This compiles the TypeScript in `packages/database` so it can be imported by the backend and bot.

4.  **Database Migration**:
    The database schema is defined in `packages/database`.
    To generate migrations:
    ```bash
    cd packages/database
    pnpm run generate
    ```
    To apply migrations:
    ```bash
    cd packages/database
    pnpm run migrate
    ```

5.  **Running the Apps**:
    You can run all apps in dev mode using Turbo:
    ```bash
    pnpm dev
    ```
    Or run individually:
    - Backend: `cd apps/backend && pnpm run start:dev`
    - Bot: `cd apps/bot && pnpm run start:dev`
    - Frontend: `cd apps/frontend && pnpm run dev`

## Build

To build all applications:
```bash
pnpm build
```

## Deployment

Since this is a monorepo, each part of the app can be deployed independently. Here is how to handle them:

### **1. Shared Database Package**
Both the **Backend** and **Bot** depend on `@teleboost/database`. In a production environment, you must ensure the shared package is built first.
- In your CI/CD pipeline, run `pnpm install` and `pnpm run build --filter @teleboost/database` before building the apps.

### **2. Backend & Bot (NestJS)**
To deploy the NestJS apps (Backend or Bot):
- **Build**: `pnpm build --filter backend` (or `bot`).
- **Start**: Run the pre-compiled code using `node dist/main.js` from within the respective app directory.
- **Env**: Ensure `DATABASE_URL`, `BOT_TOKEN`, and site-specific ports (`BACKEND_PORT`, `BOT_PORT`) are set in the production environment.
- **Migrations**: Always run `pnpm run migrate` in `packages/database` BEFORE starting the new versions of the Backend or Bot.

### **3. Frontend (Vue.js)**
The frontend is a static site:
- **Build**: `pnpm build --filter frontend`.
- **Output**: This creates a `dist` folder in `apps/frontend`.
- **Hosting**: Upload the contents of the `dist` folder to any static hosting provider (Vercel, Netlify, Nginx, S3).
- **Environment**: Use `.env.production` in `apps/frontend` if you need to point to your production Backend API URL.

### **4. Independent Deployment Example (Docker)**
If using Docker, you can create a multi-stage build or separate Dockerfiles for each app.
- Ensure the Docker context includes the root directory so it can access the shared `packages/` and `package.json` configurations.
- Use `pnpm fetch` and `pnpm install --offline` for faster Docker builds.

## Recent Changes (Dec 22, 2025)

1.  **Tailwind CSS v4 Migration**: The frontend has been upgraded to Tailwind CSS v4.
    - Uses the `@tailwindcss/vite` plugin for a CSS-first approach.
    - Configuration is handled directly in CSS and the Vite plugin; no `tailwind.config.js` is required.
    - Updated `tsconfig.node.json` to resolve modern `.mts` type declarations.
2.  **Repository Maintenance**:
    - Added a comprehensive root-level `.gitignore` to keep the repository clean.
    - Verified full build compatibility across the monorepo.

## Git Usage Guide

This project is a monorepo. Here are the best practices for working with Git:

### **1. Basic Workflow**
Always pull the latest changes before starting work:
```bash
git pull origin main
```
Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

### **2. Committing Changes**
Try to keep commits atomic. If you change the backend and the frontend, you can commit them together if they are part of the same feature, or separately if they are independent.
```bash
git add .
git commit -m "feat(frontend): setup tailwind css v4"
```

### **3. Handling the Monorepo**
- **Node Modules**: Never commit `node_modules`. The root `.gitignore` handles this.
- **Lockfile**: Always commit `pnpm-lock.yaml`. It ensures consistent builds across all environments.
- **Partial Checkouts**: If you are only working on one app, you still commit to the same repo, but try to prefix your commit messages (e.g., `fix(bot): ...`, `docs: ...`).

### **4. Synchronization**
If someone else adds a new package or dependency, run:
```bash
pnpm install
```
This will update your local `node_modules` based on the latest `pnpm-lock.yaml`.

### **5. Pushing**
```bash
git push origin feature/your-feature-name
```
