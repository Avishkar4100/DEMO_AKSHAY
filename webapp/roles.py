"""
HOS-7: Role Definition Module

This module defines all role types and their associated permissions for the HMS system.
Roles: Admin, Doctor, Receptionist, and Nurse

Each role has specific permissions that control access to system features and actions.
This design ensures flexibility to update, extend, or modify roles in the future.
"""

from enum import Enum
from typing import List, Set

class Permission(Enum):
    """
    Define all possible permissions in the system.
    Permissions are fine-grained and map to specific actions/features.
    """
    # User Management
    VIEW_USERS = "view_users"
    CREATE_USER = "create_user"
    EDIT_USER = "edit_user"
    DELETE_USER = "delete_user"
    
    # Patient Management
    VIEW_PATIENTS = "view_patients"
    CREATE_PATIENT = "create_patient"
    EDIT_PATIENT = "edit_patient"
    DELETE_PATIENT = "delete_patient"
    VIEW_PATIENT_HISTORY = "view_patient_history"
    
    # Appointments
    VIEW_APPOINTMENTS = "view_appointments"
    CREATE_APPOINTMENT = "create_appointment"
    EDIT_APPOINTMENT = "edit_appointment"
    CANCEL_APPOINTMENT = "cancel_appointment"
    
    # Medical Records
    VIEW_MEDICAL_RECORDS = "view_medical_records"
    CREATE_MEDICAL_RECORD = "create_medical_record"
    EDIT_MEDICAL_RECORD = "edit_medical_record"
    
    # Prescriptions
    VIEW_PRESCRIPTIONS = "view_prescriptions"
    CREATE_PRESCRIPTION = "create_prescription"
    EDIT_PRESCRIPTION = "edit_prescription"
    
    # Reports & Analytics
    VIEW_REPORTS = "view_reports"
    GENERATE_REPORTS = "generate_reports"
    
    # System Administration
    MANAGE_ROLES = "manage_roles"
    MANAGE_SYSTEM = "manage_system"
    VIEW_AUDIT_LOG = "view_audit_log"
    
    # Dashboard
    VIEW_DASHBOARD = "view_dashboard"


class Role(Enum):
    """
    Define all role types in the system.
    Each role has a specific set of permissions.
    """
    ADMIN = "admin"
    DOCTOR = "doctor"
    RECEPTIONIST = "receptionist"
    NURSE = "nurse"


class RolePermissionMap:
    """
    Maps each role to its assigned permissions.
    This is the central configuration for role-based access control.
    
    Easily extensible: to add new permissions to a role, update the corresponding
    set in this class. To create new roles, add them to the Role enum and define
    their permissions here.
    """
    
    ROLE_PERMISSIONS = {
        Role.ADMIN: {
            # Admin has all permissions
            Permission.VIEW_USERS,
            Permission.CREATE_USER,
            Permission.EDIT_USER,
            Permission.DELETE_USER,
            
            Permission.VIEW_PATIENTS,
            Permission.CREATE_PATIENT,
            Permission.EDIT_PATIENT,
            Permission.DELETE_PATIENT,
            Permission.VIEW_PATIENT_HISTORY,
            
            Permission.VIEW_APPOINTMENTS,
            Permission.CREATE_APPOINTMENT,
            Permission.EDIT_APPOINTMENT,
            Permission.CANCEL_APPOINTMENT,
            
            Permission.VIEW_MEDICAL_RECORDS,
            Permission.CREATE_MEDICAL_RECORD,
            Permission.EDIT_MEDICAL_RECORD,
            
            Permission.VIEW_PRESCRIPTIONS,
            Permission.CREATE_PRESCRIPTION,
            Permission.EDIT_PRESCRIPTION,
            
            Permission.VIEW_REPORTS,
            Permission.GENERATE_REPORTS,
            
            Permission.MANAGE_ROLES,
            Permission.MANAGE_SYSTEM,
            Permission.VIEW_AUDIT_LOG,
            
            Permission.VIEW_DASHBOARD,
        },
        
        Role.DOCTOR: {
            # Doctor can view and manage patients, medical records, and prescriptions
            Permission.VIEW_PATIENTS,
            Permission.CREATE_PATIENT,
            Permission.EDIT_PATIENT,
            Permission.VIEW_PATIENT_HISTORY,
            
            Permission.VIEW_APPOINTMENTS,
            Permission.CREATE_APPOINTMENT,
            Permission.EDIT_APPOINTMENT,
            Permission.CANCEL_APPOINTMENT,
            
            Permission.VIEW_MEDICAL_RECORDS,
            Permission.CREATE_MEDICAL_RECORD,
            Permission.EDIT_MEDICAL_RECORD,
            
            Permission.VIEW_PRESCRIPTIONS,
            Permission.CREATE_PRESCRIPTION,
            Permission.EDIT_PRESCRIPTION,
            
            Permission.VIEW_REPORTS,
            Permission.VIEW_DASHBOARD,
        },
        
        Role.RECEPTIONIST: {
            # Receptionist manages appointments and patient registration
            Permission.VIEW_PATIENTS,
            Permission.CREATE_PATIENT,
            Permission.EDIT_PATIENT,
            
            Permission.VIEW_APPOINTMENTS,
            Permission.CREATE_APPOINTMENT,
            Permission.EDIT_APPOINTMENT,
            Permission.CANCEL_APPOINTMENT,
            
            Permission.VIEW_MEDICAL_RECORDS,
            Permission.VIEW_DASHBOARD,
        },
        
        Role.NURSE: {
            # Nurse assists with patient care and medical records
            Permission.VIEW_PATIENTS,
            Permission.EDIT_PATIENT,
            Permission.VIEW_PATIENT_HISTORY,
            
            Permission.VIEW_APPOINTMENTS,
            
            Permission.VIEW_MEDICAL_RECORDS,
            Permission.CREATE_MEDICAL_RECORD,
            Permission.EDIT_MEDICAL_RECORD,
            
            Permission.VIEW_DASHBOARD,
        },
    }
    
    @classmethod
    def get_permissions(cls, role: Role) -> Set[Permission]:
        """
        Get all permissions for a given role.
        
        Args:
            role: The Role enum value
            
        Returns:
            Set of Permission values for this role
        """
        return cls.ROLE_PERMISSIONS.get(role, set())
    
    @classmethod
    def has_permission(cls, role: Role, permission: Permission) -> bool:
        """
        Check if a role has a specific permission.
        
        Args:
            role: The Role enum value
            permission: The Permission enum value
            
        Returns:
            True if role has permission, False otherwise
        """
        return permission in cls.get_permissions(role)
    
    @classmethod
    def get_all_roles(cls) -> List[Role]:
        """Get all available roles in the system."""
        return list(cls.ROLE_PERMISSIONS.keys())
    
    @classmethod
    def add_permission_to_role(cls, role: Role, permission: Permission) -> None:
        """
        Dynamically add a permission to a role.
        Useful for runtime role configuration.
        
        Args:
            role: The Role enum value
            permission: The Permission enum value
        """
        if role in cls.ROLE_PERMISSIONS:
            cls.ROLE_PERMISSIONS[role].add(permission)
    
    @classmethod
    def remove_permission_from_role(cls, role: Role, permission: Permission) -> None:
        """
        Dynamically remove a permission from a role.
        Useful for runtime role configuration.
        
        Args:
            role: The Role enum value
            permission: The Permission enum value
        """
        if role in cls.ROLE_PERMISSIONS:
            cls.ROLE_PERMISSIONS[role].discard(permission)
    
    @classmethod
    def update_role_permissions(cls, role: Role, permissions: Set[Permission]) -> None:
        """
        Update all permissions for a role.
        
        Args:
            role: The Role enum value
            permissions: Set of Permission values to assign to the role
        """
        cls.ROLE_PERMISSIONS[role] = permissions


# Summary for quick reference
ROLE_DESCRIPTIONS = {
    Role.ADMIN: "System Administrator - Full access to all features and system management",
    Role.DOCTOR: "Medical Doctor - Access to patient records, medical records, and prescriptions",
    Role.RECEPTIONIST: "Front Desk Receptionist - Manages appointments and patient registration",
    Role.NURSE: "Nurse Assistant - Assists with patient care and medical documentation",
}
