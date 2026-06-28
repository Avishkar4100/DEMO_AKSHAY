"""
Patient Model - Core patient entity with medical information
"""

from datetime import datetime
from . import db


class Patient(db.Model):
    """
    Patient model representing hospital patients.
    Stores personal, contact, and basic medical information.
    """
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    
    # Personal Information
    first_name = db.Column(db.String(80), nullable=False, index=True)
    last_name = db.Column(db.String(80), nullable=False, index=True)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)  # Male, Female, Other
    blood_group = db.Column(db.String(5))  # A+, A-, B+, B-, AB+, AB-, O+, O-
    
    # Contact Information
    email = db.Column(db.String(120), unique=True, index=True)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text)
    city = db.Column(db.String(80))
    state = db.Column(db.String(80))
    zip_code = db.Column(db.String(20))
    emergency_contact_name = db.Column(db.String(120))
    emergency_contact_phone = db.Column(db.String(20))
    
    # Medical Information
    medical_history = db.Column(db.Text)  # JSON string for flexible storage
    allergies = db.Column(db.Text)
    current_medications = db.Column(db.Text)
    primary_diagnosis = db.Column(db.String(200))
    
    # Status
    status = db.Column(db.String(20), default='Active', nullable=False, index=True)  # Active, Inactive, Discharged, Deceased
    
    # Insurance
    insurance_provider = db.Column(db.String(100))
    insurance_policy_number = db.Column(db.String(50))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)  # Soft delete
    
    # Relationships
    appointments = db.relationship('Appointment', backref='patient', lazy='dynamic',
                                    foreign_keys='Appointment.patient_id',
                                    cascade='all, delete-orphan')
    bills = db.relationship('Billing', backref='patient', lazy='dynamic',
                             cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Patient {self.get_full_name()} ({self.id})>'

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_age(self):
        """Calculate patient age from date of birth."""
        if not self.date_of_birth:
            return None
        today = datetime.utcnow().date()
        age = today.year - self.date_of_birth.year
        if today.month < self.date_of_birth.month or \
           (today.month == self.date_of_birth.month and today.day < self.date_of_birth.day):
            age -= 1
        return age

    def soft_delete(self):
        """Soft delete the patient record."""
        self.deleted_at = datetime.utcnow()
        self.status = 'Deleted'

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.get_full_name(),
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.get_age(),
            'gender': self.gender,
            'blood_group': self.blood_group,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'emergency_contact': {
                'name': self.emergency_contact_name,
                'phone': self.emergency_contact_phone,
            },
            'status': self.status,
            'insurance_provider': self.insurance_provider,
            'insurance_policy_number': self.insurance_policy_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
