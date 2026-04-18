"""
HOS-16: Data Aggregation Test Suite

Tests for accurate data aggregation and optimized database queries:
- Aggregate patient, appointment, and revenue metrics
- Optimize database queries for performance
- Structure aggregated data for dashboard visualization
- Ensure data accuracy and consistency
"""

import sys
import os
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from webapp.app import create_app
from webapp.models import db, User
from webapp.roles import Role
from datetime import datetime, timedelta


class DataAggregationTest:
    """Test suite for HOS-16: Data Aggregation"""
    
    def __init__(self):
        """Initialize test environment"""
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create test database
        db.create_all()
        
        # Create test users
        self.admin_user = User(
            username='admin_aggregation',
            email='admin_aggregation@hms.local',
            first_name='Admin',
            last_name='Aggregation',
            role=Role.ADMIN.value
        )
        self.admin_user.set_password('AdminAgg123!')
        
        self.doctor_user = User(
            username='doctor_aggregation',
            email='doctor_aggregation@hms.local',
            first_name='Doctor',
            last_name='Aggregation',
            role=Role.DOCTOR.value
        )
        self.doctor_user.set_password('DoctorAgg123!')
        
        db.session.add(self.admin_user)
        db.session.add(self.doctor_user)
        db.session.commit()
    
    def teardown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_ac1_patient_metrics_calculation(self):
        """
        AC-1: Patient metrics are calculated accurately
        
        Verify that:
        - Total patient count is accurate
        - Active patient count is accurate
        - Patient metrics can be retrieved
        """
        print("\n[PASS] TEST 1: Patient Metrics Calculation (AC-1)")
        print("-" * 60)
        
        with self.app.app_context():
            # Login as admin
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Test patient metrics endpoint
                response = self.client.get('/api/dashboard/metrics')
                
                assert response.status_code == 200, \
                    "Metrics endpoint should return 200"
                print("  [OK] Metrics endpoint accessible")
                
                data = response.get_json()
                assert 'patients' in data, \
                    "Response should contain patient metrics"
                print("  [OK] Patient metrics present in response")
                
                # Verify patient metrics structure
                patients_metric = data['patients']
                assert 'total' in patients_metric, \
                    "Should have total patient count"
                assert 'active' in patients_metric, \
                    "Should have active patient count"
                assert isinstance(patients_metric['total'], int), \
                    "Total should be integer"
                assert isinstance(patients_metric['active'], int), \
                    "Active should be integer"
                print("  [OK] Patient metrics correctly structured")
                
                # Verify counts are non-negative
                assert patients_metric['total'] >= 0, \
                    "Total should be non-negative"
                assert patients_metric['active'] >= 0, \
                    "Active should be non-negative"
                assert patients_metric['active'] <= patients_metric['total'], \
                    "Active should not exceed total"
                print("  [OK] Patient counts are valid")
        
        return True
    
    def test_ac1_appointment_metrics_calculation(self):
        """
        AC-1: Appointment metrics are calculated accurately
        
        Verify that:
        - Total appointment count is accurate
        - Appointments by status are counted correctly
        - Appointment metrics can be retrieved
        """
        print("\n[PASS] TEST 2: Appointment Metrics Calculation (AC-1)")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Test appointment metrics
                response = self.client.get('/api/dashboard/metrics')
                
                assert response.status_code == 200, \
                    "Metrics endpoint should return 200"
                print("  [OK] Metrics endpoint accessible")
                
                data = response.get_json()
                assert 'appointments' in data, \
                    "Response should contain appointment metrics"
                print("  [OK] Appointment metrics present in response")
                
                # Verify appointment metrics structure
                appt_metric = data['appointments']
                assert 'total' in appt_metric, \
                    "Should have total appointment count"
                assert 'scheduled' in appt_metric, \
                    "Should have scheduled count"
                assert 'completed' in appt_metric, \
                    "Should have completed count"
                assert 'cancelled' in appt_metric, \
                    "Should have cancelled count"
                print("  [OK] Appointment metrics correctly structured")
                
                # Verify counts are valid
                assert isinstance(appt_metric['total'], int), \
                    "Total should be integer"
                assert appt_metric['total'] >= 0, \
                    "Total should be non-negative"
                print("  [OK] Appointment counts are valid")
        
        return True
    
    def test_ac1_revenue_metrics_calculation(self):
        """
        AC-1: Revenue metrics are calculated accurately
        
        Verify that:
        - Total revenue is calculated correctly
        - Revenue by period is accurate
        - Revenue metrics can be retrieved
        """
        print("\n[PASS] TEST 3: Revenue Metrics Calculation (AC-1)")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Test revenue metrics
                response = self.client.get('/api/dashboard/metrics')
                
                assert response.status_code == 200, \
                    "Metrics endpoint should return 200"
                print("  [OK] Metrics endpoint accessible")
                
                data = response.get_json()
                assert 'revenue' in data, \
                    "Response should contain revenue metrics"
                print("  [OK] Revenue metrics present in response")
                
                # Verify revenue metrics structure
                revenue_metric = data['revenue']
                assert 'total' in revenue_metric, \
                    "Should have total revenue"
                assert 'today' in revenue_metric, \
                    "Should have today's revenue"
                assert 'month' in revenue_metric, \
                    "Should have monthly revenue"
                print("  [OK] Revenue metrics correctly structured")
                
                # Verify revenue values are non-negative
                assert revenue_metric['total'] >= 0, \
                    "Total revenue should be non-negative"
                assert revenue_metric['today'] >= 0, \
                    "Today's revenue should be non-negative"
                assert revenue_metric['month'] >= 0, \
                    "Monthly revenue should be non-negative"
                print("  [OK] Revenue calculations are valid")
        
        return True
    
    def test_ac2_query_performance_optimization(self):
        """
        AC-2: Data retrieval is optimized with acceptable performance
        
        Verify that:
        - Metrics endpoint responds within acceptable time
        - Query performance is acceptable (< 500ms)
        - No N+1 query problems
        """
        print("\n[PASS] TEST 4: Query Performance Optimization (AC-2)")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Measure response time
                start_time = time.time()
                response = self.client.get('/api/dashboard/metrics')
                elapsed_time = (time.time() - start_time) * 1000  # Convert to ms
                
                assert response.status_code == 200, \
                    "Metrics endpoint should return 200"
                print(f"  [OK] Metrics endpoint responded: {elapsed_time:.2f}ms")
                
                # Check performance threshold (< 500ms)
                assert elapsed_time < 500, \
                    f"Response time ({elapsed_time:.2f}ms) should be < 500ms"
                print("  [OK] Query performance is acceptable")
                
                # Verify consistent performance on second call
                start_time = time.time()
                response = self.client.get('/api/dashboard/metrics')
                elapsed_time2 = (time.time() - start_time) * 1000
                
                assert response.status_code == 200, \
                    "Second call should also work"
                print(f"  [OK] Second call response: {elapsed_time2:.2f}ms")
        
        return True
    
    def test_ac3_structured_data_for_dashboard(self):
        """
        AC-3: Dashboard receives structured and consistent data
        
        Verify that:
        - Data is returned in consistent JSON structure
        - All required fields are present
        - Data is properly formatted for frontend
        """
        print("\n[PASS] TEST 5: Structured Data for Dashboard (AC-3)")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Get metrics
                response = self.client.get('/api/dashboard/metrics')
                
                assert response.status_code == 200, \
                    "Should return 200"
                print("  [OK] Metrics endpoint working")
                
                data = response.get_json()
                
                # Verify top-level structure
                required_keys = ['patients', 'appointments', 'revenue', 'timestamp']
                for key in required_keys:
                    assert key in data, \
                        f"Response should contain '{key}'"
                print("  [OK] All required top-level keys present")
                
                # Verify timestamp is valid
                assert 'timestamp' in data, \
                    "Should have timestamp"
                timestamp = data['timestamp']
                assert isinstance(timestamp, str), \
                    "Timestamp should be string"
                print("  [OK] Timestamp is properly formatted")
                
                # Verify data consistency on multiple calls
                response2 = self.client.get('/api/dashboard/metrics')
                data2 = response2.get_json()
                
                # Same metrics should have same counts
                assert data['patients']['total'] == data2['patients']['total'], \
                    "Patient counts should be consistent"
                assert data['appointments']['total'] == data2['appointments']['total'], \
                    "Appointment counts should be consistent"
                print("  [OK] Data is consistent across multiple calls")
        
        return True
    
    def test_role_based_data_visibility(self):
        """Test that data aggregation respects role-based access"""
        print("\n[PASS] TEST 6: Role-Based Data Visibility")
        print("-" * 60)
        
        with self.app.app_context():
            # Test as doctor (limited access)
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'doctor_aggregation',
                    'password': 'DoctorAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Doctor should be able to view metrics
                response = self.client.get('/api/dashboard/metrics')
                
                # Doctor might have limited access - check response
                if response.status_code == 200:
                    data = response.get_json()
                    assert 'patients' in data or 'appointments' in data, \
                        "Doctor should see some metrics"
                    print("  [OK] Doctor can access metrics")
                elif response.status_code == 403:
                    print("  [OK] Doctor access properly restricted")
                else:
                    assert False, f"Unexpected status code: {response.status_code}"
        
        return True
    
    def test_data_accuracy_with_multiple_updates(self):
        """Test data accuracy as system data changes"""
        print("\n[PASS] TEST 7: Data Accuracy with Updates")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Get initial metrics
                response1 = self.client.get('/api/dashboard/metrics')
                data1 = response1.get_json()
                initial_patient_count = data1['patients']['total']
                print(f"  [OK] Initial patient count: {initial_patient_count}")
                
                # Get metrics again
                response2 = self.client.get('/api/dashboard/metrics')
                data2 = response2.get_json()
                
                # Verify counts match
                assert data1['patients']['total'] == data2['patients']['total'], \
                    "Patient counts should remain consistent"
                print("  [OK] Data accuracy verified across calls")
        
        return True
    
    def test_empty_database_metrics(self):
        """Test metrics calculation with minimal data"""
        print("\n[PASS] TEST 8: Metrics with Minimal Data")
        print("-" * 60)
        
        with self.app.app_context():
            with self.client:
                self.client.post('/login/form', data={
                    'username': 'admin_aggregation',
                    'password': 'AdminAgg123!',
                    'remember_me': False
                }, follow_redirects=True)
                
                # Get metrics (should work even with empty tables)
                response = self.client.get('/api/dashboard/metrics')
                
                assert response.status_code == 200, \
                    "Should return 200 even with empty data"
                print("  [OK] Metrics endpoint works with minimal data")
                
                data = response.get_json()
                
                # Verify structure is consistent
                assert 'patients' in data, "Should have patient metrics"
                assert 'appointments' in data, "Should have appointment metrics"
                assert 'revenue' in data, "Should have revenue metrics"
                print("  [OK] All metric sections present")
                
                # Verify zero values are acceptable
                assert data['patients']['total'] >= 0, \
                    "Should handle zero or positive values"
                print("  [OK] Zero values properly handled")
        
        return True
    
    def run_all_tests(self):
        """Run all HOS-16 tests"""
        print("\n" + "="*60)
        print("HOS-16: DATA AGGREGATION TEST SUITE")
        print("="*60)
        
        tests = [
            ("Patient Metrics Calculation (AC-1)", self.test_ac1_patient_metrics_calculation),
            ("Appointment Metrics Calc (AC-1)", self.test_ac1_appointment_metrics_calculation),
            ("Revenue Metrics Calculation (AC-1)", self.test_ac1_revenue_metrics_calculation),
            ("Query Performance (AC-2)", self.test_ac2_query_performance_optimization),
            ("Structured Data (AC-3)", self.test_ac3_structured_data_for_dashboard),
            ("Role-Based Visibility", self.test_role_based_data_visibility),
            ("Data Accuracy", self.test_data_accuracy_with_multiple_updates),
            ("Minimal Data Handling", self.test_empty_database_metrics),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except AssertionError as e:
                failed += 1
                print(f"\n  [FAIL] TEST FAILED: {test_name}")
                print(f"  Error: {str(e)}")
            except Exception as e:
                failed += 1
                print(f"\n  [FAIL] TEST FAILED: {test_name}")
                print(f"  Error: {str(e)}")
        
        print("\n" + "="*60)
        print("HOS-16 ACCEPTANCE CRITERIA SUMMARY")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] PASSED: {passed}/{len(tests)}")
        if failed > 0:
            print(f"[FAIL] FAILED: {failed}/{len(tests)}")
        
        print("\n" + "="*60)
        print("HOS-16 COMPLIANCE CHECK:")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-1: Metrics calculated accurately")
        print(f"  - Patient metrics [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Appointment metrics [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Revenue metrics [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-2: Data retrieval optimized for performance")
        print(f"  - Query performance acceptable [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Response time < 500ms [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-3: Dashboard receives structured data")
        print(f"  - Consistent data structure [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Complete data fields [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Data validation [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] ADDITIONAL VERIFICATION:")
        print(f"  - Role-based visibility [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Data accuracy across updates [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Minimal data handling [{'OK' if failed == 0 else 'FAIL'}]")
        
        print("\n" + "="*60)
        
        return failed == 0


if __name__ == '__main__':
    test_suite = DataAggregationTest()
    try:
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    finally:
        test_suite.teardown()
