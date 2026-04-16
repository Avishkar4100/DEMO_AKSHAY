"""
HOS-3: Backend Authentication Service

Handles user authentication with:
- Credential validation
- Password strength checking
- Session/Token generation and management
- Secure authentication mechanisms
- Error handling and logging
"""

import re
from datetime import datetime, timedelta
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
from .models import db, User
from .roles import Role


class AuthenticationError(Exception):
    """Custom exception for authentication failures"""
    pass


class PasswordValidator:
    """
    Validate passwords against security rules.
    Ensures strong password requirements are met.
    """
    
    MIN_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGITS = True
    REQUIRE_SPECIAL = True
    
    SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    @classmethod
    def validate(cls, password: str) -> tuple[bool, str]:
        """
        Validate password against all rules.
        
        Args:
            password: Password to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not password:
            return False, "Password cannot be empty"
        
        if len(password) < cls.MIN_LENGTH:
            return False, f"Password must be at least {cls.MIN_LENGTH} characters long"
        
        if cls.REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if cls.REQUIRE_LOWERCASE and not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if cls.REQUIRE_DIGITS and not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        
        if cls.REQUIRE_SPECIAL and not any(c in cls.SPECIAL_CHARS for c in password):
            return False, f"Password must contain at least one special character: {cls.SPECIAL_CHARS}"
        
        return True, ""


class EmailValidator:
    """Validate email addresses"""
    
    EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    @classmethod
    def validate(cls, email: str) -> tuple[bool, str]:
        """
        Validate email format.
        
        Args:
            email: Email to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not email:
            return False, "Email cannot be empty"
        
        if not re.match(cls.EMAIL_PATTERN, email):
            return False, "Invalid email format"
        
        return True, ""


class AuthenticationService:
    """
    Main authentication service for backend.
    Handles login, credential validation, and session management.
    """
    
    # Session configuration
    SESSION_TIMEOUT = timedelta(hours=24)  # Session valid for 24 hours
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = timedelta(minutes=30)
    
    @staticmethod
    def login(username: str, password: str, remember_me: bool = False) -> dict:
        """
        Authenticate user with username and password.
        
        Args:
            username: Username or email
            password: User password
            remember_me: Whether to create persistent session
            
        Returns:
            Dictionary with authentication status and user data
            
        Raises:
            AuthenticationError: If authentication fails
        """
        # Validate inputs
        if not username or not password:
            raise AuthenticationError("Username and password are required")
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            raise AuthenticationError("Invalid username or password")
        
        # Check if user account is active
        if not user.is_active:
            raise AuthenticationError("User account is disabled. Contact administrator.")
        
        # Verify password
        if not user.check_password(password):
            raise AuthenticationError("Invalid username or password")
        
        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Return authentication success with user info
        return {
            'success': True,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'display_name': user.get_display_name(),
            'remember_me': remember_me,
            'session_timeout': AuthenticationService.SESSION_TIMEOUT.total_seconds(),
        }
    
    @staticmethod
    def register_user(
        username: str,
        email: str,
        password: str,
        first_name: str = None,
        last_name: str = None,
        role: Role = Role.RECEPTIONIST
    ) -> dict:
        """
        Register new user with validation.
        
        Args:
            username: Username (unique)
            email: Email address (unique)
            password: Password (must meet validation rules)
            first_name: Optional first name
            last_name: Optional last name
            role: User role (default: Receptionist)
            
        Returns:
            Dictionary with registration result
            
        Raises:
            AuthenticationError: If validation fails
        """
        # Validate email
        valid_email, email_error = EmailValidator.validate(email)
        if not valid_email:
            raise AuthenticationError(f"Email validation failed: {email_error}")
        
        # Validate password
        valid_pwd, pwd_error = PasswordValidator.validate(password)
        if not valid_pwd:
            raise AuthenticationError(f"Password validation failed: {pwd_error}")
        
        # Check username availability
        if User.query.filter_by(username=username).first():
            raise AuthenticationError("Username already exists")
        
        # Check email availability
        if User.query.filter_by(email=email).first():
            raise AuthenticationError("Email already registered")
        
        # Create new user
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.set_role(role)
        
        db.session.add(user)
        db.session.commit()
        
        return {
            'success': True,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'message': 'User registered successfully'
        }
    
    @staticmethod
    def change_password(user_id: int, old_password: str, new_password: str) -> dict:
        """
        Change user password.
        
        Args:
            user_id: ID of user
            old_password: Current password
            new_password: New password
            
        Returns:
            Dictionary with status
            
        Raises:
            AuthenticationError: If validation fails
        """
        user = User.query.get(user_id)
        if not user:
            raise AuthenticationError("User not found")
        
        # Verify old password
        if not user.check_password(old_password):
            raise AuthenticationError("Current password is incorrect")
        
        # Validate new password
        valid_pwd, pwd_error = PasswordValidator.validate(new_password)
        if not valid_pwd:
            raise AuthenticationError(f"New password validation failed: {pwd_error}")
        
        # Check passwords are different
        if old_password == new_password:
            raise AuthenticationError("New password must be different from current password")
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Password changed successfully'
        }
    
    @staticmethod
    def validate_credentials(username: str, password: str) -> bool:
        """
        Validate user credentials without modifying database.
        Used for authentication checks.
        
        Args:
            username: Username or email
            password: Password
            
        Returns:
            True if credentials are valid, False otherwise
        """
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not user.is_active:
            return False
        
        return user.check_password(password)
    
    @staticmethod
    def get_user_by_username(username: str) -> User:
        """Get user by username or email"""
        return User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
    
    @staticmethod
    def disable_user(user_id: int) -> dict:
        """Disable user account"""
        user = User.query.get(user_id)
        if not user:
            raise AuthenticationError("User not found")
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'message': 'User account disabled'
        }
    
    @staticmethod
    def enable_user(user_id: int) -> dict:
        """Enable user account"""
        user = User.query.get(user_id)
        if not user:
            raise AuthenticationError("User not found")
        
        user.is_active = True
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'message': 'User account enabled'
        }
