# TrustSit – Project Context

## Project Overview

TrustSit is a web application that connects parents who need childcare with babysitters who are available to take care of children.

The platform is task-based:

- Parents create childcare tasks (date, time, location, details).
- Babysitters browse tasks and apply.
- Parents select a babysitter for a task.
- After completion, parents rate babysitters.
- Administrators oversee the entire system.

The application focuses ONLY on digital coordination. Physical childcare, legal responsibility, and real-world safety are explicitly out of scope.

---

## Tech Stack

- Frontend: React
- Backend: Django + Django REST Framework
- Database: PostgreSQL

---

## Current State (IMPORTANT)

- The database was deleted.
- Django migrations are currently broken.
- The project is not runnable.
- Data preservation is NOT required.
- The goal is to fix migrations, restore a working backend, align frontend & backend, and continue development.

---

## User Roles

### Parent

A Parent is a registered user who creates childcare tasks.

Capabilities:

- Register and log in
- Create and edit a parent profile
- Create, update, and cancel childcare tasks
- View babysitter applications
- Accept or reject babysitters
- View task history
- Rate babysitters after completed tasks

---

### Babysitter

A Babysitter is a registered user who applies for available childcare tasks.

Capabilities:

- Register and log in
- Create and edit a babysitter profile
- Define availability
- Browse, search, and filter tasks
- Apply for tasks
- Track application status
- View assigned and completed tasks
- Receive ratings from parents
- Cancel participation at least 48 hours before task start

---

### Administrator (Super Admin)

Administrator has full system access.

Capabilities:

- Manage parents and babysitters
- View and edit all tasks
- Suspend, archive, or delete users
- Intervene in disputes or irregularities
- Access admin dashboard with system statistics

---

## Authentication & Session Management

- Users authenticate via email and password.
- Backend issues:
  - access token
  - refresh token
  - sessionId
- Access and refresh tokens are stored in HTTP-only cookies.
- sessionId is returned to the frontend.
- Token refresh is handled automatically when access token expires.
- Logout clears sessionId and cookies.

---

## Profiles

### Parent Profile Fields

- Full name
- Email
- Phone number
- Address / location
- Number of children
- Age groups of children (0–2, 3–6, 7+)
- Special notes (allergies, medical conditions, pets)

### Babysitter Profile Fields

- Full name
- Email
- Phone number
- Location
- Years of experience
- Supported child age groups
- Maximum number of children
- Hourly rate (optional)
- Availability (days & hours)
- Additional qualifications (certificates, first aid, etc.)

---

## Tasks (Core Entity)

A Task represents a childcare request created by a Parent.

Task fields include:

- Date and time
- Location
- Duration
- Number of children
- Child age groups
- Description / notes
- Budget (optional)
- Status (open, assigned, completed, canceled)

---

## Task Flow

1. Parent creates a task.
2. Babysitters browse available tasks.
3. Babysitter applies for a task.
4. Parent reviews applications.
5. Parent selects a babysitter.
6. Task becomes assigned.
7. Babysitter completes the task.
8. Parent submits a rating.

---

## Task Search & Filtering (Babysitter)

Babysitters can:

- Search tasks by keywords (location, description)
- Filter by:
  - Date & time
  - Location
  - Duration
  - Child age group
  - Number of children
  - Budget

---

## Applications & Status Rules

- Babysitter can apply to multiple tasks.
- Parent can accept only one babysitter per task.
- Babysitter may cancel participation ONLY if at least 48 hours remain before task start.
- Cancellations are recorded for reliability tracking.

---

## Ratings

- Only parents can rate babysitters.
- Rating is allowed only after task completion.
- Rating includes:
  - Numeric score
  - Optional comment
- Ratings are visible in babysitter profiles and history.

---

## Notifications

Users receive notifications when:

- A babysitter applies for a task
- A babysitter is accepted or rejected
- Task status changes
- A rating is submitted

Notifications are:

- Shown inside the application
- Sent via email

---

## Admin Rules

- Admin can archive users (soft-disable).
- Admin can permanently delete users.
- Admin can view all tasks and users.
- Admin dashboard provides basic system statistics.

---

## Migration & Development Rules (CRITICAL)

- Database reset is allowed.
- Existing models should NOT be deleted unless necessary.
- Fix migrations instead of recreating the entire project unless explicitly approved.
- API contracts should not change without documenting the change.
- Frontend must remain aligned with backend responses.

---

## How the AI Assistant Should Work

1. Read this file first.
2. Scan the entire repository.
3. Identify broken migrations and backend issues.
4. Propose a step-by-step fix plan.
5. Wait for confirmation before applying major changes.
6. Make incremental, explainable changes.
