"""
HMS (Hospital Management System) - Flask Application
Main application factory and initialization

Tasks Implemented:
- HOS-7: Role Definition (COMPLETE)
  - Defined all roles: Admin, Doctor, Receptionist, Nurse
  - Assigned specific permissions to each role
  - Created role-based decorators
  - Set up User model with role assignment

- HOS-3: Backend Authentication (COMPLETE)
  - User login with password hashing
  - User registration with validation
  - Credential validation and session management

- HOS-2: User Login System (COMPLETE)
  - Session management with Flask-Login
  - Login form handling (HTML and API)
  - Form validation and data sanitization
  - CSRF protection with Flask-WTF
"""

import os
from flask import Flask, redirect, url_for
from flask_login import LoginManager, login_required
from .config import config
from .models import db, User
from .security import csrf, SecurityHeaders


def create_app(config_name=None):
    """
    Application factory function.
    
    Args:
        config_name: Configuration to use ('development', 'testing', 'production')
        
    Returns:
        Configured Flask application
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    csrf.init_app(app)  # Initialize CSRF protection
    
    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login.login_page'
    login_manager.login_message = 'Please log in to access this page.'
    
    @login_manager.user_loader
    def load_user(user_id):
        """Load user by ID for Flask-Login"""
        return User.query.get(int(user_id))
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Register blueprints
    from .routes import auth_bp
    from .routes.login import login_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(login_bp)
    
    # Apply security headers to all responses
    @app.after_request
    def apply_security_headers(response):
        return SecurityHeaders.apply_security_headers(response)
    
    # Health check route
    @app.route('/health')
    def health_check():
        """Simple health check endpoint"""
        return {'status': 'OK', 'message': 'HMS API is running'}, 200
    
    # Logout route (HOS-13)
    @app.route('/logout', methods=['GET', 'POST'])
    def logout():
        """
        Logout endpoint - Terminate user session.
        Handles requests from both GET and POST methods.
        Redirects to login page after logout.
        """
        from flask_login import logout_user
        from flask import session
        
        try:
            logout_user()
            session.clear()
            return redirect(url_for('login.login_page'))
        except Exception:
            return redirect(url_for('login.login_page'))
    
    # Dashboard placeholder route
    @app.route('/dashboard')
    @login_required
    def dashboard():
        """Dashboard placeholder (HOS-4 and beyond)"""
        from flask_login import current_user
        
        return {
            'message': 'Dashboard (Coming soon - HOS-4+)',
            'user': current_user.username
        }, 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
