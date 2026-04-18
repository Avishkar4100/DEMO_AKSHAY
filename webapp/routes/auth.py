"""
Authentication Routes - HOS-3 Backend Authentication
Provides API endpoints for login, registration, and credential validation
"""

from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.exceptions import BadRequest
from ..auth import AuthenticationService, AuthenticationError, PasswordValidator, EmailValidator

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint - Authenticate user with credentials.
    
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
            "session_timeout": 86400
        }
    
    Response (Error 401):
        {
            "success": false,
            "error": "Invalid username or password"
        }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body must be JSON'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        remember_me = data.get('remember_me', False)
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': 'Username and password are required'
            }), 400
        
        # Perform authentication
        result = AuthenticationService.login(username, password, remember_me)
        
        # Login user with Flask-Login
        if result['success']:
            user = AuthenticationService.get_user_by_username(username)
            login_user(user, remember=remember_me)
        
        return jsonify(result), 200
    
    except AuthenticationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Authentication service error'
        }), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registration endpoint - Create new user account.
    
    Request JSON:
        {
            "username": "newuser",
            "email": "user@hms.com",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "receptionist"
        }
    
    Response (Success 201):
        {
            "success": true,
            "user_id": 2,
            "username": "newuser",
            "email": "user@hms.com",
            "message": "User registered successfully"
        }
    
    Response (Error 400):
        {
            "success": false,
            "error": "Email already registered"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body must be JSON'
            }), 400
        
        # Extract and validate inputs
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        first_name = data.get('first_name', '').strip() or None
        last_name = data.get('last_name', '').strip() or None
        role = data.get('role', 'receptionist').strip()
        
        # Validate username
        if not username or len(username) < 3:
            return jsonify({
                'success': False,
                'error': 'Username must be at least 3 characters'
            }), 400
        
        # Register user
        result = AuthenticationService.register_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        
        return jsonify(result), 201
    
    except AuthenticationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/validate-credentials', methods=['POST'])
def validate_credentials():
    """
    Validate credentials without creating session.
    Used for testing authentication without login.
    
    Request JSON:
        {
            "username": "user@hms.com",
            "password": "SecurePass123!"
        }
    
    Response:
        {
            "valid": true
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'valid': False}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'valid': False}), 400
        
        is_valid = AuthenticationService.validate_credentials(username, password)
        return jsonify({'valid': is_valid}), 200
    
    except Exception as e:
        return jsonify({'valid': False}), 500


@auth_bp.route('/logout', methods=['POST', 'GET'])
@login_required
def logout():
    """
    Logout endpoint - Terminate user session (HOS-13: Logout Route).
    
    Invalidates the user's session and clears authentication data.
    
    Response (Success 200):
        {
            "success": true,
            "message": "Successfully logged out"
        }
    
    Response (Error 401):
        {
            "success": false,
            "error": "Not authenticated"
        }
    """
    try:
        # Get username before logout for logging
        username = current_user.username if current_user else "unknown"
        
        # Logout user from Flask-Login
        logout_user()
        
        # Clear session data
        session.clear()
        
        return jsonify({
            'success': True,
            'message': 'Successfully logged out'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Logout failed'
        }), 500

@auth_bp.route('/validate-password', methods=['POST'])
def validate_password():
    """
    Validate password strength without creating user.
    
    Request JSON:
        {
            "password": "SecurePass123!"
        }
    
    Response (Valid):
        {
            "valid": true,
            "message": ""
        }
    
    Response (Invalid):
        {
            "valid": false,
            "message": "Password must be at least 8 characters long"
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'valid': False,
                'message': 'Request body required'
            }), 400
        
        password = data.get('password', '')
        is_valid, message = PasswordValidator.validate(password)
        
        return jsonify({
            'valid': is_valid,
            'message': message
        }), 200
    
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': str(e)
        }), 500


@auth_bp.route('/validate-email', methods=['POST'])
def validate_email():
    """
    Validate email format.
    
    Request JSON:
        {
            "email": "user@hms.com"
        }
    
    Response:
        {
            "valid": true,
            "message": ""
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'valid': False,
                'message': 'Request body required'
            }), 400
        
        email = data.get('email', '')
        is_valid, message = EmailValidator.validate(email)
        
        return jsonify({
            'valid': is_valid,
            'message': message
        }), 200
    
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': str(e)
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """
    Change password for authenticated user.
    
    Request JSON:
        {
            "old_password": "CurrentPass123!",
            "new_password": "NewPass456!"
        }
    
    Response (Success):
        {
            "success": true,
            "message": "Password changed successfully"
        }
    
    Response (Error):
        {
            "success": false,
            "error": "Current password is incorrect"
        }
    """
    try:
        if not current_user.is_authenticated:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required'
            }), 400
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({
                'success': False,
                'error': 'Old and new passwords are required'
            }), 400
        
        result = AuthenticationService.change_password(
            current_user.id,
            old_password,
            new_password
        )
        
        return jsonify(result), 200
    
    except AuthenticationError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
