"""
Billing Model - Manages invoices, payments, and revenue tracking
"""

from datetime import datetime
from decimal import Decimal
from . import db


class Billing(db.Model):
    """
    Billing model for managing patient invoices and payments.
    Tracks charges, payments, and outstanding balances.
    """
    __tablename__ = 'billings'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    
    # Invoice Info
    invoice_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    invoice_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=False)
    
    # Financial Details
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    tax_amount = db.Column(db.Numeric(10, 2), default=0.00)
    discount_amount = db.Column(db.Numeric(10, 2), default=0.00)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    paid_amount = db.Column(db.Numeric(10, 2), default=0.00)
    balance_amount = db.Column(db.Numeric(10, 2), default=0.00)
    
    # Status
    status = db.Column(
        db.String(20),
        nullable=False,
        default='Pending',
        index=True
    )  # Draft, Pending, Paid, PartiallyPaid, Overdue, Cancelled, Refunded
    
    # Payment
    payment_method = db.Column(db.String(30))  # Cash, Card, Insurance, Bank Transfer, Online
    payment_date = db.Column(db.DateTime)
    payment_reference = db.Column(db.String(100))
    
    # Insurance
    insurance_claimed = db.Column(db.Boolean, default=False)
    insurance_amount = db.Column(db.Numeric(10, 2), default=0.00)
    insurance_status = db.Column(db.String(20))  # Pending, Approved, Denied, Paid
    
    # Items (stored as JSON for flexibility)
    line_items = db.Column(db.Text)  # JSON array of {description, quantity, unit_price, total}
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    
    # Relationships
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    def __repr__(self):
        return f'<Billing #{self.invoice_number} - ${self.total_amount} ({self.status})>'

    def mark_paid(self, amount=None, method=None, reference=None):
        """Mark invoice as paid."""
        self.status = 'Paid'
        self.paid_amount = amount or self.total_amount
        self.balance_amount = Decimal('0.00')
        self.payment_method = method or self.payment_method
        self.payment_reference = reference
        self.payment_date = datetime.utcnow()
        self.paid_at = datetime.utcnow()

    def mark_partially_paid(self, amount, method=None):
        """Record partial payment."""
        self.status = 'PartiallyPaid'
        self.paid_amount = Decimal(str(amount))
        self.balance_amount = Decimal(str(self.total_amount)) - Decimal(str(amount))
        self.payment_method = method or self.payment_method
        self.payment_date = datetime.utcnow()

    def mark_overdue(self):
        """Mark invoice as overdue."""
        self.status = 'Overdue'

    def cancel(self):
        """Cancel the invoice."""
        self.status = 'Cancelled'

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'patient_id': self.patient_id,
            'appointment_id': self.appointment_id,
            'invoice_date': self.invoice_date.isoformat() if self.invoice_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0,
            'discount_amount': float(self.discount_amount) if self.discount_amount else 0,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'paid_amount': float(self.paid_amount) if self.paid_amount else 0,
            'balance_amount': float(self.balance_amount) if self.balance_amount else 0,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_reference': self.payment_reference,
            'insurance_claimed': self.insurance_claimed,
            'insurance_amount': float(self.insurance_amount) if self.insurance_amount else 0,
            'insurance_status': self.insurance_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
