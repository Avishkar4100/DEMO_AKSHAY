"""
HMS (Hospital Management System) - Flask Application
Main application factory and initialization

Tasks Implemented:
- HOS-7: Role Definition (COMPLETE)
  - Defined all roles: Admin, Doctor, Receptionist, Nurse
  - Assigned specific permissions to each role
  - Created role-based decorators
  - Set up User model with role assignment
"""

import os
from flask import Flask
from flask_login import LoginManager
from .config import config
from .models import db, User


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
    
    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
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
    app.register_blueprint(auth_bp)
    
    # Health check route
    @app.route('/health')
    def health_check():
        """Simple health check endpoint"""
        return {'status': 'OK', 'message': 'HMS API is running'}, 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
