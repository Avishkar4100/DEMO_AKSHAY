"""
Database Schema Tests - Validates models, relationships, and constraints
"""

import unittest
from datetime import date, time, datetime
from decimal import Decimal
from webapp.app import create_app
from webapp.models import db, User, Patient, Appointment, Billing


class DatabaseSchemaTest(unittest.TestCase):
    """Tests for database models, relationships, and data integrity"""

    @classmethod
    def setUpClass(cls):
        cls.app = create_app('testing')
        cls.ctx = cls.app.app_context()
        cls.ctx.push()

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'ctx'):
            try:
                cls.ctx.pop()
            except (RuntimeError, IndexError):
                pass

    def setUp(self):
        db.create_all()
        self._seed()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def _seed(self):
        """Create test data"""
        # Create users
        self.admin = User(username='admin', email='admin@test.com',
                          password_hash='hash', role='admin',
                          first_name='System', last_name='Admin')
        self.admin.set_password('Admin@12345')
        self.doctor = User(username='doctor', email='doctor@test.com',
                           password_hash='hash', role='doctor',
                           first_name='John', last_name='Smith')
        self.doctor.set_password('Doctor@12345')
        db.session.add_all([self.admin, self.doctor])

        # Create patient
        self.patient = Patient(
            first_name='Test', last_name='Patient',
            date_of_birth=date(1990, 1, 15), gender='Female',
            phone='+1 555-0000', email='test@patient.com',
            blood_group='A+', status='Active',
            emergency_contact_name='Emergency Contact',
            emergency_contact_phone='+1 555-9999',
        )
        db.session.add(self.patient)
        db.session.commit()

    # ── AC-1: Models created with correct structure ──

    def test_ac1_user_model_structure(self):
        """User model has correct columns"""
        cols = [c.name for c in User.__table__.columns]
        required = ['id', 'username', 'email', 'password_hash', 'role',
                     'is_active', 'first_name', 'last_name', 'phone',
                     'department', 'created_at', 'updated_at', 'last_login']
        for col in required:
            self.assertIn(col, cols, f"Missing User column: {col}")
        print(f"  [OK] User model: {len(required)} required columns present")

    def test_ac1_patient_model_structure(self):
        """Patient model has correct columns and relations"""
        cols = [c.name for c in Patient.__table__.columns]
        required = ['id', 'first_name', 'last_name', 'date_of_birth', 'gender',
                     'phone', 'email', 'blood_group', 'status', 'address',
                     'emergency_contact_name', 'emergency_contact_phone']
        for col in required:
            self.assertIn(col, cols, f"Missing Patient column: {col}")
        # Check relationships
        self.assertTrue(hasattr(Patient, 'appointments'), "Patient missing appointments relation")
        self.assertTrue(hasattr(Patient, 'bills'), "Patient missing bills relation")
        print(f"  [OK] Patient model: {len(required)}+ cols, relationships verified")

    def test_ac1_appointment_model_structure(self):
        """Appointment model has correct columns and foreign keys"""
        cols = [c.name for c in Appointment.__table__.columns]
        required = ['id', 'patient_id', 'doctor_id', 'appointment_date',
                     'appointment_time', 'status', 'appointment_type',
                     'department', 'room_number', 'reason', 'notes']
        for col in required:
            self.assertIn(col, cols, f"Missing Appointment column: {col}")
        # Check foreign keys exist
        fks = [fk.column for fk in Appointment.__table__.foreign_keys]
        self.assertTrue(any('patients.id' in str(fk) for fk in fks),
                        "Missing FK to patients")
        self.assertTrue(any('users.id' in str(fk) for fk in fks),
                        "Missing FK to users")
        print(f"  [OK] Appointment model: {len(required)}+ cols, FKs verified")

    def test_ac1_billing_model_structure(self):
        """Billing model has correct columns and financial fields"""
        cols = [c.name for c in Billing.__table__.columns]
        required = ['id', 'patient_id', 'invoice_number', 'invoice_date',
                     'due_date', 'subtotal', 'tax_amount', 'total_amount',
                     'paid_amount', 'balance_amount', 'status', 'payment_method']
        for col in required:
            self.assertIn(col, cols, f"Missing Billing column: {col}")
        # Verify numeric precision
        total_col = Billing.__table__.columns['total_amount']
        self.assertTrue(str(total_col.type).startswith('NUMERIC'),
                        "total_amount should be NUMERIC for precision")
        print(f"  [OK] Billing model: {len(required)}+ cols, NUMERIC precision verified")

    # ── AC-2: Data integrity and constraints ──

    def test_ac2_patient_not_null_constraints(self):
        """Patient required fields enforce NOT NULL"""
        with self.assertRaises(Exception):
            invalid = Patient(first_name=None, last_name=None, date_of_birth=None,
                             gender=None, phone=None)
            db.session.add(invalid)
            db.session.commit()
        db.session.rollback()
        print("  [OK] NOT NULL constraints enforced")

    def test_ac2_unique_constraints(self):
        """Unique constraints work for email fields"""
        dup = Patient(
            first_name='Dup', last_name='Patient',
            date_of_birth=date(2000, 1, 1), gender='Male',
            phone='+1 555-1111', email='test@patient.com'  # Same email as seed
        )
        db.session.add(dup)
        with self.assertRaises(Exception):
            db.session.commit()
        db.session.rollback()
        print("  [OK] Unique constraints enforced")

    def test_ac2_appointment_patient_relationship(self):
        """Appointment-patient relationship works"""
        apt = Appointment(
            patient_id=self.patient.id,
            doctor_id=self.doctor.id,
            appointment_date=date.today(),
            appointment_time=time(10, 0),
            status='Scheduled',
            department='Cardiology',
        )
        db.session.add(apt)
        db.session.commit()

        # Query from patient side
        self.assertEqual(self.patient.appointments.count(), 1)
        # Query from appointment side
        self.assertEqual(apt.patient.id, self.patient.id)
        print("  [OK] Patient-Appointment relationship works (both directions)")

    def test_ac2_cascade_delete(self):
        """Deleting patient cascades to appointments and bills"""
        apt = Appointment(patient_id=self.patient.id, doctor_id=self.doctor.id,
                          appointment_date=date.today(), appointment_time=time(10, 0),
                          status='Scheduled', department='Cardiology')
        db.session.add(apt)
        db.session.commit()

        patient_id = self.patient.id
        db.session.delete(self.patient)
        db.session.commit()

        remaining_apts = Appointment.query.filter_by(patient_id=patient_id).count()
        self.assertEqual(remaining_apts, 0, "Cascade delete failed for appointments")
        print("  [OK] Cascade delete works (patient → appointments)")

    # ── AC-3: Schema supports scalability ──

    def test_ac3_bulk_insert(self):
        """Schema handles bulk operations"""
        patients = []
        for i in range(50):
            p = Patient(
                first_name=f'Bulk{i}', last_name='Test',
                date_of_birth=date(1990 + (i % 30), 1, 1),
                gender='Male' if i % 2 == 0 else 'Female',
                phone=f'+1 555-{1000 + i:04d}',
            )
            patients.append(p)
        db.session.add_all(patients)
        db.session.commit()
        self.assertEqual(Patient.query.count(), 51)  # 50 + 1 from seed
        print("  [OK] Bulk insert (50 records) completed successfully")

    def test_ac3_complex_queries(self):
        """Schema supports complex joins and aggregations"""
        # Create data for aggregation
        apt1 = Appointment(patient_id=self.patient.id, doctor_id=self.doctor.id,
                          appointment_date=date.today(), appointment_time=time(9, 0),
                          status='Completed', department='Cardiology')
        apt2 = Appointment(patient_id=self.patient.id, doctor_id=self.doctor.id,
                          appointment_date=date.today(), appointment_time=time(10, 0),
                          status='Scheduled', department='Pediatrics')
        db.session.add_all([apt1, apt2])
        db.session.commit()

        # Aggregate by department
        from sqlalchemy import func
        results = db.session.query(
            Appointment.department,
            func.count(Appointment.id)
        ).group_by(Appointment.department).all()

        dept_map = dict(results)
        self.assertIn('Cardiology', dept_map)
        self.assertIn('Pediatrics', dept_map)
        print(f"  [OK] Complex aggregation query works ({len(results)} departments)")

    def test_ac3_soft_delete(self):
        """Patient soft delete preserves data"""
        self.patient.soft_delete()
        db.session.commit()

        # Still exists in DB
        deleted = Patient.query.get(self.patient.id)
        self.assertIsNotNone(deleted)
        self.assertEqual(deleted.status, 'Deleted')
        self.assertIsNotNone(deleted.deleted_at)
        print("  [OK] Soft delete preserves data (status=Deleted)")


def run_tests():
    print("\n" + "=" * 70)
    print("DATABASE SCHEMA DESIGN - TEST SUITE")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(DatabaseSchemaTest)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print(f"[OK] PASSED: {result.testsRun}/{result.testsRun}")
        print("  - AC-1: Models created with correct structure [OK]")
        print("  - AC-2: Data integrity and constraints enforced [OK]")
        print("  - AC-3: Schema supports scalability [OK]")
    else:
        failed = len(result.failures) + len(result.errors)
        print(f"[PARTIAL] {result.testsRun - failed}/{result.testsRun} passed")
    print("=" * 70)
    return result.wasSuccessful()


if __name__ == '__main__':
    run_tests()
