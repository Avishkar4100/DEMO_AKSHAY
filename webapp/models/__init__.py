from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .patient import Patient
from .appointment import Appointment
from .billing import Billing

__all__ = ['db', 'User', 'Patient', 'Appointment', 'Billing']
