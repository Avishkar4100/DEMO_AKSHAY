"""
User Login Routes - HOS-2 User Login System
Provides endpoints for user login form handling and session management

Security Features:
- CSRF protection on all form submissions (Flask-WTF)
- Session-based authentication (Flask-Login)
- Secure password validation
- Input sanitization
"""

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, session, make_response
from flask_login import current_user, login_required, logout_user
from ..security import csrf
from ..login import LoginSession, LoginForm, login_required as custom_login_required
from ..auth import AuthenticationError

login_bp = Blueprint('login', __name__, url_prefix='/login')


@login_bp.route('/', methods=['GET'])
def login_page():
    """
    Display login page.
    
    Returns:
        HTML login page template
    """
    # If already logged in, redirect to dashboard
    if current_user and current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    return render_template('login.html', error=None)


@login_bp.route('/api', methods=['POST'])
@csrf.exempt  # API endpoints use token/header-based auth instead of CSRF
def login_api():
    """
    Handle user login API request.
    
    Request JSON:
        {
            "username": "user@hms.com",
            "password": "SecurePass123!",
            "remember_me": false
        }
    
    Response (Success 200):
        {
            "success": true,
            "user_id": 1,
            "username": "user@hms.com",
            "email": "user@hms.com",
            "role": "doctor",
            "display_name": "John Doe",
            "session_created": "2026-04-16T12:00:00",
            "session_timeout": 86400,
            "is_authenticated": true
        }
    
    Response (Error 400):
        {
            "success": false,
            "error": "Invalid credentials"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body must be JSON'
            }), 400
        
        # Validate form data
        is_valid, error = LoginForm.validate_login_form(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        # Sanitize form data
        clean_data = LoginForm.sanitize_login_form(data)
        
        # Create session
        result = LoginSession.create_session(
            username=clean_data['username'],
            password=clean_data['password'],
            remember_me=clean_data['remember_me']
        )
        
        return jsonify(result), 200
    
    except AuthenticationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Login service error'
        }), 500


@login_bp.route('/form', methods=['POST'])
def login_form():
    """
    Handle HTML form-based login request.
    
    Form Data:
        - username: Username or email
        - password: Password
        - remember_me: Checkbox for remember me
    
    Response:
        - Success: Redirect to dashboard or home
        - Error: Redirect to login page with error message
    """
    try:
        # Get form data
        form_data = {
            'username': request.form.get('username', ''),
            'password': request.form.get('password', ''),
            'remember_me': request.form.get('remember_me', False),
        }
        
        # Validate form
        is_valid, error = LoginForm.validate_login_form(form_data)
        if not is_valid:
            return render_template(
                'login.html',
                error=error
            ), 400
        
        # Sanitize data
        clean_data = LoginForm.sanitize_login_form(form_data)
        
        # Create session
        LoginSession.create_session(
            username=clean_data['username'],
            password=clean_data['password'],
            remember_me=clean_data['remember_me']
        )
        
        # Redirect to dashboard or home (using request args or default to /dashboard)
        next_page = request.args.get('next', '/dashboard')
        return redirect(next_page)
    
    except AuthenticationError as e:
        return render_template(
            'login.html',
            error=str(e)
        ), 401
    
    except Exception as e:
        return render_template(
            'login.html',
            error='Login failed. Please try again.'
        ), 500


@login_bp.route('/session', methods=['GET'])
def get_session():
    """
    Get current user session information.
    
    Returns:
        {
            "is_authenticated": true,
            "user_id": 1,
            "username": "user@hms.com",
            "email": "user@hms.com",
            "role": "doctor",
            "display_name": "John Doe",
            "last_login": "2026-04-16T12:00:00",
            "created_at": "2026-03-20T08:00:00"
        }
    """
    try:
        session_info = LoginSession.get_session_info(current_user)
        return jsonify(session_info), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@login_bp.route('/validate-session', methods=['POST'])
@csrf.exempt  # API endpoint
def validate_session():
    """
    Validate if current session is still valid.
    Useful for periodic session checks from frontend.
    
    Returns:
        {
            "valid": true,
            "user_id": 1,
            "username": "user@hms.com"
        }
    """
    try:
        is_valid = LoginSession.is_session_valid(current_user)
        
        if is_valid:
            return jsonify({
                'valid': True,
                'user_id': current_user.id,
                'username': current_user.username,
            }), 200
        else:
            return jsonify({
                'valid': False,
            }), 401
    
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 500


@login_bp.route('/check', methods=['GET'])
def check_login():
    """
    Check if user is logged in.
    Quick endpoint to verify authentication status.
    
    Returns:
        {
            "logged_in": true,
            "username": "user@hms.com"
        }
    """
    if current_user and current_user.is_authenticated:
        return jsonify({
            'logged_in': True,
            'username': current_user.username,
            'user_id': current_user.id,
        }), 200
    else:
        return jsonify({
            'logged_in': False,
        }), 200


@login_bp.route('/logout', methods=['POST', 'GET'])
@csrf.exempt  # Allow logout without CSRF token
def logout():
    """
    Logout current user and destroy session.
    
    Returns:
        {
            "success": true,
            "message": "Session destroyed"
        }
    """
    try:
        result = LoginSession.destroy_session()
        
        # Redirect to login page if redirect_to parameter provided
        if request.args.get('redirect_to'):
            return redirect(request.args.get('redirect_to'))
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
