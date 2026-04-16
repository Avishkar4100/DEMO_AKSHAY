"""
User Model - Handles user accounts and role assignment

This model is used for HOS-7 (Role Definition) implementation.
Each user is assigned a role that determines their permissions in the system.
"""

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db
from ..roles import Role


class User(UserMixin, db.Model):
    """
    User model representing system users.
    Each user has a role that controls their permissions.
    """
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Role assignment (HOS-7)
    role = db.Column(
        db.String(20),
        nullable=False,
        default=Role.RECEPTIONIST.value,
        index=True
    )
    
    # User status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # User information
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    phone = db.Column(db.String(20))
    department = db.Column(db.String(80))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<User {self.username} ({self.role})>'
    
    def set_password(self, password: str) -> None:
        """
        Hash and set the user's password.
        
        Args:
            password: Plain text password
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """
        Verify a password against the stored hash.
        
        Args:
            password: Plain text password to verify
            
        Returns:
            True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def get_role(self) -> Role:
        """
        Get the user's role as a Role enum.
        
        Returns:
            Role enum value
        """
        try:
            return Role(self.role)
        except ValueError:
            return Role.RECEPTIONIST  # Fallback
    
    def set_role(self, role: Role) -> None:
        """
        Set the user's role.
        
        Args:
            role: Role enum value
        """
        if isinstance(role, Role):
            self.role = role.value
        else:
            self.role = str(role)
    
    def get_full_name(self) -> str:
        """Get the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_display_name(self) -> str:
        """Get a display name (full name if available, else username)."""
        full_name = self.get_full_name()
        return full_name if full_name else self.username
    
    def to_dict(self) -> dict:
        """Convert user to dictionary (useful for API responses)."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'department': self.department,
            'display_name': self.get_display_name(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
