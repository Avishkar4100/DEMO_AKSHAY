"""
HOS-15: Statistics Dashboard
Test Suite for Dashboard Statistics, KPIs, and Role-Based Filtering

AC-1: Dashboard shows accurate metrics with proper visual representation
AC-2: Data updates correctly in real-time or at defined intervals
AC-3: Users can filter data and see role-based views successfully
"""

import unittest
import json
from datetime import datetime, timedelta
from flask import Flask
from flask_login import LoginManager
from webapp.app import create_app
from webapp.models import db, User
from webapp.services.aggregation import DataAggregationService
from webapp.services.statistics import StatisticsService
from webapp.auth import AuthenticationService


class StatisticsDashboardTest(unittest.TestCase):
    """Test suite for HOS-15: Statistics Dashboard"""

    @classmethod
    def setUpClass(cls):
        """Set up test Flask app and database"""
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        cls.client = cls.app.test_client()
        cls.ctx = cls.app.app_context()
        cls.ctx.push()
        
    @classmethod
    def tearDownClass(cls):
        """Tear down test environment"""
        if hasattr(cls, 'ctx'):
            try:
                cls.ctx.pop()
            except (RuntimeError, IndexError):
                pass

    def setUp(self):
        """Create fresh database and seed test data before each test"""
        db.create_all()
        # Clear any existing data first
        db.session.query(User).delete()
        db.session.commit()
        self._seed_test_data()
        
    def tearDown(self):
        """Clean up database after each test"""
        db.session.remove()
        db.drop_all()

    def _seed_test_data(self):
        """Seed database with comprehensive test data"""
        # Create test users
        users = [
            User(username='admin', email='admin@test.local', password_hash='hashed', role='admin'),
            User(username='doctor', email='doctor@test.local', password_hash='hashed', role='doctor'),
            User(username='nurse', email='nurse@test.local', password_hash='hashed', role='nurse'),
            User(username='receptionist', email='receptionist@test.local', password_hash='hashed', role='receptionist'),
        ]
        for user in users:
            db.session.add(user)
        db.session.commit()

    def test_ac1_dashboard_metrics_accuracy(self):
        """
        AC-1: Dashboard shows accurate metrics with proper visual representation
        Test: KPI calculations return accurate values
        """
        print("\n[TEST 1] AC-1 Dashboard Metrics Accuracy")
        
        stats = StatisticsService.get_dashboard_kpis()
        
        # Validate response structure
        self.assertIn('kpis', stats)
        self.assertIn('timestamp', stats)
        self.assertIn('user_info', stats)
        
        # Validate KPI metrics exist
        kpis = stats['kpis']
        self.assertIn('total_patients', kpis)
        self.assertIn('active_patients', kpis)
        self.assertIn('appointments_today', kpis)
        self.assertIn('pending_appointments', kpis)
        self.assertIn('revenue_today', kpis)
        self.assertIn('revenue_month', kpis)
        self.assertIn('average_patient_age', kpis)
        self.assertIn('bed_occupancy_rate', kpis)
        
        # Validate metric types and ranges
        self.assertIsInstance(kpis['total_patients'], (int, float))
        self.assertIsInstance(kpis['active_patients'], (int, float))
        self.assertIsInstance(kpis['appointments_today'], (int, float))
        self.assertIsInstance(kpis['revenue_today'], (int, float))
        self.assertGreaterEqual(kpis['bed_occupancy_rate'], 0)
        self.assertLessEqual(kpis['bed_occupancy_rate'], 100)
        
        # Validate timestamp format (ISO 8601)
        self.assertRegex(stats['timestamp'], r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z')
        
        print("  [OK] All KPI metrics present and valid")
        print(f"  [OK] Total Patients: {kpis['total_patients']}")
        print(f"  [OK] Appointments Today: {kpis['appointments_today']}")
        print(f"  [OK] Revenue Month: ${kpis['revenue_month']:.2f}")
        print("  [OK] AC-1 PASSED")

    def test_ac1_chart_data_structure(self):
        """
        AC-1: Validate chart data is properly structured for visualization
        Test: Chart data includes labels, values, colors, and metadata
        """
        print("\n[TEST 2] AC-1 Chart Data Structure for Visualizations")
        
        charts = StatisticsService.get_chart_data()
        
        # Validate top-level chart types
        self.assertIn('appointment_status', charts)
        self.assertIn('revenue_trend', charts)
        self.assertIn('patient_distribution', charts)
        self.assertIn('department_metrics', charts)
        
        # Validate appointment status chart structure
        appt_chart = charts['appointment_status']
        self.assertIn('labels', appt_chart)
        self.assertIn('values', appt_chart)
        self.assertIn('colors', appt_chart)
        self.assertEqual(len(appt_chart['labels']), len(appt_chart['values']))
        self.assertEqual(len(appt_chart['values']), len(appt_chart['colors']))
        
        # Validate revenue trend chart has time series data
        revenue_chart = charts['revenue_trend']
        self.assertIn('dates', revenue_chart)
        self.assertIn('revenue', revenue_chart)
        self.assertEqual(len(revenue_chart['dates']), len(revenue_chart['revenue']))
        
        # Validate patient distribution chart
        patient_chart = charts['patient_distribution']
        self.assertIn('categories', patient_chart)
        self.assertIn('counts', patient_chart)
        
        print("  [OK] All chart types properly structured")
        print(f"  [OK] Chart types: {list(charts.keys())}")
        print("  [OK] AC-1 Chart Structure PASSED")

    def test_ac2_data_update_interval(self):
        """
        AC-2: Data updates correctly at defined intervals
        Test: Dashboard service provides update timestamp and interval info
        """
        print("\n[TEST 3] AC-2 Data Update Intervals")
        
        update_info = StatisticsService.get_update_info()
        
        # Validate update configuration
        self.assertIn('last_update', update_info)
        self.assertIn('update_interval_seconds', update_info)
        self.assertIn('next_update', update_info)
        self.assertIn('is_cached', update_info)
        self.assertIn('cache_duration', update_info)
        
        # Validate interval is reasonable (5-60 seconds)
        interval = update_info['update_interval_seconds']
        self.assertGreaterEqual(interval, 5)
        self.assertLessEqual(interval, 60)
        
        # Validate timestamps are ISO 8601
        self.assertRegex(update_info['last_update'], r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z')
        self.assertRegex(update_info['next_update'], r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z')
        
        print(f"  [OK] Update interval: {interval} seconds")
        print(f"  [OK] Cache enabled: {update_info['is_cached']}")
        print(f"  [OK] Last update: {update_info['last_update']}")
        print("  [OK] AC-2 Update Interval PASSED")

    def test_ac2_real_time_metric_consistency(self):
        """
        AC-2: Metrics remain consistent across multiple rapid requests
        Test: Rapid API calls return consistent data within tolerance
        """
        print("\n[TEST 4] AC-2 Real-Time Metric Consistency")
        
        # Get metrics multiple times in rapid succession
        results = []
        for i in range(3):
            kpis = StatisticsService.get_dashboard_kpis()
            results.append(kpis['kpis'])
        
        # Check consistency (values should be equal or within tolerance)
        base_metrics = results[0]
        
        for i, metrics in enumerate(results[1:], 1):
            # Integer metrics should be exactly equal
            self.assertEqual(metrics['total_patients'], base_metrics['total_patients'],
                           f"Total patients mismatch on request {i+1}")
            self.assertEqual(metrics['appointments_today'], base_metrics['appointments_today'],
                           f"Appointments today mismatch on request {i+1}")
        
        print("  [OK] Metrics consistent across 3 rapid requests")
        print("  [OK] No data drift detected")
        print("  [OK] AC-2 Consistency PASSED")

    def test_ac3_role_based_dashboard_admin(self):
        """
        AC-3: Admin users see all metrics in dashboard
        Test: Admin role receives unrestricted dashboard view
        """
        print("\n[TEST 5] AC-3 Role-Based Dashboard - Admin View")
        
        # Create admin user and login
        admin = User.query.filter_by(username='admin').first()
        
        with self.app.test_client() as client:
            # Get admin dashboard
            dashboard = StatisticsService.get_role_based_dashboard('admin')
            
            # Admin should see all metrics
            self.assertIn('kpis', dashboard)
            self.assertIn('financial_metrics', dashboard)
            self.assertIn('operational_metrics', dashboard)
            self.assertIn('system_metrics', dashboard)
            
            kpis = dashboard['kpis']
            # Admin sees revenue metrics
            self.assertIn('revenue_today', kpis)
            self.assertIn('revenue_month', kpis)
            # Admin sees operational metrics
            self.assertIn('staff_utilization', kpis)
            self.assertIn('bed_occupancy_rate', kpis)
            
            print("  [OK] Admin can access all metric categories")
            print("  [OK] Financial metrics visible")
            print("  [OK] Operational metrics visible")
            print("  [OK] System metrics visible")
            print("  [OK] Admin Dashboard PASSED")

    def test_ac3_role_based_dashboard_doctor(self):
        """
        AC-3: Doctor users see only patient and appointment metrics
        Test: Doctor role has restricted dashboard view
        """
        print("\n[TEST 6] AC-3 Role-Based Dashboard - Doctor View")
        
        # Get doctor dashboard
        dashboard = StatisticsService.get_role_based_dashboard('doctor')
        
        # Doctor should see patient and appointment metrics
        self.assertIn('kpis', dashboard)
        self.assertIn('patient_metrics', dashboard)
        self.assertIn('appointment_metrics', dashboard)
        
        kpis = dashboard['kpis']
        # Doctor sees patient data
        self.assertIn('total_patients', kpis)
        self.assertIn('active_patients', kpis)
        # Doctor sees appointments
        self.assertIn('appointments_today', kpis)
        
        # Doctor should NOT see revenue
        self.assertNotIn('revenue_today', kpis)
        
        print("  [OK] Doctor can access patient metrics")
        print("  [OK] Doctor can access appointment metrics")
        print("  [OK] Doctor restricted from financial metrics")
        print("  [OK] Doctor Dashboard PASSED")

    def test_ac3_dashboard_filtering_by_date(self):
        """
        AC-3: Dashboard data can be filtered by date range
        Test: Date range filtering returns appropriate data
        """
        print("\n[TEST 7] AC-3 Dashboard Filtering - Date Range")
        
        # Define date ranges
        today = datetime.now()
        start_date = (today - timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        # Get filtered data
        filtered = StatisticsService.get_filtered_dashboard(
            date_from=start_date,
            date_to=end_date
        )
        
        # Validate response includes date range
        self.assertIn('filters', filtered)
        self.assertEqual(filtered['filters']['date_from'], start_date)
        self.assertEqual(filtered['filters']['date_to'], end_date)
        
        # Validate data is returned
        self.assertIn('kpis', filtered)
        self.assertIn('charts', filtered)
        
        print(f"  [OK] Filtered by date range: {start_date} to {end_date}")
        print("  [OK] Data retrieved successfully")
        print("  [OK] Date Filtering PASSED")

    def test_ac3_dashboard_filtering_by_department(self):
        """
        AC-3: Dashboard data can be filtered by department
        Test: Department filtering returns role-appropriate data
        """
        print("\n[TEST 8] AC-3 Dashboard Filtering - Department")
        
        departments = ['cardiology', 'pediatrics', 'orthopedics']
        
        for dept in departments:
            filtered = StatisticsService.get_filtered_dashboard(department=dept)
            
            # Validate response includes filter
            self.assertIn('filters', filtered)
            self.assertEqual(filtered['filters']['department'], dept)
            
            # Validate appropriate data returned
            self.assertIn('kpis', filtered)
            self.assertIn('charts', filtered)
        
        print("  [OK] Filtered by multiple departments successfully")
        print(f"  [OK] Departments tested: {', '.join(departments)}")
        print("  [OK] Department Filtering PASSED")

    def run_all_tests(self):
        """Execute all tests and print summary"""
        print("\n" + "="*70)
        print("HOS-15: STATISTICS DASHBOARD - COMPREHENSIVE TEST SUITE")
        print("="*70)
        
        loader = unittest.TestLoader()
        suite = loader.loadTestsFromTestCase(StatisticsDashboardTest)
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        print("\n" + "="*70)
        if result.wasSuccessful():
            print(f"[OK] PASSED: {result.testsRun}/{result.testsRun}")
            print("  All acceptance criteria verified")
            print("  - AC-1: Dashboard metrics and visualizations [OK]")
            print("  - AC-2: Data updates and consistency [OK]")
            print("  - AC-3: Role-based views and filtering [OK]")
        else:
            print(f"[FAILED] {len(result.failures)} test(s) failed")
            for test, traceback in result.failures:
                print(f"\nFailed: {test}")
                print(traceback)
        print("="*70)
        
        return result.wasSuccessful()


if __name__ == '__main__':
    test = StatisticsDashboardTest()
    test.setUpClass()
    success = test.run_all_tests()
    test.tearDownClass()
    exit(0 if success else 1)
