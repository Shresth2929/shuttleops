# ShuttleOps
## Smart Campus Transit Operations Console

ShuttleOps is a campus transportation operations console built for managing shuttle bookings, driver schedules, route assignments, trip history, and operational demand in a single operational workspace.

The application is designed for a campus or enterprise mobility environment where dispatchers need a clear understanding of live demand, fleet utilization, driver availability, and service reliability without relying on a large operational stack during the frontend prototype phase.

## Project Overview

ShuttleOps supports the core workflows required to operate a shuttle service across a campus or company environment:

- shuttle booking management
- driver availability and scheduling
- route allocation
- vehicle assignment visibility
- trip history tracking
- demand and usage analytics

The product focuses on operational clarity, clean data relationships, and responsive desktop-first workflow management.

## Problem Statement

Campus transportation requires coordination across several moving parts:

- passengers request rides at different times across campus
- drivers need valid work windows and rest breaks
- routes must be assigned consistently to vehicles and drivers
- dispatch teams need visibility into demand peaks and underutilized routes
- cancellations, no-shows, and operational exceptions must be visible immediately

Without a unified operations interface, these tasks become fragmented and difficult to manage reliably.

## Solution

ShuttleOps delivers a unified frontend operations console that consolidates booking lifecycle management, driver scheduling, route status, and demand intelligence into a single interface.

The product emphasizes:

- clear booking and dispatch workflows
- driver timeline management
- route and assignment visibility
- operational KPI summaries
- high-signal analytics derived from current mock data
- local persistence for realistic demo interaction

## Key Features

### Booking Management

- Create bookings
- Edit bookings
- Cancel bookings
- Search and filter booking records
- Booking detail drawer
- Booking lifecycle tracking
- Passenger and route context
- Status tracking across scheduled, active, completed, cancelled and no-show flows

### Driver Scheduling

- Driver availability overview
- Timeline-based driver schedule
- Duty windows
- Break blocks
- Pickup and drop activities
- Vehicle changes
- Empty leg scheduling
- Activity editing and deletions
- Schedule validation to prevent invalid time windows and overlaps

### Route Management

- Route list and filtering
- Route stop sequence visualization
- Driver assignment
- Vehicle assignment
- Route detail drawer
- Operational metadata such as duration, distance and peak hour

### Demand & Usage

- Hourly demand profile
- Route utilization metrics
- Driver utilization visibility
- Peak demand analysis
- Booking status insights
- Operational summaries derived from current mock records

### Trip History

- Search trip logs
- Filter trip records
- Review route and passenger data
- View trip details in a focused drawer
- Review trip timing and status history

## Technology Stack

- Angular 18
- TypeScript
- Angular Signals
- RxJS
- Angular Router
- Reactive Forms
- Angular Material
- SCSS
- LocalStorage-based persistence for demo state
- Jasmine and Karma for unit testing
- Git and GitHub for version control

## Architecture

The application follows a feature-oriented Angular structure that matches the current repository layout.

### Actual project structure

```text
src/
  app/
    app.component.ts
    app.routes.ts
    app.config.ts
    core/
      data/
      models/
      services/
    features/
      overview/
      bookings/
      drivers/
      routes/
      analytics/
      trips/
      not-found/
    layout/
      app-shell/
      header/
      sidebar/
    shared/
      components/
```

### Architectural responsibilities

- core
  - shared business logic, models, typed interfaces, and application service layer
- shared
  - reusable UI building blocks such as stat cards, status badges, page headers, empty states and confirmation dialogs
- features
  - domain-specific views such as overview, bookings, drivers, routes, analytics and trips
- services
  - data access, state management, validation, localStorage persistence, and notification behavior
- models
  - strongly typed booking, driver, route, trip, user, vehicle and demand object definitions
- data
  - realistic mock data used to simulate an operations console with relationships between bookings, routes, vehicles and drivers
- layout
  - application shell, navigation, header and responsive shell behavior

## Engineering Decisions

### Angular Signals

Signals are used to manage reactive application state, including selected records, filters, drawer state and derived UI state. This keeps state updates compact and predictable while staying aligned with Angular’s reactive model.

### RxJS

RxJS is used for asynchronous workflows and service-based data access patterns. This keeps the architecture REST-ready and makes it straightforward to replace mock simulation with an API layer later.

### Service abstraction

The project separates the UI from the data layer via services. This makes the app ready for REST API integration without large UI rewrites.

### Lazy-loaded routes

Feature routes are lazy-loaded through Angular route definitions. This keeps the initial bundle lighter and aligns with a scalable enterprise frontend structure.

### Reusable components

Shared UI components reduce repetition and keep business workflows consistent across the app.

### Reactive Forms

Reactive Forms are used where user input and validation are important, particularly in booking and activity editing workflows.

### Centralized models

Strongly typed interfaces keep entity relationships clear and reduce drift between the data layer and UI logic.

### LocalStorage

LocalStorage is used for demo persistence so important operational changes remain available after a page refresh without adding a backend dependency.

## Performance

The implemented performance approach is intentionally pragmatic and aligned to the current project scope.

- lazy-loaded feature routes
- computed signals for derived state
- reusable UI components
- client-side filtering and sorting on a manageable mock dataset
- limited, targeted state updates without unnecessary rerenders
- no large, unnecessary external libraries added

The app does not claim production-scale backend performance characteristics. For larger datasets, filtering, sorting, pagination and aggregation can be moved to an API or database layer as part of a subsequent architecture phase.

## Validation and Error Handling

The app includes several user-facing safeguards and validation patterns:

- booking form validation
- schedule validation for driver activities
- invalid time prevention
- overlap detection in driver schedules
- route and assignment validation
- empty states for no-result scenarios
- loading states while data is being resolved
- success notifications for create/update/cancel actions
- error feedback for invalid scheduling decisions
- confirmation flows for destructive operations

## Testing

The project includes a focused suite of Jasmine/Karma tests covering important business logic and service behavior.

The following test areas are covered in the current repository:

- booking creation
- booking update
- booking cancellation
- filtering behavior
- driver schedule validation
- activity creation and deletion
- analytics demand calculations

Verified current result:

- 18 tests passing

This is the current verified state of the project in the repository.

## Complexity Notes

### Booking Filtering
O(n) for the current client-side dataset.

### Sorting
O(n log n).

### Demand Aggregation
O(n) across the active booking set for each aggregation pass.

### Driver Timeline
Approximately O(D × A), where D is the number of drivers and A is the average number of activities per driver.

For larger production datasets, these operations can be pushed to API-driven filtering, pagination, and aggregation services.

## Running Locally

Use the project commands defined in the repository scripts.

```bash
npm install
npm start
# or
npm run start
```

Run tests:

```bash
npm test
```

Run a production build:

```bash
npm run build
```

## Future Improvements

Planned future enhancements for a real production rollout include:

- REST backend integration
- authentication and role-based authorization
- real-time shuttle tracking and dispatch updates
- WebSocket-based operational notifications
- map integration for route visibility
- production-grade notification escalation
- server-side pagination and filtering
- advanced demand forecasting and capacity planning

These are future roadmap items and are not part of the current implementation.

## Project Structure

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

## Assignment Context

This project was developed as a frontend implementation of a shuttle management case study for a campus transportation operational environment. The focus is on a realistic operations console experience with booking workflows, route management, driver scheduling, trip history and insight-driven demand analysis.

## Summary

ShuttleOps is a polished, desktop-first operations dashboard designed to help teams manage campus transportation workflows in a single interface. The current implementation focuses on the real operational needs of shuttle dispatch, scheduling, route management, and analytics while keeping the frontend architecture maintainable and ready for future API and backend integration.
