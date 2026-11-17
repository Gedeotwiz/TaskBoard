# TaskBoard

TaskBoard is a lightweight project planning app for organizing tasks and a small team. It runs in the browser and stores its data locally, so it does not require an account or a backend.

## Features

- Organize tasks in **To do**, **In progress**, and **Completed** columns.
- Create, edit, and delete tasks with descriptions, categories, priorities, due dates, and assignees.
- Drag task cards between board columns to update their status.
- Browse work in board, calendar, timeline, and team member views.
- Search tasks by title or category; cycle through priority filters and sort orders.
- Add and remove team members.
- Save tasks and members in browser `localStorage` between visits.

The app starts with sample tasks and team members. Data is stored per browser and is not synced between devices.

## Requirements

- Node.js and npm

## Run locally

```bash
npm install
npm run dev
```

Webpack Dev Server opens the app at `http://localhost:3000`. Changes to source files are served during development.

## Build

```bash
npm run build
```

The production build is written to `dist/`.

## Deploy to GitHub Pages

```bash
npm run deploy
```

The deploy script builds the project and publishes `dist/` using `gh-pages`. The Webpack production asset path is configured for the `/TaskBoard/` GitHub Pages project URL.

## Tech stack

- JavaScript (ES modules)
- CSS
- Webpack and Webpack Dev Server
- Browser `localStorage`

