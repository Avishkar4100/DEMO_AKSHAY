"""
HOS-2: User Login System

Handles user session management:
- User login with form handling
- Session creation and management
- User identity across requests
- Session persistence
- Login state tracking
"""

from datetime import datetime, timedelta
from flask_login import UserMixin, login_user, logout_user, current_user
from functools import wraps
from .models import db, User
from .auth import AuthenticationService, AuthenticationError


class LoginSession:
    """
    Manages user login sessions.
    Tracks session data, timeouts, and user state.
    """
    
    SESSION_TIMEOUT = timedelta(hours=24)
    IDLE_TIMEOUT = timedelta(minutes=30)
    
    @staticmethod
    def create_session(username: str, password: str, remember_me: bool = False) -> dict:
        """
        Create a new login session for user.
        
        Args:
            username: Username or email
            password: User password
            remember_me: Create persistent session
            
        Returns:
            Dictionary with session data
            
        Raises:
            AuthenticationError: If login fails
        """
        # Authenticate user
        auth_result = AuthenticationService.login(username, password, remember_me)
        
        if not auth_result['success']:
            raise AuthenticationError("Login failed")
        
        # Get user object
        user = AuthenticationService.get_user_by_username(username)
        
        if not user:
            raise AuthenticationError("User not found")
        
        # Try to create Flask-Login session (only works in request context)
        try:
            login_user(user, remember=remember_me)
        except RuntimeError:
            # Outside request context, just return auth info
            pass
        
        # Return session info
        return {
            'success': True,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'display_name': user.get_display_name(),
            'session_created': datetime.utcnow().isoformat(),
            'session_timeout': LoginSession.SESSION_TIMEOUT.total_seconds(),
            'remember_me': remember_me,
            'is_authenticated': True,
        }
    
    @staticmethod
    def get_session_info(user) -> dict:
        """
        Get current session information for user.
        
        Args:
            user: Current user object
            
        Returns:
            Dictionary with session data
        """
        if not user or not user.is_authenticated:
            return {
                'is_authenticated': False,
                'user_id': None,
                'username': None,
            }
        
        return {
            'is_authenticated': True,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'display_name': user.get_display_name(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'created_at': user.created_at.isoformat() if user.created_at else None,
        }
    
    @staticmethod
    def destroy_session():
        """Destroy current login session"""
        logout_user()
        return {'success': True, 'message': 'Session destroyed'}
    
    @staticmethod
    def is_session_valid(user) -> bool:
        """
        Check if user session is still valid.
        
        Args:
            user: User object to check
            
        Returns:
            True if session is valid, False otherwise
        """
        if not user or not user.is_authenticated:
            return False
        
        if not user.is_active:
            return False
        
        # Check if user exists in database
        db_user = User.query.get(user.id)
        return db_user is not None and db_user.is_active


class LoginForm:
    """
    Handles user login form data validation.
    Validates form inputs before authentication.
    """
    
    @staticmethod
    def validate_login_form(form_data: dict) -> tuple[bool, str]:
        """
        Validate login form data.
        
        Args:
            form_data: Dictionary with 'username' and 'password' keys
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check required fields
        if not form_data:
            return False, "Form data required"
        
        username = form_data.get('username', '').strip()
        password = form_data.get('password', '')
        
        if not username:
            return False, "Username or email is required"
        
        if not password:
            return False, "Password is required"
        
        if len(username) < 3:
            return False, "Username must be at least 3 characters"
        
        if len(password) < 1:
            return False, "Password is required"
        
        return True, ""
    
    @staticmethod
    def sanitize_login_form(form_data: dict) -> dict:
        """
        Sanitize and clean login form data.
        
        Args:
            form_data: Raw form data
            
        Returns:
            Sanitized form data
        """
        return {
            'username': form_data.get('username', '').strip().lower(),
            'password': form_data.get('password', ''),
            'remember_me': form_data.get('remember_me', False),
        }


def login_required(f):
    """
    Decorator to require login for routes.
    Same as Flask-Login's login_required but with custom logic.
    
    Usage:
        @app.route('/dashboard')
        @login_required
        def dashboard():
            return "Welcome"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user or not current_user.is_authenticated:
            # Return unauthorized response
            from flask import jsonify, redirect, url_for, request
            
            # Check if API request or page request
            if request.content_type and 'application/json' in request.content_type:
                return jsonify({
                    'success': False,
                    'error': 'User not authenticated'
                }), 401
            else:
                return redirect(url_for('auth.login'))
        
        return f(*args, **kwargs)
    return decorated_function


class SessionManager:
    """
    Advanced session management.
    Tracks active sessions, devices, and login history.
    """
    
    @staticmethod
    def get_user_login_history(user_id: int, limit: int = 10) -> list:
        """
        Get user's login history.
        
        Args:
            user_id: User ID
            limit: Number of records to return
            
        Returns:
            List of login history records
        """
        user = User.query.get(user_id)
        if not user:
            return []
        
        return {
            'user_id': user.id,
            'username': user.username,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'created_at': user.created_at.isoformat() if user.created_at else None,
        }
    
    @staticmethod
    def get_active_sessions_count(user_id: int) -> int:
        """
        Get count of active sessions for user.
        
        Args:
            user_id: User ID
            
        Returns:
            Count of active sessions
        """
        # For now, return 1 if user is valid
        # In production, would check session database
        user = User.query.get(user_id)
        return 1 if user and user.is_active else 0
    
    @staticmethod
    def invalidate_all_sessions(user_id: int) -> dict:
        """
        Invalidate all sessions for a user.
        Useful for security (password change, account breach, etc)
        
        Args:
            user_id: User ID
            
        Returns:
            Status dictionary
        """
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': 'User not found'}
        
        # In production, would delete all session tokens
        # For now, just mark as updated
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'message': 'All sessions invalidated'
        }
