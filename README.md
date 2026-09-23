# ShuttleOps
## Smart Campus Transit Operations Console

ShuttleOps is a campus shuttle operations dashboard designed to help operations teams manage bookings, driver schedules, routing, demand analytics, and trip history from a single interface.

This project focuses on the day-to-day operational needs of a campus transportation service, giving dispatch teams a clear overview of fleet activity, outstanding booking requests, driver availability, and route performance in a responsive, desktop-first console.

## 1. Project Overview

ShuttleOps supports the core operational workflows required to run a campus shuttle service effectively:

- booking management
- driver scheduling and activity coordination
- route planning and assignment visibility
- vehicle and driver allocation review
- demand and usage analytics
- trip history tracking

The product is designed for clarity, operational efficiency, and realistic workflow simulation within a frontend-only prototype.

## 2. Problem Statement

Campus transportation teams must coordinate multiple workstreams at the same time:

- passengers request rides across different campus zones
- drivers need valid schedules and activity windows
- routes must be assigned consistently to drivers and vehicles
- operations teams need to identify demand spikes and service bottlenecks
- cancellations, no-shows, and exceptions must be visible quickly

Without a unified operational console, these tasks become fragmented, difficult to track, and harder to manage reliably.

## 3. Solution

ShuttleOps brings booking, scheduling, route management, trip history, and analytics into one operations dashboard.

The project is built as a frontend-focused management tool that lets users:

- review operational activity at a glance
- update bookings and driver schedules
- review route and assignment details
- inspect demand patterns from current mock data
- maintain state locally within the browser

This makes it suitable as a practical demo and assignment project for campus shuttle operations planning.

## 4. Key Features

- Operations overview dashboard
- Booking management
- Search and filtering
- Booking creation, editing, and cancellation
- Driver scheduling and activity management
- Route management
- Vehicle, driver, and route assignment
- Analytics and demand metrics
- Trip history
- Local persistence
- Responsive interface
- Accessibility considerations

### Additional highlights

- Booking lifecycle tracking for scheduled, active, completed, cancelled, and no-show states
- Driver activity validation to prevent invalid or overlapping schedules
- Route detail review for assignment and scheduling context
- Operational KPI summaries and traffic-demand views
- Empty states and feedback for filtered or empty datasets
- Browser-based persistence for a realistic demo workflow

## 5. Tech Stack

- Angular 18
- TypeScript
- SCSS
- Angular Material
- RxJS
- Angular Router
- Reactive Forms
- Jasmine and Karma for testing

## 6. Application Structure / Architecture

The application follows a feature-oriented Angular architecture built around modular domain areas.

The codebase is organized into a few core layers:

- core: shared models, services, and business logic
- features: operational screens such as overview, bookings, drivers, routes, analytics, and trips
- layout: app shell, navigation, header, and shell composition
- shared: reusable UI components such as badges, cards, dialogs, and states
- data: mock data used to simulate realistic shuttle operations

This structure keeps the app maintainable and makes the feature boundaries clear while remaining suitable for a frontend-only assignment.

## 7. Main Modules / Screens

### Overview
A high-level operations dashboard showing key service metrics and recent activity.

### Bookings
Supports booking review, filtering, creation, updating, and cancellation.

### Drivers
Provides visibility into driver schedules, availability, and activity management.

### Routes
Displays route information, stop context, and driver/vehicle assignment relationships.

### Analytics
Shows usage patterns and operational demand data through summaries and metrics.

### Trip History
Provides trip log review and detailed trip inspection across historical records.

## 8. Data and State Management

The current version uses mock or demo data rather than a production backend.

- booking, driver, route, trip, and vehicle information is seeded from local mock datasets
- the UI relies on Angular services to manage state and interactions
- browser local persistence is used to retain operational changes between refreshes
- the project does not include a production API, database, or backend service layer

This is intentional for the current implementation and keeps the app focused on frontend workflow management.

## 9. Validation and Error Handling

The application includes practical validation and user feedback to support operational correctness:

- booking form validation
- driver schedule conflict checks
- invalid time-window prevention
- route and assignment validation
- empty-state handling for no-result searches
- confirmation steps for destructive actions
- status feedback for create, update, and cancellation flows

These behaviors are designed to make the console feel realistic while remaining within the scope of a frontend demo.

## 10. Testing

The project includes a focused test suite covering core service and business logic.

Current verified status:

- 18 passing unit tests

This confirms the current implementation has passing automated checks for the included logic and workflows.

## 11. Production Build

The project currently builds successfully with:

```bash
npm run build
```

This confirms the Angular production build is functioning for the current codebase.

## 12. Local Setup

To run the project locally:

```bash
npm install
npm start
```

Then open the application in a browser at:

```text
http://localhost:4200
```

## 13. Project Structure

```text
.
├── angular.json
├── karma.conf.js
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── public/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── core/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── features/
│   │   │   ├── analytics/
│   │   │   ├── bookings/
│   │   │   ├── drivers/
│   │   │   ├── not-found/
│   │   │   ├── overview/
│   │   │   ├── routes/
│   │   │   └── trips/
│   │   ├── layout/
│   │   │   ├── app-shell/
│   │   │   ├── header/
│   │   │   └── sidebar/
│   │   └── shared/
│   │       └── components/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   └── styles/
└── dist/
```

## 14. Current Limitations

This version of ShuttleOps is a frontend-focused operations dashboard and does not include the following production capabilities:

- no production backend
- no authentication
- no real-time GPS tracking
- no map integration
- no production forecasting service

These limitations are clearly understood and are not presented as active features in the current application.

## 15. Future Improvements

Potential future enhancements include:

- real backend and API integration
- authentication and role-based authorization
- real-time fleet tracking and dispatch notifications
- map-based route visualization
- production forecasting and capacity planning
- server-side filtering and data aggregation at scale

## 16. Assignment Context

This project is a frontend assignment and prototype for a smart campus shuttle operations console. The goal is to demonstrate realistic operations management workflows in a clean and usable interface, including booking handling, schedule optimization, route oversight, trip review, and operational analytics.

The current implementation is intentionally focused on providing a strong user experience for operational planning and console-style business workflows without claiming production-grade backend infrastructure or live operational services.
