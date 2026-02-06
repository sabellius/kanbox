# Commit Message Conventions

When assisting with git commits in the Kanbox project, follow these guidelines:

## Format

```
<type>(<scope>): <short summary>

<optional body>
```

## Type

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `perf`: Performance improvement
- `docs`: Documentation changes
- `style`: Code formatting (not CSS)
- `test`: Adding or fixing tests
- `chore`: Build process or tooling changes

## Scope

Use the affected domain/module:

- `config`: Configuration files
- `auth`: Authentication logic
- `services`: Business logic services
- `db`: Database operations
- `api`: API routes/controllers
- `models`: Data models
- `middleware`: Express middleware

## Summary Rules

- **Brief**: 50 chars max
- **Imperative mood**: "add" not "added" or "adds"
- **No period**: at the end
- **Descriptive**: What changed, not why
- **Lowercase**: after the type and scope

## Body Rules

- **Optional**: Only when summary isn't enough
- **Brief**: 1-2 lines max
- **No redundancy**: Don't repeat the summary
- **Focus**: What changed or impact, not implementation details

## Examples

**Good:**

```
feat(config): add central config aggregator with env validation

Validates required env vars on startup and enforces security constraints
```

**Good:**

```
refactor(auth): migrate authentication modules to use new config

Updates auth controller, middleware, and User model to use config structure
```

**Good:**

```
fix(config): add explicit /index.js to directory imports

ES modules require explicit file extensions for directory imports
```

**Bad:**

```
Updated configuration files

Changed a bunch of stuff in the config directory to make it better. Added validation and updated imports.
```

## Breaking Down Large Changes

When refactoring:

1. **Create** new files/structure first
2. **Migrate** modules by functional area (auth, services, etc.)
3. **Remove** old files last
4. **Fix** issues discovered after migration

Each step should be a separate commit.

## Additional Notes

- **ALWAYS** create multiple small commits, never one big commit
- Keep commits atomic and focused on a single concern
- Each commit should compile/run independently
- Group related changes logically (but keep commits small)
- Don't mix refactoring with feature additions
- Don't mix fixes for different bugs in one commit
- When asked to implement something, break it into multiple commits by functionality
