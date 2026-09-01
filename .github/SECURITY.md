# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Nescom, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email**: Send a detailed report to the repository maintainers via GitHub
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Assessment**: Within 5 business days
- **Fix Timeline**: Critical vulnerabilities will be patched within 7 days
- **Credit**: You will be credited in the security advisory (unless you prefer anonymity)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Measures

This project implements the following security measures:

### Authentication & Authorization

- JWT tokens with secure secrets (minimum 32 characters)
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Token expiration and rotation

### API Security

- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS configuration
- SQL injection prevention via Prisma ORM

### Headers & Transport

- HTTPS enforced via HSTS
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Infrastructure

- Non-root Docker containers
- Database credentials via environment variables
- Secrets never committed to version control
- Automated dependency auditing in CI

## Security Update Process

1. Vulnerability is reported and confirmed
2. A fix branch is created from `main`
3. Fix is developed and tested
4. Security advisory is prepared
5. Fix is merged and tagged
6. Affected deployments are updated
7. Public disclosure after deployment

## Best Practices for Contributors

- Never commit `.env` files, API keys, or secrets
- Use environment variables for all sensitive configuration
- Validate all user input on both client and server
- Use parameterized queries (Prisma handles this automatically)
- Keep dependencies updated
- Run `npm audit` regularly
