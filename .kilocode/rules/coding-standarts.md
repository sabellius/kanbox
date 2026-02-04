# Coding Standards

This document defines the coding standards and conventions for the Kanbox project. Follow these guidelines to maintain code consistency and quality.

## Code Style

- **Mobile-first responsive design**: Design and develop for mobile devices first, then scale up to larger screens
- **Commit messages**: Write concise, descriptive commit messages after completing todos in a task following the conventional commits format

## Don'ts

- **Don't hardcode values**: Always use environment variables for configuration, secrets, and environment-specific values
- **Don't add unnecessary line comments**: Only add comments when the code logic is complex or not immediately obvious
- **Don't commit sensitive data**: Never commit API keys, passwords, or secrets to version control
- **Don't skip input validation**: Validate all user inputs on both client and server sides

## Best Practices

- Keep functions and components focused on a single responsibility
- Write self-documenting code with clear, descriptive names
- Follow the existing project structure and patterns
