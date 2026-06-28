"""
HOS-95: Doctor Model - Test Suite
Tests doctor profile creation, specialization, relationships, and data integrity
"""

import unittest
import json
from datetime import date, time
from webapp.app import create_app
from webapp.models import db, User, Doctor, Patient, Appointment


class DoctorModelTest(unittest.TestCase):
    """Test suite for Doctor model"""

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
        user = User(username='dr_smith', email='dr.smith@hospital.com',
                    role='doctor', first_name='John', last_name='Smith')
        user.set_password('Doctor@12345')
        db.session.add(user)
        db.session.commit()

        self.doctor = Doctor(
            user_id=user.id,
            specialization='Cardiology',
            qualifications=json.dumps(["MBBS", "MD - Cardiology", "FACC"]),
            license_number='LIC-12345',
            years_of_experience=15,
            consultation_fee=200.00,
            department='Cardiology',
            biography='Senior cardiologist with 15 years of experience.',
            schedule=json.dumps({
                "monday": {"start": "09:00", "end": "17:00"},
                "wednesday": {"start": "09:00", "end": "17:00"},
            })
        )
        db.session.add(self.doctor)
        db.session.commit()

        self.doctor_user = user

    def test_ac1_doctor_schema_fields(self):
        """Doctor schema includes all required fields and specialization"""
        cols = [c.name for c in Doctor.__table__.columns]
        required = ['id', 'user_id', 'specialization', 'qualifications',
                     'license_number', 'years_of_experience', 'consultation_fee',
                     'department', 'is_available', 'biography']
        for col in required:
            self.assertIn(col, cols, f"Missing Doctor column: {col}")

        self.assertEqual(self.doctor.specialization, 'Cardiology')
        self.assertEqual(self.doctor.years_of_experience, 15)
        self.assertEqual(float(self.doctor.consultation_fee), 200.00)
        self.assertTrue(self.doctor.is_available)
        print("  [OK] AC-1: Doctor schema - all required fields present")

    def test_ac1_doctor_profile_details(self):
        """Doctor profile includes qualifications, license, and schedule"""
        quals = json.loads(self.doctor.qualifications)
        self.assertIn('MBBS', quals)
        self.assertIn('MD - Cardiology', quals)
        self.assertEqual(self.doctor.license_number, 'LIC-12345')

        schedule = json.loads(self.doctor.schedule)
        self.assertIn('monday', schedule)
        self.assertEqual(schedule['monday']['start'], '09:00')
        self.assertTrue(self.doctor.is_available_on('monday'))
        self.assertFalse(self.doctor.is_available_on('tuesday'))
        print("  [OK] AC-1: Doctor profile - qualifications, license, schedule verified")

    def test_ac1_doctor_display_name(self):
        """Doctor display name includes Dr. title"""
        self.assertEqual(self.doctor.get_full_name(), 'John Smith')
        self.assertEqual(self.doctor.get_display_name(), 'Dr. John Smith')
        print("  [OK] AC-1: Doctor display name - Dr. title format")

    def test_ac2_doctor_linked_to_appointments(self):
        """Doctor records are correctly linked to appointments"""
        patient = Patient(
            first_name='Test', last_name='Patient',
            date_of_birth=date(1990, 1, 1), gender='Female',
            phone='+1 555-0000'
        )
        db.session.add(patient)
        db.session.commit()

        apt = Appointment(
            patient_id=patient.id,
            doctor_id=self.doctor.user_id,
            appointment_date=date.today(),
            appointment_time=time(10, 0),
            status='Scheduled',
            department='Cardiology'
        )
        db.session.add(apt)
        db.session.commit()

        # Query via Doctor relationship
        self.assertEqual(self.doctor.appointments.count(), 1)
        self.assertEqual(apt.doctor_ref.id, self.doctor.id)
        print("  [OK] AC-2: Doctor linked to appointments (both directions)")

    def test_ac2_user_to_doctor_relationship(self):
        """User to Doctor 1-to-1 relationship works"""
        doc = Doctor.query.filter_by(user_id=self.doctor_user.id).first()
        self.assertIsNotNone(doc)
        self.assertEqual(doc.user.username, 'dr_smith')
        self.assertEqual(self.doctor_user.doctor_profile.id, self.doctor.id)
        print("  [OK] AC-2: User <-> Doctor 1-to-1 relationship verified")

    def test_ac3_doctor_data_accuracy(self):
        """Doctor data is stored and retrieved accurately"""
        doc = Doctor.query.filter_by(specialization='Cardiology').first()
        self.assertIsNotNone(doc)
        self.assertEqual(doc.years_of_experience, 15)
        self.assertEqual(doc.department, 'Cardiology')
        self.assertEqual(doc.get_display_name(), 'Dr. John Smith')

        to_dict = doc.to_dict()
        self.assertEqual(to_dict['specialization'], 'Cardiology')
        self.assertEqual(to_dict['years_of_experience'], 15)
        self.assertEqual(to_dict['consultation_fee'], 200.00)
        self.assertIn('full_name', to_dict)
        self.assertIn('display_name', to_dict)
        print("  [OK] AC-3: Doctor data stored and retrieved accurately")

    def test_ac3_unique_license_number(self):
        """License number unique constraint works"""
        user2 = User(username='dr_jane', email='dr.jane@hospital.com',
                     role='doctor', first_name='Jane', last_name='Doe')
        user2.set_password('Doctor@12345')
        db.session.add(user2)
        db.session.commit()

        dup = Doctor(
            user_id=user2.id,
            specialization='Pediatrics',
            license_number='LIC-12345'  # Same license as seed
        )
        db.session.add(dup)
        with self.assertRaises(Exception):
            db.session.commit()
        db.session.rollback()
        print("  [OK] AC-3: Unique constraint on license_number enforced")


def run_tests():
    print("\n" + "=" * 70)
    print("HOS-95: DOCTOR MODEL - TEST SUITE")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(DoctorModelTest)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print(f"[OK] PASSED: {result.testsRun}/{result.testsRun}")
        print("  - AC-1: Doctor schema includes all required fields [OK]")
        print("  - AC-2: Doctor records linked to appointments [OK]")
        print("  - AC-3: Data stored and retrieved accurately [OK]")
    else:
        failed = len(result.failures) + len(result.errors)
        print(f"[PARTIAL] {result.testsRun - failed}/{result.testsRun} passed")
    print("=" * 70)
    return result.wasSuccessful()


if __name__ == '__main__':
    run_tests()
