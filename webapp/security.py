"""
Security Module - CSRF Protection and Security Headers
Implements CSRF protection and security headers for HOS-2
"""

from flask import request, abort
from flask_wtf.csrf import CSRFProtect
from functools import wraps


# Initialize CSRF protection (will be called in app factory)
csrf = CSRFProtect()


def require_csrf_token(f):
    """
    Decorator to require CSRF token validation for endpoints.
    Useful for non-form submissions (AJAX, API calls).
    
    Usage:
        @app.route('/api/action', methods=['POST'])
        @require_csrf_token
        def api_action():
            return "Success"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get CSRF token from request
        token = None
        
        # Check headers first (common for AJAX)
        if request.headers:
            token = request.headers.get('X-CSRFToken') or \
                   request.headers.get('X-CSRF-Token')
        
        # Check form data
        if not token and request.form:
            token = request.form.get('csrf_token')
        
        # Check JSON body
        if not token and request.is_json:
            token = request.get_json().get('csrf_token')
        
        if not token:
            abort(400)  # Bad request - missing CSRF token
        
        return f(*args, **kwargs)
    
    return decorated_function


class SecurityHeaders:
    """
    Add security headers to all responses.
    Protects against common vulnerabilities.
    """
    
    @staticmethod
    def apply_security_headers(response):
        """
        Apply security headers to response.
        
        Headers:
        - X-Content-Type-Options: Prevent MIME type sniffing
        - X-Frame-Options: Prevent clickjacking
        - X-XSS-Protection: Enable XSS filter
        - Strict-Transport-Security: Force HTTPS
        - Content-Security-Policy: Prevent XSS and injection attacks
        """
        # Prevent MIME type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking (allow embedding in same-origin only)
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        # Enable XSS filter in older browsers
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Strict transport security (HTTPS only) - set for production
        # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        response.headers['Content-Security-Policy'] = \
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        
        return response


class CSRFHelper:
    """
    Helper utilities for CSRF protection.
    """
    
    @staticmethod
    def generate_csrf_token():
        """
        Generate CSRF token for forms.
        Called in route before rendering template.
        """
        from flask_wtf.csrf import generate_csrf
        return generate_csrf()
    
    @staticmethod
    def get_csrf_token_from_request():
        """
        Retrieve CSRF token from request (multiple sources).
        """
        token = None
        
        # Check form data (POST)
        if request.form:
            token = request.form.get('csrf_token')
        
        # Check headers (AJAX)
        if not token and request.headers:
            token = request.headers.get('X-CSRFToken') or \
                   request.headers.get('X-CSRF-Token')
        
        # Check JSON body
        if not token and request.is_json:
            try:
                token = request.get_json().get('csrf_token')
            except:
                pass
        
        return token
