"""
Appointment Model - Manages patient appointments and scheduling
"""

from datetime import datetime
from . import db


class Appointment(db.Model):
    """
    Appointment model for scheduling and managing patient appointments.
    Links patients with doctors and tracks appointment lifecycle.
    """
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Appointment Details
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    appointment_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=True)
    duration_minutes = db.Column(db.Integer, default=30)
    
    # Status
    status = db.Column(
        db.String(20),
        nullable=False,
        default='Scheduled',
        index=True
    )  # Scheduled, Confirmed, InProgress, Completed, Cancelled, NoShow, Rescheduled
    
    # Type & Reason
    appointment_type = db.Column(db.String(50), default='Consultation')
    # Consultation, Follow-up, Surgery, Emergency, Check-up, Procedure, Lab Test
    
    reason = db.Column(db.Text)
    notes = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    
    # Cancellation
    cancellation_reason = db.Column(db.Text)
    cancelled_at = db.Column(db.DateTime)
    cancelled_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Department
    department = db.Column(db.String(80), index=True)
    room_number = db.Column(db.String(20))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bills = db.relationship('Billing', backref='appointment', lazy='dynamic',
                             cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Appointment #{self.id} - Patient:{self.patient_id} Doctor:{self.doctor_id} ({self.status})>'

    def cancel(self, reason=None, cancelled_by=None):
        """Cancel the appointment."""
        self.status = 'Cancelled'
        self.cancellation_reason = reason
        self.cancelled_at = datetime.utcnow()
        self.cancelled_by = cancelled_by

    def reschedule(self, new_date, new_time):
        """Reschedule the appointment."""
        self.status = 'Rescheduled'
        self.appointment_date = new_date
        self.appointment_time = new_time

    def complete(self, diagnosis=None, prescription=None, notes=None):
        """Mark appointment as completed."""
        self.status = 'Completed'
        if diagnosis:
            self.diagnosis = diagnosis
        if prescription:
            self.prescription = prescription
        if notes:
            self.notes = notes

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'appointment_type': self.appointment_type,
            'reason': self.reason,
            'department': self.department,
            'room_number': self.room_number,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
