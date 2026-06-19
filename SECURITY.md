# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | ✅        |
| develop | ✅        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing **security@your-org.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested remediation

You will receive an acknowledgment within 48 hours and a full response within 7 days.

## Security Architecture

See [docs/architecture.md — Security Architecture](./docs/architecture.md#8-security-architecture) for the platform's security design.

Key areas:
- JWT authentication with short-lived access tokens
- Redis-backed distributed locks on all wallet operations
- HMAC verification on all payment provider webhooks
- RBAC on all admin endpoints
- Input validation via class-validator on all DTOs
- Parameterized queries only (TypeORM) — no raw SQL interpolation
