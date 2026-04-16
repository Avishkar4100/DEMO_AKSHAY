# HOS-9: Demo Credentials

Demo users have been seeded into the HMS database for testing role-based access control. This document provides credentials and usage information.

## Demo Users

All demo users are created with the same password structure for easy testing:
- **Format**: `[Role]@12345` (e.g., Admin@12345)
- **Password Policy**: Meets all security requirements (8+ chars, upper, lower, digit, special)
- **Database**: SQLite (hms.db) - passwords are securely hashed with werkzeug

### Admin User

| Field | Value |
|-------|-------|
| **Email** | `admin@hms.local` |
| **Username** | `admin` |
| **Password** | `Admin@12345` |
| **Full Name** | System Administrator |
| **Role** | ADMIN |
| **Permissions** | All 25 permissions |
| **Description** | Full access to all features and system management |

**Access**: Dashboard, User Management, Role Configuration, System Settings

---

### Doctor User

| Field | Value |
|-------|-------|
| **Email** | `doctor@hms.local` |
| **Username** | `doctor` |
| **Password** | `Doctor@12345` |
| **Full Name** | John Smith |
| **Role** | DOCTOR |
| **Permissions** | 16 medical-focused permissions |
| **Description** | Access to patient records, medical records, and prescriptions |

**Access**: Patient Records, Medical Prescriptions, Patient History, Diagnoses, Medical Reports

---

### Nurse User

| Field | Value |
|-------|-------|
| **Email** | `nurse@hms.local` |
| **Username** | `nurse` |
| **Password** | `Nurse@12345` |
| **Full Name** | Sarah Johnson |
| **Role** | NURSE |
| **Permissions** | 8 support-focused permissions |
| **Description** | Assists with patient care and medical documentation |

**Access**: View Patients, View Medical Records, Document Observations, Support Functions

---

### Receptionist User

| Field | Value |
|-------|-------|
| **Email** | `receptionist@hms.local` |
| **Username** | `receptionist` |
| **Password** | `Recep@12345` |
| **Full Name** | Emma Williams |
| **Role** | RECEPTIONIST |
| **Permissions** | 9 appointment-focused permissions |
| **Description** | Manages appointments and patient registration |

**Access**: View Appointments, Create Appointments, Register Patients, View Patient Info

---

## Seeding Instructions

### Create Demo Users

```bash
python seed_demo_users.py
```

Creates all demo users if they don't exist, or updates them if they do.

### Reset Demo Users

```bash
python seed_demo_users.py --reset
```

Deletes all demo users and creates fresh instances.

### Clear Demo Users

```bash
python seed_demo_users.py --clear
```

Removes all demo users from database.

### Verify Credentials

```bash
python seed_demo_users.py --verify
```

Tests login functionality for all demo users to ensure:
- Users exist in database
- Passwords are correctly hashed
- Authentication service works
- Role assignments are correct

### View Demo User Info

```bash
python seed_demo_users.py --info
```

Displays all demo user information and current status.

---

## Login Testing

### Using the Web Interface

1. **Start the Flask server**:
   ```bash
   python -m flask --app webapp.app run
   ```

2. **Navigate to login page**:
   ```
   http://127.0.0.1:5000/login/
   ```

3. **Enter credentials**:
   - Username or Email: `admin@hms.local` (or other demo user)
   - Password: `Admin@12345` (or other demo user password)

4. **Submit form**:
   - CSRF token is automatically included in HTML form
   - Redirects to dashboard or home on success

### Using API Endpoint

```bash
curl -X POST http://127.0.0.1:5000/login/api \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@hms.local",
    "password": "Admin@12345",
    "remember_me": false
  }'
```

**Response (Success)**:
```json
{
  "success": true,
  "user_id": 1,
  "username": "admin",
  "email": "admin@hms.local",
  "role": "admin",
  "display_name": "System Administrator",
  "session_created": "2026-04-16T12:00:00",
  "session_timeout": 86400,
  "is_authenticated": true
}
```

---

## Security Notes

### Development Environment
- Demo passwords are simple and documented for testing convenience
- Intended for development, staging, and demo environments only
- Do NOT use in production

### Production Deployment
- Delete demo users before deploying to production:
  ```bash
  python seed_demo_users.py --clear
  ```
  
- Use environment variables for real user credentials:
  ```python
  import os
  ADMIN_PASSWORD = os.environ.get('HMS_ADMIN_PASSWORD')
  ```

- Use a secret management tool (AWS Secrets Manager, HashiCorp Vault, etc.)

- Implement multi-factor authentication (MFA)

- Audit login attempts and failed authentication

### Password Hashing
- All passwords are hashed using werkzeug (Bcrypt-compatible)
- Hashes are salted and non-reversible
- Password validation happens server-side only
- Never transmitted in plain text over HTTPS

### Session Security
- Session cookies are HTTPOnly (cannot be accessed via JavaScript)
- Session timeout: 24 hours (86400 seconds)
- Remember-me extends timeout to 7 days
- Sessions destroyed on logout

---

## Testing Role-Based Access

### RBAC Validation Test Suite

Run the comprehensive test to verify role-based access works correctly:

```bash
python test_demo_users.py
```

This validates:
- ✓ All demo users exist and are accessible
- ✓ Credentials work correctly (login succeeds)
- ✓ Role assignments are correct
- ✓ Each user has appropriate permissions
- ✓ Access control decorators function properly
- ✓ API endpoints return correct role information

### Manual Testing

1. **Login as different roles** and verify accessible pages:
   - Admin: All features
   - Doctor: Medical records, prescriptions
   - Nurse: Patient care, documentation
   - Receptionist: Appointments, registration

2. **Verify permission checks** with protected endpoints:
   ```bash
   curl -X GET http://127.0.0.1:5000/admin/users \
     -H "Cookie: session=doctor_session_id"
   # Should return 403 Forbidden (not authorized)
   ```

3. **Test role-specific actions**:
   - Admin creates/deletes users
   - Doctor views patient medical records
   - Nurse documents observations
   - Receptionist manages appointments

---

## Troubleshooting

### "User not found" on login
```bash
# Verify database state
python seed_demo_users.py --info

# If users missing, recreate them
python seed_demo_users.py --reset
```

### "Invalid password" error
- Verify password is typed correctly (case-sensitive)
- Check that demo users were created: `python seed_demo_users.py --verify`

### Session not created
- Ensure SECRET_KEY is configured in app
- Check that database connection is working
- Verify Flask-Login is initialized

### Permission denied on protected routes
- Verify user role matches required permission
- Check decorators are applied: `@permission_required('VIEW_PATIENTS')`
- Test API endpoint returns correct user role

### Database issues
- Delete database and recreate: `rm hms.db`
- Reinitialize: `python -c "from webapp.app import create_app; app = create_app(); app.app_context().push(); from webapp.models import db; db.create_all()"`
- Reseed users: `python seed_demo_users.py`

---

## Environment Variables

Optional configuration for seeding:

```bash
# Use testing database instead of development
HMS_ENV=testing python seed_demo_users.py

# Production (requires manual credential management)
HMS_ENV=production python seed_demo_users.py
```

---

## Related Documents

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [RBAC.md](RBAC.md) - Role-based access control details
- [test_demo_users.py](test_demo_users.py) - Test suite for demo users

---

**Last Updated**: April 16, 2026  
**HOS Task**: HOS-9 Demo Credentials  
**Status**: Complete
