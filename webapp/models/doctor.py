"""
Doctor Model - Doctor profile with specialization, qualifications, and schedule
"""

from datetime import datetime
from . import db


class Doctor(db.Model):
    """
    Doctor model extending user profiles with medical specialization.
    Each doctor links to a User account and has additional medical credentials.
    """
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    
    # Link to User account (1-to-1)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    
    # Professional Information
    specialization = db.Column(db.String(100), nullable=False, index=True)
    # Cardiology, Pediatrics, Orthopedics, Neurology, General Medicine, etc.
    
    qualifications = db.Column(db.Text)
    # JSON array: ["MBBS", "MD - Cardiology", "DM - Cardiology"]
    
    license_number = db.Column(db.String(50), unique=True)
    years_of_experience = db.Column(db.Integer, default=0)
    
    # Consultation
    consultation_fee = db.Column(db.Numeric(10, 2), default=0.00)
    available_for_emergency = db.Column(db.Boolean, default=False)
    
    # Schedule (stored as JSON for flexibility)
    schedule = db.Column(db.Text)
    # JSON: {"monday": {"start": "09:00", "end": "17:00", "break": "13:00-14:00"}, ...}
    
    # Bio
    biography = db.Column(db.Text)
    education = db.Column(db.Text)
    awards = db.Column(db.Text)
    
    # Department
    department = db.Column(db.String(80), index=True)
    
    # Status
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('doctor_profile', uselist=False, lazy='joined'))
    appointments = db.relationship('Appointment', backref='doctor_ref', lazy='dynamic',
                                    foreign_keys='Appointment.doctor_id',
                                    primaryjoin='Doctor.user_id == Appointment.doctor_id',
                                    viewonly=True)

    def __repr__(self):
        return f'<Doctor Dr. {self.get_full_name()} ({self.specialization})>'

    def get_full_name(self):
        """Get doctor's full name from linked User."""
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip()
        return f"Doctor #{self.id}"

    def get_display_name(self):
        """Get display name with title."""
        name = self.get_full_name()
        return f"Dr. {name}" if name else f"Dr. #{self.id}"

    def is_available_on(self, day_of_week):
        """Check if doctor has availability on a given day."""
        import json
        if not self.schedule:
            return False
        try:
            schedule = json.loads(self.schedule)
            return day_of_week.lower() in schedule
        except (json.JSONDecodeError, AttributeError):
            return False

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.get_full_name(),
            'display_name': self.get_display_name(),
            'specialization': self.specialization,
            'qualifications': self.qualifications,
            'license_number': self.license_number,
            'years_of_experience': self.years_of_experience,
            'consultation_fee': float(self.consultation_fee) if self.consultation_fee else 0,
            'available_for_emergency': self.available_for_emergency,
            'department': self.department,
            'is_available': self.is_available,
            'biography': self.biography,
            'education': self.education,
            'awards': self.awards,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
