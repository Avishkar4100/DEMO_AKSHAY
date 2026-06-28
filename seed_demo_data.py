"""
Seed Script: Create demonstration data for all database models
Generates sample patients, appointments, and billing records
"""

import sys
import os
from datetime import datetime, date, time, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from webapp.app import create_app
from webapp.models import db, User, Patient, Appointment, Billing
from werkzeug.security import generate_password_hash

app = create_app()

# ── Sample Data ──────────────────────────────────────────────────────

SAMPLE_PATIENTS = [
    {
        'first_name': 'Alice', 'last_name': 'Johnson',
        'date_of_birth': date(1992, 3, 15), 'gender': 'Female',
        'phone': '+1 555-0101', 'email': 'alice.j@email.com',
        'address': '123 Oak St', 'city': 'New York', 'state': 'NY',
        'blood_group': 'A+', 'status': 'Active',
        'emergency_contact_name': 'Bob Johnson', 'emergency_contact_phone': '+1 555-0199',
    },
    {
        'first_name': 'Bob', 'last_name': 'Williams',
        'date_of_birth': date(1978, 7, 22), 'gender': 'Male',
        'phone': '+1 555-0102', 'email': 'bob.w@email.com',
        'address': '456 Pine Rd', 'city': 'New York', 'state': 'NY',
        'blood_group': 'O+', 'status': 'Active',
        'emergency_contact_name': 'Carol Williams', 'emergency_contact_phone': '+1 555-0198',
    },
    {
        'first_name': 'Carol', 'last_name': 'Davis',
        'date_of_birth': date(1995, 11, 8), 'gender': 'Female',
        'phone': '+1 555-0103', 'email': 'carol.d@email.com',
        'address': '789 Elm Ave', 'city': 'Brooklyn', 'state': 'NY',
        'blood_group': 'B-', 'status': 'Inactive',
        'emergency_contact_name': 'Tom Davis', 'emergency_contact_phone': '+1 555-0197',
    },
    {
        'first_name': 'David', 'last_name': 'Brown',
        'date_of_birth': date(1970, 1, 30), 'gender': 'Male',
        'phone': '+1 555-0104', 'email': 'david.b@email.com',
        'address': '321 Maple Dr', 'city': 'New York', 'state': 'NY',
        'blood_group': 'AB+', 'status': 'Active',
        'emergency_contact_name': 'Emily Brown', 'emergency_contact_phone': '+1 555-0196',
    },
    {
        'first_name': 'Emma', 'last_name': 'Wilson',
        'date_of_birth': date(1988, 5, 12), 'gender': 'Female',
        'phone': '+1 555-0105', 'email': 'emma.w@email.com',
        'address': '654 Birch Ln', 'city': 'Brooklyn', 'state': 'NY',
        'blood_group': 'O-', 'status': 'Active',
        'emergency_contact_name': 'James Wilson', 'emergency_contact_phone': '+1 555-0195',
    },
]

DEPARTMENTS = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine']
APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Surgery', 'Lab Test']
STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Pending', 'Completed']

def seed_all():
    with app.app_context():
        db.create_all()
        print("=" * 60)
        print("SEEDING DEMONSTRATION DATA")
        print("=" * 60)

        # ── Seed Patients ──
        patient_count = Patient.query.count()
        if patient_count == 0:
            for data in SAMPLE_PATIENTS:
                patient = Patient(**data)
                db.session.add(patient)
            db.session.commit()
            print(f"\n✓ Created: {len(SAMPLE_PATIENTS)} patients")
        else:
            print(f"\n✓ Skipped: {patient_count} patients already exist")

        # ── Seed Appointments ──
        apt_count = Appointment.query.count()
        if apt_count == 0:
            patients = Patient.query.all()
            doctors = User.query.filter(User.role == 'doctor').all()
            # Fallback to any user if no doctors
            if not doctors:
                doctors = User.query.all()
            
            today = date.today()
            appointments_data = []
            for i in range(12):
                patient = random.choice(patients)
                doctor = random.choice(doctors) if doctors else None
                apt_date = today + timedelta(days=random.randint(-5, 14))
                hour = random.randint(8, 16)
                apt_time = time(hour, random.choice([0, 15, 30, 45]))
                apt_type = random.choice(APPOINTMENT_TYPES)
                status = random.choice(STATUSES)

                appointment = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id if doctor else 1,
                    appointment_date=apt_date,
                    appointment_time=apt_time,
                    duration_minutes=random.choice([15, 30, 45, 60]),
                    status=status,
                    appointment_type=apt_type,
                    department=random.choice(DEPARTMENTS),
                    room_number=f"{random.randint(1, 5)}{random.choice(['01','02','03','04','05'])}",
                    reason=f"Routine {apt_type.lower()} for {patient.get_full_name()}",
                    notes=f"Patient {patient.get_full_name()} - {apt_type} scheduled."
                )
                if status == 'Completed':
                    appointment.diagnosis = f"{apt_type} completed successfully. Patient in stable condition."
                    appointment.prescription = "Rest for 24 hours. Follow up if symptoms persist."
                
                db.session.add(appointment)
            db.session.commit()
            print(f"✓ Created: 12 appointments")
        else:
            print(f"✓ Skipped: {apt_count} appointments already exist")

        # ── Seed Billing Records ──
        bill_count = Billing.query.count()
        if bill_count == 0:
            patients = Patient.query.all()
            appointments = Appointment.query.filter(Appointment.status == 'Completed').all()
            
            for i, apt in enumerate(appointments[:8], 1):
                patient = Patient.query.get(apt.patient_id)
                base_amount = Decimal(str(random.randint(50, 500)))
                tax = base_amount * Decimal('0.08')
                total = base_amount + tax
                payment_methods = ['Cash', 'Card', 'Insurance', 'Online']
                method = random.choice(payment_methods)
                
                inv_number = f"INV-{datetime.utcnow().strftime('%Y%m')}-{str(i).zfill(3)}"
                
                bill = Billing(
                    patient_id=patient.id,
                    appointment_id=apt.id,
                    invoice_number=inv_number,
                    invoice_date=today - timedelta(days=random.randint(0, 10)),
                    due_date=today + timedelta(days=30),
                    subtotal=base_amount,
                    tax_amount=tax,
                    total_amount=total,
                    paid_amount=total if method != 'Insurance' else Decimal('0'),
                    balance_amount=Decimal('0') if method != 'Insurance' else total,
                    status='Paid' if method != 'Insurance' else 'Pending',
                    payment_method=method,
                    payment_date=datetime.utcnow() if method != 'Insurance' else None,
                )
                db.session.add(bill)
            db.session.commit()
            print(f"✓ Created: 8 billing records")
        else:
            print(f"✓ Skipped: {bill_count} billing records already exist")

        # ── Summary ──
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"  Users:       {User.query.count()}")
        print(f"  Patients:    {Patient.query.count()}")
        print(f"  Appointments:{Appointment.query.count()}")
        print(f"  Bills:       {Billing.query.count()}")
        print("=" * 60)
        print("✓ Seeding complete!")

if __name__ == '__main__':
    from decimal import Decimal
    seed_all()
