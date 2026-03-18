# AGENTS.md

## NestJS Project – AI Coding Agent Guidelines

This document defines the architectural principles, coding standards, and behavioral rules that AI coding agents MUST follow when generating or modifying code in this NestJS project.

The goal is long-term maintainability, explicit contracts, strict type safety, and predictable system behavior.

---

## 1. Core Philosophy

This project follows:

- Vertical Slice Architecture (feature-based structure)
- Explicit Contracts (DTO-first design)
- Domain isolation
- Deterministic behavior
- Testable services
- Observability by default
- Clear dependency direction
- No hidden side-effects

Agents must prioritize clarity over cleverness.

---

## 2. Architectural Style

We follow a pragmatic Clean Architecture approach.

Layer responsibility:

Controller → Application Service → Domain → Repository → Infrastructure

Strict dependency rule:

- Outer layers may depend on inner layers.
- Inner layers must NEVER depend on outer layers.
- Domain must not depend on NestJS or ORM.

---

## 3. Project Structure (Feature-Based)

Feature-based structure is mandatory.

src/
modules/
user/
controller/
service/
domain/
dto/
repository/
user.module.ts
project/
auth/
common/
filters/
interceptors/
guards/
decorators/
utils/

Rules:

- Each feature owns its entire vertical slice.
- No global `services/` or `controllers/` folders.
- Shared logic must live in `common/`.
- Cross-module imports are discouraged unless explicitly exposed.

---

## 4. Controller Rules

Controllers must:

- Be thin
- Contain no business logic
- Only orchestrate request → service → response
- Use DTO validation
- Return standardized responses

Always:

- Use explicit DTOs
- Use class-validator
- Use Swagger decorators
- Return Response DTOs

Never:

- Access database directly
- Mutate request objects
- Perform business rule evaluation

---

## 5. DTO-First Development

Every API must define:

- Request DTO
- Response DTO

Rules:

- No `any`
- No implicit response shapes
- Never return ORM entities directly
- Explicit mapping is required

Bad:

return this.userRepository.find();

Good:

const user = await this.userRepository.find();
return new UserResponseDto(user);

---

## 6. Service Layer Rules

Services:

- Contain business logic only
- Must be deterministic
- Must not depend on Request/Response
- Must not return ORM entities

Services must:

- Inject repositories
- Throw domain-specific exceptions
- Avoid hidden state
- Be unit-testable in isolation

---

## 7. Repository Rules

Repositories:

- Encapsulate all database logic
- Must not contain business logic
- Must not leak ORM entities outside
- Return domain models or mapped objects

---

## 8. Domain Layer

Domain contains:

- Entities
- Value Objects
- Domain logic

Domain must:

- Be framework-agnostic
- Contain no NestJS decorators
- Contain no database logic
- Contain no infrastructure imports

---

## 9. Validation

- Use class-validator
- Use class-transformer
- Enable global ValidationPipe with:

  whitelist: true
  forbidNonWhitelisted: true
  transform: true

Never manually validate inside controllers.

---

## 10. Error Handling

Use:

- Custom domain exceptions
- Global exception filters

Never:

- Return raw error objects
- Expose stack traces

Standard error response:

{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Readable message"
}
}

---

## 11. Response Standard

All successful responses must follow:

{
"success": true,
"data": ...
}

Never mix response shapes.

---

## 12. Transactions

If multiple repository calls must succeed together:

- Use explicit transaction handling
- Do not rely on ORM magic
- Keep transaction scope minimal

---

## 13. Logging & Observability

Services must:

- Log meaningful domain events
- Log errors explicitly
- Avoid logging sensitive information
- Prefer structured logging

---

## 14. Async Rules

- Always use async/await
- Never ignore Promises
- Never mix callbacks
- Always handle rejections

---

## 15. Security

- Validate all external input
- Use guards for authentication & authorization
- Never expose secrets
- Never trust query parameters
- Avoid leaking internal implementation details

---

## 16. Dependency Direction Rules

Allowed:

Controller → Service  
Service → Repository  
Service → Domain  
Repository → Domain

Forbidden:

Repository → Service  
Domain → Repository  
Domain → NestJS  
Domain → ORM

---

## 17. Testing Principles

All services must:

- Be unit-testable
- Have no hidden global state
- Use dependency injection
- Mock repositories in tests

Avoid:

- Static mutable state
- Side-effect heavy utilities

---

## 18. Anti-Patterns to Avoid

- God services
- Shared mutable state
- Circular dependencies
- Returning ORM entities directly
- Implicit any
- Magic strings
- Business logic in controllers
- Validation inside services

---

## 19. Migrations

Database changes must:

- Be versioned
- Be reproducible
- Never rely on runtime schema sync in production

---

## 20. AI Agent Behavioral Rules

When generating or modifying code:

1. Never guess missing types.
2. If DTO is missing, create one.
3. If response shape is unclear, define explicit Response DTO.
4. Prefer explicit mapping over object spreading.
5. Keep changes localized to the feature module.
6. Do not introduce new architectural patterns without instruction.
7. Do not create unnecessary abstractions.
8. Maintain strict type safety.
9. After completing feature implementation, run `eslint` checks first, then run `build` checks.

Agents must prioritize:

- Readability
- Determinism
- Explicit contracts
- Type safety
- Long-term maintainability

---

## Final Principle

Make illegal states unrepresentable.

Prefer:

- Enums
- Union types
- Value Objects
- Narrow types

Over:

- Boolean flags
- Magic strings
- Loosely typed objects

This document is binding for all AI coding agents contributing to this repository.
