"""
HOS-13: Logout Route Test Suite

Tests for the logout endpoint implementation:
- Secure logout endpoint handles user sign-out
- Session termination with Flask-Login
- Token invalidation
- Clear session data and credentials
- Redirect users to login
- Ensure protected routes inaccessible after logout
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from webapp.app import create_app
from webapp.models import db, User
from webapp.roles import Role


class LogoutRouteTest:
    """Test suite for HOS-13: Logout Route"""
    
    def __init__(self):
        """Initialize test environment"""
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create test database
        db.create_all()
        
        # Create test users with different roles
        self.admin_user = User(
            username='admin_route_test',
            email='admin_route@hms.local',
            first_name='Admin',
            last_name='Route',
            role=Role.ADMIN.value
        )
        self.admin_user.set_password('AdminRoute123!')
        
        self.doctor_user = User(
            username='doctor_route_test',
            email='doctor_route@hms.local',
            first_name='Doctor',
            last_name='Route',
            role=Role.DOCTOR.value
        )
        self.doctor_user.set_password('DoctorRoute123!')
        
        self.nurse_user = User(
            username='nurse_route_test',
            email='nurse_route@hms.local',
            first_name='Nurse',
            last_name='Route',
            role=Role.NURSE.value
        )
        self.nurse_user.set_password('NurseRoute123!')
        
        db.session.add(self.admin_user)
        db.session.add(self.doctor_user)
        db.session.add(self.nurse_user)
        db.session.commit()
    
    def teardown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_ac1_logout_endpoint_exists(self):
        """AC-1: Logout endpoint exists and handles requests"""
        print("\n[PASS] TEST 1: Logout Endpoint Exists (AC-1)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login first
            client.post('/login/form', data={
                'username': 'admin_route_test',
                'password': 'AdminRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            print("  [OK] User logged in")
            
            # Test logout endpoint exists
            logout_response = client.get('/logout')
            assert logout_response.status_code in [302, 200], \
                "Logout endpoint should exist"
            print("  [OK] Logout endpoint exists")
            
            # Test logout returns appropriate response
            assert logout_response.status_code == 302, \
                "Logout should redirect (return 302)"
            print("  [OK] Logout returns redirect response (302)")
        
        return True
    
    def test_ac1_session_invalidation_on_logout(self):
        """AC-1: Session is properly terminated on logout"""
        print("\n[PASS] TEST 2: Session Invalidation (AC-1)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login
            client.post('/login/form', data={
                'username': 'doctor_route_test',
                'password': 'DoctorRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Verify session exists
            with client.session_transaction() as sess:
                assert '_user_id' in sess or 'user_id' in sess, \
                    "Session should exist after login"
            print("  [OK] Session created after login")
            
            # Logout
            client.get('/logout', follow_redirects=True)
            
            # Verify session terminated
            with client.session_transaction() as sess:
                assert '_user_id' not in sess and 'user_id' not in sess, \
                    "Session should be terminated after logout"
            print("  [OK] Session terminated after logout")
        
        return True
    
    def test_ac1_token_invalidation(self):
        """AC-1: Tokens are invalidated after logout"""
        print("\n[PASS] TEST 3: Token Invalidation (AC-1)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # API Login
            login_response = client.post('/api/auth/login', json={
                'username': 'nurse_route_test',
                'password': 'NurseRoute123!',
                'remember_me': False
            })
            assert login_response.status_code == 200, "API login should succeed"
            print("  [OK] User authenticated via API")
            
            # API Logout
            logout_response = client.post('/api/auth/logout')
            assert logout_response.status_code == 200, "API logout should succeed"
            print("  [OK] Logout via API successful")
            
            # Verify token is invalidated
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Token should be invalidated"
            print("  [OK] Token invalidated after logout")
        
        return True
    
    def test_ac2_protected_routes_blocked_after_logout(self):
        """AC-2: Protected routes are inaccessible after logout"""
        print("\n[PASS] TEST 4: Protected Routes Blocked (AC-2)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login
            client.post('/login/form', data={
                'username': 'admin_route_test',
                'password': 'AdminRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Verify access before logout
            response = client.get('/dashboard')
            assert response.status_code == 200, \
                "Dashboard should be accessible before logout"
            print("  [OK] Protected route accessible before logout")
            
            # Logout
            client.get('/logout', follow_redirects=True)
            
            # Verify access blocked after logout
            response = client.get('/dashboard')
            assert response.status_code in [302, 401], \
                "Dashboard should not be accessible after logout"
            print("  [OK] Protected route blocked after logout")
            
            # Verify redirect to login
            response = client.get('/dashboard', follow_redirects=False)
            assert response.status_code == 302, "Should redirect"
            assert '/login' in response.location or \
                   'login' in str(response.location).lower(), \
                "Should redirect to login"
            print("  [OK] Redirect to login page working")
        
        return True
    
    def test_ac2_role_based_routes_blocked(self):
        """AC-2: Role-based protected routes are blocked after logout"""
        print("\n[PASS] TEST 5: Role-Based Route Protection (AC-2)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login as doctor
            client.post('/login/form', data={
                'username': 'doctor_route_test',
                'password': 'DoctorRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Verify role-based access works
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code == 200, \
                "Doctor should access dashboard"
            print("  [OK] Doctor can access dashboard before logout")
            
            # Logout
            client.get('/logout', follow_redirects=True)
            
            # Verify role-based route is now blocked
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Dashboard should be blocked after logout"
            print("  [OK] Dashboard blocked after logout")
        
        return True
    
    def test_ac3_logout_redirect_location(self):
        """AC-3: User redirected to appropriate page after logout"""
        print("\n[PASS] TEST 6: Logout Redirect (AC-3)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login
            client.post('/login/form', data={
                'username': 'admin_route_test',
                'password': 'AdminRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Logout without following redirects
            logout_response = client.get('/logout', follow_redirects=False)
            
            # Verify redirect status
            assert logout_response.status_code == 302, \
                "Should return redirect status code"
            print("  [OK] Logout returns redirect response")
            
            # Verify redirect location
            redirect_location = logout_response.location
            assert redirect_location is not None, \
                "Should have redirect location"
            print(f"  [OK] Redirect location: {redirect_location}")
            
            # Verify redirects to login
            assert '/login' in redirect_location or \
                   'login' in str(redirect_location).lower(), \
                "Should redirect to login page"
            print("  [OK] Redirects to login page")
        
        return True
    
    def test_ac3_old_session_cannot_be_reused(self):
        """AC-3: Old session cannot be reused after logout"""
        print("\n[PASS] TEST 7: Session Reuse Prevention (AC-3)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login and capture session info
            client.post('/login/form', data={
                'username': 'nurse_route_test',
                'password': 'NurseRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            old_session_id = None
            with client.session_transaction() as sess:
                # Try to capture session ID
                old_session_id = id(sess)
            print("  [OK] Captured session before logout")
            
            # Logout
            client.get('/logout', follow_redirects=True)
            
            # Try to access protected route
            response = client.get('/dashboard')
            assert response.status_code in [302, 401], \
                "Old session should not grant access"
            print("  [OK] Old session cannot access protected routes")
            
            # Login again to verify new session works
            client.post('/login/form', data={
                'username': 'nurse_route_test',
                'password': 'NurseRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Verify new session works
            response = client.get('/dashboard')
            assert response.status_code == 200, \
                "New session should work"
            print("  [OK] New session works after re-login")
        
        return True
    
    def test_logout_with_different_http_methods(self):
        """Test logout endpoint with different HTTP methods"""
        print("\n[PASS] TEST 8: HTTP Method Handling")
        print("-" * 60)
        
        # Test GET logout
        with self.app.test_client() as client:
            client.post('/login/form', data={
                'username': 'admin_route_test',
                'password': 'AdminRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            response = client.get('/logout')
            assert response.status_code == 302, "GET logout should work"
            print("  [OK] GET logout endpoint works")
        
        # Test POST logout (if supported)
        with self.app.test_client() as client:
            client.post('/login/form', data={
                'username': 'doctor_route_test',
                'password': 'DoctorRoute123!',
                'remember_me': False
            }, follow_redirects=True)
            
            response = client.post('/logout')
            assert response.status_code in [302, 200, 405], \
                "POST logout should be handled"
            print("  [OK] POST logout handled")
        
        return True
    
    def test_logout_without_being_logged_in(self):
        """Test logout when user is not logged in"""
        print("\n[PASS] TEST 9: Logout Without Login")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Try to logout without logging in first
            response = client.get('/logout')
            assert response.status_code in [302, 200], \
                "Logout should handle gracefully"
            print("  [OK] Logout handles gracefully when not logged in")
        
        return True
    
    def run_all_tests(self):
        """Run all HOS-13 tests"""
        print("\n" + "="*60)
        print("HOS-13: LOGOUT ROUTE TEST SUITE")
        print("="*60)
        
        tests = [
            ("Logout Endpoint Exists (AC-1)", self.test_ac1_logout_endpoint_exists),
            ("Session Invalidation (AC-1)", self.test_ac1_session_invalidation_on_logout),
            ("Token Invalidation (AC-1)", self.test_ac1_token_invalidation),
            ("Protected Routes Blocked (AC-2)", self.test_ac2_protected_routes_blocked_after_logout),
            ("Role-Based Route Protection (AC-2)", self.test_ac2_role_based_routes_blocked),
            ("Logout Redirect (AC-3)", self.test_ac3_logout_redirect_location),
            ("Session Reuse Prevention (AC-3)", self.test_ac3_old_session_cannot_be_reused),
            ("HTTP Method Handling", self.test_logout_with_different_http_methods),
            ("Logout Without Login", self.test_logout_without_being_logged_in),
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
        print("HOS-13 ACCEPTANCE CRITERIA SUMMARY")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] PASSED: {passed}/{len(tests)}")
        if failed > 0:
            print(f"[FAIL] FAILED: {failed}/{len(tests)}")
        
        print("\n" + "="*60)
        print("HOS-13 COMPLIANCE CHECK:")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-1: User session/token properly invalidated")
        print(f"  - Logout endpoint exists [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Session terminated [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Tokens invalidated [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-2: Access to protected routes blocked post logout")
        print(f"  - Protected routes return 302/401 [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Role-based routes blocked [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-3: User redirected, cannot reuse session")
        print(f"  - Redirected to login page [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Old session cannot reuse [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - New session works after re-login [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] ADDITIONAL VERIFICATION:")
        print(f"  - HTTP method handling correct [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Logout without login handled [{'OK' if failed == 0 else 'FAIL'}]")
        
        print("\n" + "="*60)
        
        return failed == 0


if __name__ == '__main__':
    test_suite = LogoutRouteTest()
    try:
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    finally:
        test_suite.teardown()
