# Project Instructions — Educational Web Application

## 1. Project Overview

This repository represents part of a long-running, production educational web application.

The application has been actively used and maintained for years. It contains important educational and administrative workflows used by schools and their staff.

This is an existing system, not a greenfield application.

The primary objective of working on this project is to gradually improve:

- Code readability.
- Code organization and cohesion.
- Separation of responsibilities.
- Maintainability.
- Understanding and documentation of existing architectural decisions.

These improvements must never come at the expense of existing functionality or production stability.

**Preserving existing behavior is more important than introducing modern patterns or technologies.**

## 2. Technology Stack

The application uses a combination of the following technologies:

### Frontend
- Vanilla JavaScript.
- React 16.8.6.
- React DOM 16.8.6.
- Webpack 4.
- Babel.
- TypeScript 3.5.
- SCSS / Sass.
- jQuery and several associated plugins.

### Backend
- ASP.NET Core.
- Razor views (.cshtml).

### Runtime and Build Environment
- Node.js: v14.15.0.
- npm.
- Webpack 4.
- node-sass 4.14.
- Existing .NET development and execution environment.

The versions and configuration in package.json are part of the current compatibility context.

Do not assume that newer versions of Node.js, React, Webpack, TypeScript, Sass, or other dependencies are compatible with this application.

Do not upgrade, replace, remove, or introduce dependencies without explicit authorization.

## 3. Repository Context and Limitations

The repository provided for analysis may be incomplete.

Some directories and files are representative samples rather than a complete copy of the production application.

Currently identified areas include:

### src/sactivities

An administrative dashboard used by schools.

Its responsibilities include various administrative workflows, such as:

- Uploading student lists to ticketing-related functionality.
- Creating and managing examinations.
- Other school administrative operations.

This directory should be investigated to understand how its features are organized and implemented.

### src/common

Contains shared JavaScript functionality, utilities, helpers, and styles used across the application.

Investigate how these shared resources are consumed by other parts of the application before proposing organizational changes.

### Root configuration

Important configuration files include:

- package.json
- webpack.config.js
- Activities.cshtml

These files are important for understanding how frontend assets are organized, bundled, and integrated into the ASP.NET Core application.

Do not assume that the visible repository represents every application entry point or dependency.

Never invent missing architectural details.

Clearly distinguish between:
- Confirmed findings.
- Reasonable assumptions.
- Unknown or unverified behavior.

## 4. Critical Project Safety Rules

This is a live production application.

All changes must follow a conservative, incremental approach.

### Strict restrictions

Unless explicitly requested, DO NOT:

- Install or update npm packages.
- Run npm install or npm update.
- Change package.json or package-lock.json.
- Upgrade Node.js or any framework.
- Run Webpack builds.
- Run development servers.
- Run dotnet build, dotnet run, or other application execution commands.
- Run automated tests.
- Modify database structures or backend contracts.
- Change API request or response formats.
- Modify authentication or authorization mechanisms.
- Replace existing libraries with modern alternatives.
- Perform large-scale refactoring.
- Delete code simply because it appears unused.
- Remove compatibility code without understanding its purpose.

Do not attempt to prove that the application works by installing dependencies or building it.

Static inspection and code analysis are the default working methods.

If verification requires executing something, explain why and request permission first.

### Preserve existing functionality

Before modifying any code:

1. Understand the current implementation.
2. Identify its dependencies and consumers.
3. Trace relevant execution paths.
4. Identify potential side effects.
5. Determine whether the proposed change preserves existing behavior.

Never assume that an implementation is unnecessary simply because it appears redundant or outdated.

Existing behavior may depend on conventions or integrations that are not visible in the provided repository.

## 5. Working Methodology: Task-Based Investigation and Improvement

Work in small, clearly defined tasks.

Do not attempt to understand or refactor the entire application in one operation.

Follow these phases:

### Phase 1 — Architecture Discovery

Initially, do not modify any source code.

Investigate:

- Overall repository organization.
- Frontend and backend integration.
- Webpack entry points and output configuration.
- How JavaScript files are loaded by Razor views.
- How Vanilla JavaScript and React coexist.
- How shared resources from src/common are consumed.
- How individual features inside src/sactivities are organized.
- Existing naming conventions and coding patterns.
- Dependencies and communication between modules.

Produce a concise architecture overview.

Clearly identify unknown areas that require additional source files or investigation.

### Phase 2 — Feature-Level Understanding

Investigate individual features independently.

For each feature, identify:

- Its entry point.
- Related JavaScript files.
- Shared dependencies.
- UI and DOM responsibilities.
- API communication.
- State management, if applicable.
- Backend integration.
- Styling dependencies.
- Other modules that depend on it.

Understand the complete execution flow before suggesting modifications.

### Phase 3 — Code Quality Assessment

Evaluate the existing code based on:

- Readability.
- Cohesion.
- Separation of responsibilities.
- Naming consistency.
- Duplication.
- Coupling between modules.
- Dependency direction.
- Maintainability.
- Error handling.
- Existing architectural consistency.

Distinguish between genuine structural problems and personal stylistic preferences.

Do not recommend rewriting working code simply to follow a newer programming style.

### Phase 4 — Incremental Improvements

Only after understanding the relevant implementation, propose improvements.

Each improvement must:

1. Have a clearly defined scope.
2. Explain the existing problem.
3. Explain the proposed solution.
4. Identify affected files and dependencies.
5. Describe possible behavioral risks.
6. Preserve existing interfaces and functionality unless explicitly authorized otherwise.

Prefer small, isolated changes over extensive refactoring.

Avoid combining unrelated improvements into one task.

## 6. Code Modification Principles

When changes are explicitly requested:

- Follow the existing conventions unless there is a justified reason not to.
- Reuse existing utilities and shared functionality where appropriate.
- Avoid introducing unnecessary abstractions.
- Avoid creating unnecessary files or directories.
- Maintain compatibility with the existing runtime.
- Keep changes focused on the requested task.
- Preserve existing selectors, DOM contracts, API contracts, and event behavior.
- Avoid changing unrelated functionality.
- Do not silently fix unrelated issues discovered during implementation.

When refactoring, aim for structural improvement without changing observable behavior.

If a requested improvement could affect existing functionality, explain the risk before proceeding.

## 7. Communication and Reporting

Be explicit and evidence-based.

When investigating, report:

- What was inspected.
- What was discovered.
- How the relevant components interact.
- What remains unknown.
- Which files or additional context would help complete the investigation.

When recommending an improvement, explain:

- Current situation.
- Identified problem.
- Proposed change.
- Expected benefit.
- Potential risks.

Do not claim that code has been tested, built, or verified when it has only been statically inspected.

Avoid generic recommendations. Recommendations must be based on the actual code and its existing architecture.

## 8. Default Behavior

When receiving a new task:

1. Determine its scope.
2. Inspect the relevant files.
3. Understand existing behavior and dependencies.
4. Identify missing information.
5. Explain the findings.
6. Propose the smallest appropriate solution.

Do not start modifying code simply because a possible improvement has been identified.

**The default mode of operation is investigation and analysis, not automatic implementation.**

## 9. Long-Term Objective

The long-term goal is to make the existing application easier to understand, maintain, and extend.

We want to improve the quality of the existing architecture gradually, without introducing unnecessary complexity or destabilizing production functionality.

Think like an engineer maintaining a mature production system, not like a developer starting a new project.
