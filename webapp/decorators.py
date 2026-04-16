"""
Role-based Access Control Decorators and Middleware

This module provides decorators for protecting routes based on:
- Role requirements (only specific roles can access)
- Permission requirements (users must have specific permissions)
- Combined role and permission checks
"""

from functools import wraps
from flask import abort, redirect, url_for, session
from flask_login import current_user
from .roles import Role, Permission, RolePermissionMap


def role_required(*required_roles: Role):
    """
    Decorator to require specific role(s) to access a route.
    
    Usage:
        @app.route('/admin')
        @role_required(Role.ADMIN)
        def admin_panel():
            return "Admin Panel"
        
        # Allow multiple roles
        @app.route('/patient-info')
        @role_required(Role.DOCTOR, Role.NURSE)
        def view_patient_info():
            return "Patient Information"
    
    Args:
        *required_roles: One or more Role enum values required to access the route
        
    Returns:
        Decorated function that checks user role before access
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            
            if current_user.role not in required_roles:
                abort(403)  # Forbidden
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def permission_required(*required_permissions: Permission):
    """
    Decorator to require specific permission(s) to access a route.
    
    This checks if the user's role has the required permissions.
    
    Usage:
        @app.route('/create-patient')
        @permission_required(Permission.CREATE_PATIENT)
        def create_patient():
            return "Create Patient"
        
        # Multiple permissions (all must be present)
        @app.route('/manage-records')
        @permission_required(Permission.VIEW_MEDICAL_RECORDS, Permission.EDIT_MEDICAL_RECORD)
        def manage_records():
            return "Manage Medical Records"
    
    Args:
        *required_permissions: One or more Permission enum values required
        
    Returns:
        Decorated function that checks user permissions before access
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            
            user_permissions = RolePermissionMap.get_permissions(current_user.role)
            
            # Check if user has all required permissions
            for perm in required_permissions:
                if perm not in user_permissions:
                    abort(403)  # Forbidden
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def role_or_permission_required(required_roles=None, required_permissions=None):
    """
    Advanced decorator combining role and permission checks.
    
    Can require specific roles OR specific permissions (flexible configuration).
    
    Usage:
        # Require either Admin role OR create user permission
        @app.route('/create-user')
        @role_or_permission_required(
            required_roles=[Role.ADMIN],
            required_permissions=[Permission.CREATE_USER]
        )
        def create_user():
            return "Create User"
    
    Args:
        required_roles: List of Role enum values (user must have at least one)
        required_permissions: List of Permission enum values (user must have all)
        
    Returns:
        Decorated function with combined access control
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            
            # Check roles (if specified)
            if required_roles:
                if current_user.role not in required_roles:
                    # If roles don't match, check permissions
                    if required_permissions:
                        user_permissions = RolePermissionMap.get_permissions(current_user.role)
                        for perm in required_permissions:
                            if perm not in user_permissions:
                                abort(403)
                    else:
                        abort(403)
            
            # Check permissions (if specified and not already passed role check)
            elif required_permissions:
                user_permissions = RolePermissionMap.get_permissions(current_user.role)
                for perm in required_permissions:
                    if perm not in user_permissions:
                        abort(403)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def admin_only(f):
    """
    Convenience decorator for admin-only routes.
    Same as @role_required(Role.ADMIN)
    
    Usage:
        @app.route('/system-settings')
        @admin_only
        def system_settings():
            return "System Settings"
    
    Returns:
        Decorated function that requires admin role
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('login'))
        
        if current_user.role != Role.ADMIN:
            abort(403)
        
        return f(*args, **kwargs)
    return decorated_function


def check_permission(user, permission: Permission) -> bool:
    """
    Helper function to check if a user has a specific permission.
    Can be used in templates or views without decorators.
    
    Usage in view:
        if check_permission(current_user, Permission.EDIT_PATIENT):
            # Show edit button
    
    Usage in template (after adding to context):
        {% if check_permission(current_user, permission.EDIT_PATIENT) %}
            <button>Edit</button>
        {% endif %}
    
    Args:
        user: The user object
        permission: The Permission enum value to check
        
    Returns:
        True if user has permission, False otherwise
    """
    return RolePermissionMap.has_permission(user.role, permission)
