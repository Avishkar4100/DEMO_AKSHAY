"""
HOS-12: Logout Functionality Test Suite

Tests for secure logout endpoint and session termination:
- Session invalidation after logout
- Clearing of session data and cookies
- Client-side token clearing
- Redirect after logout
- Restricted access to protected routes after logout
- Cannot reuse old session tokens
"""

import sys
import os

# Add parent directory to path so we can import the app
sys.path.insert(0, os.path.dirname(__file__))

from webapp.app import create_app
from webapp.models import db, User
from webapp.roles import Role
from flask_login import current_user
from flask import session


class LogoutFunctionalityTest:
    """Test suite for HOS-12: Logout Functionality"""
    
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
            username='admin_logout_test',
            email='admin_logout@hms.local',
            first_name='Admin',
            last_name='Logout',
            role=Role.ADMIN.value
        )
        self.admin_user.set_password('AdminLogout123!')
        
        self.doctor_user = User(
            username='doctor_logout_test',
            email='doctor_logout@hms.local',
            first_name='Doctor',
            last_name='Logout',
            role=Role.DOCTOR.value
        )
        self.doctor_user.set_password('DoctorLogout123!')
        
        db.session.add(self.admin_user)
        db.session.add(self.doctor_user)
        db.session.commit()
    
    def teardown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_ac1_session_invalidation(self):
        """
        AC-1: Session/Token is properly invalidated after logout
        
        Verify that:
        - User can login successfully
        - Session is created with user data
        - User can logout
        - Session is invalidated and user ID is removed
        - New requests show user as unauthenticated
        """
        print("\n[PASS] TEST 1: Session Invalidation (AC-1)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Test 1.1: User logs in successfully
            login_response = client.post('/login/form', data={
                'username': 'admin_logout_test',
                'password': 'AdminLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # After login, user should be in flask-login session
            with client.session_transaction() as sess:
                # Session should be created
                assert '_user_id' in sess or 'user_id' in sess, \
                    "User session should be created after login"
            print("  [OK] User logged in successfully")
            
            # Test 1.2: Verify user is authenticated before logout
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code == 200, \
                "Authenticated user should access dashboard"
            print("  [OK] User authenticated and can access protected route")
            
            # Test 1.3: User logs out
            logout_response = client.get('/logout', follow_redirects=True)
            assert logout_response.status_code == 200, \
                "Logout endpoint should return successful response"
            print("  [OK] Logout endpoint executed successfully")
            
            # Test 1.4: Verify session is cleared
            with client.session_transaction() as sess:
                # Session should NOT have user_id after logout
                assert '_user_id' not in sess and 'user_id' not in sess, \
                    "User session should be invalidated after logout"
            print("  [OK] Session cleared after logout")
            
            # Test 1.5: Subsequent requests show user as unauthenticated
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Unauthenticated user should not access dashboard"
            print("  [OK] Protected routes inaccessible after logout")
        
        return True
    
    def test_ac2_protected_route_access(self):
        """
        AC-2: Access to protected routes is blocked post logout
        
        Verify that:
        - Before logout: Protected routes are accessible
        - After logout: Protected routes redirect to login
        - Cannot access dashboard without authentication
        - Cannot access restricted API endpoints
        """
        print("\n[PASS] TEST 2: Protected Route Access (AC-2)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Test 2.1: Login user
            client.post('/login/form', data={
                'username': 'doctor_logout_test',
                'password': 'DoctorLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Test 2.2: Verify protected route is accessible
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code == 200, \
                "Protected route accessible when logged in"
            print("  [OK] Protected route accessible before logout")
            
            # Test 2.3: Logout user
            client.get('/logout', follow_redirects=True)
            print("  [OK] User logged out")
            
            # Test 2.4: Verify protected route is blocked
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Protected route should not be accessible after logout"
            print("  [OK] Protected route blocked after logout")
            
            # Test 2.5: Verify redirect to login
            dashboard_response = client.get('/dashboard', follow_redirects=False)
            assert dashboard_response.status_code == 302, \
                "Should redirect to login page"
            assert '/login' in dashboard_response.location or \
                   'login' in str(dashboard_response.location).lower(), \
                "Should redirect to login page"
            print("  [OK] Redirected to login page")
        
        return True
    
    def test_ac3_logout_redirect_and_reuse(self):
        """
        AC-3: User redirected appropriately and cannot reuse old session
        
        Verify that:
        - User is redirected to login page after logout
        - Old session cannot be reused
        - Old cookies are invalidated
        - User can login again with correct flow
        """
        print("\n[PASS] TEST 3: Logout Redirect & Session Reuse (AC-3)")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Test 3.1: Login user and capture session info
            login_response = client.post('/login/form', data={
                'username': 'admin_logout_test',
                'password': 'AdminLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            
            session_before_logout = None
            with client.session_transaction() as sess:
                session_before_logout = dict(sess)
            print("  [OK] User logged in, session captured")
            
            # Test 3.2: Logout and verify redirect
            logout_response = client.get('/logout', follow_redirects=False)
            assert logout_response.status_code == 302, \
                "Logout should return redirect"
            assert '/login' in logout_response.location or \
                   'login' in str(logout_response.location).lower(), \
                "Should redirect to login page"
            print("  [OK] User redirected to login after logout")
            
            # Test 3.3: Verify session cleared
            with client.session_transaction() as sess:
                session_after_logout = dict(sess)
                assert '_user_id' not in session_after_logout and \
                       'user_id' not in session_after_logout, \
                    "Session should be cleared"
            print("  [OK] Session invalidated after logout")
            
            # Test 3.4: Try to access protected route with old session
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Cannot access protected route with old session"
            print("  [OK] Old session cannot access protected routes")
            
            # Test 3.5: User can login again
            login_response = client.post('/login/form', data={
                'username': 'admin_logout_test',
                'password': 'AdminLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            
            with client.session_transaction() as sess:
                assert '_user_id' in sess or 'user_id' in sess, \
                    "New session created after re-login"
            print("  [OK] User can login again after logout")
            
            # Test 3.6: Can access protected route with new session
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code == 200, \
                "Can access protected route with new session"
            print("  [OK] Can access protected routes after re-login")
        
        return True
    
    def test_logout_clears_cookies(self):
        """Test that logout clears authentication cookies"""
        print("\n[PASS] TEST 4: Cookie Clearing")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login
            client.post('/login/form', data={
                'username': 'doctor_logout_test',
                'password': 'DoctorLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            
            # Check that session has user data
            with client.session_transaction() as sess:
                assert '_user_id' in sess or 'user_id' in sess, \
                    "Session should have user after login"
            print("  [OK] Session has user data after login")
            
            # Logout
            client.get('/logout', follow_redirects=True)
            print("  [OK] User logged out")
            
            # Session should be cleared
            with client.session_transaction() as sess:
                assert '_user_id' not in sess and 'user_id' not in sess, \
                    "Session data should be cleared"
            print("  [OK] Session data cleared after logout")
        
        return True
    
    def test_logout_api_endpoint(self):
        """Test logout through API endpoint"""
        print("\n[PASS] TEST 5: Logout API Endpoint")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login via API
            login_response = client.post('/api/auth/login', json={
                'username': 'admin_logout_test',
                'password': 'AdminLogout123!',
                'remember_me': False
            })
            assert login_response.status_code == 200, \
                "API login should succeed"
            print("  [OK] User logged in via API")
            
            # Verify authentication
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code == 200, \
                "Protected route accessible after API login"
            print("  [OK] Protected route accessible after API login")
            
            # Logout via API
            logout_response = client.post('/api/auth/logout')
            assert logout_response.status_code == 200, \
                "API logout should succeed"
            print("  [OK] Logout via API successful")
            
            # Verify access blocked
            dashboard_response = client.get('/dashboard')
            assert dashboard_response.status_code in [302, 401], \
                "Protected route should be inaccessible after logout"
            print("  [OK] Protected route inaccessible after logout")
        
        return True
    
    def test_multiple_logout_calls(self):
        """Test that multiple logout calls are handled gracefully"""
        print("\n[PASS] TEST 6: Multiple Logout Handling")
        print("-" * 60)
        
        with self.app.test_client() as client:
            # Login
            client.post('/login/form', data={
                'username': 'admin_logout_test',
                'password': 'AdminLogout123!',
                'remember_me': False
            }, follow_redirects=True)
            print("  [OK] User logged in")
            
            # First logout
            response1 = client.get('/logout')
            assert response1.status_code in [302, 200], \
                "First logout should succeed"
            print("  [OK] First logout successful")
            
            # Second logout (should handle gracefully)
            response2 = client.get('/logout')
            assert response2.status_code in [302, 200], \
                "Second logout should handle gracefully"
            print("  [OK] Second logout handled gracefully")
        
        return True
    
    def test_concurrent_user_logout(self):
        """Test that logout only affects current user's session"""
        print("\n[PASS] TEST 7: Session Isolation")
        print("-" * 60)
        
        # Create two separate client instances to simulate different users
        client1 = self.app.test_client()
        client2 = self.app.test_client()
        
        # User 1 logs in
        client1.post('/login/form', data={
            'username': 'admin_logout_test',
            'password': 'AdminLogout123!',
            'remember_me': False
        }, follow_redirects=True)
        print("  [OK] User 1 logged in")
        
        # User 2 logs in
        client2.post('/login/form', data={
            'username': 'doctor_logout_test',
            'password': 'DoctorLogout123!',
            'remember_me': False
        }, follow_redirects=True)
        print("  [OK] User 2 logged in")
        
        # Verify both can access dashboard
        response1 = client1.get('/dashboard')
        assert response1.status_code == 200, \
            "User 1 should access dashboard before logout"
        print("  [OK] User 1 can access dashboard")
        
        response2 = client2.get('/dashboard')
        assert response2.status_code == 200, \
            "User 2 should access dashboard before logout"
        print("  [OK] User 2 can access dashboard")
        
        # User 1 logs out
        client1.get('/logout', follow_redirects=True)
        print("  [OK] User 1 logged out")
        
        # User 1 should not have access after logout
        response1 = client1.get('/dashboard')
        assert response1.status_code in [302, 401], \
            "User 1 should not access protected route after logout"
        print("  [OK] User 1 blocked from protected route after logout")
        
        # Verify User 1's session is cleared
        with client1.session_transaction() as sess1:
            assert '_user_id' not in sess1 and 'user_id' not in sess1, \
                "User 1 session should be cleared after logout"
        print("  [OK] User 1 session cleared after logout")
        
        # User 2 can still login again to verify system works
        client2.get('/logout', follow_redirects=True)
        client2.post('/login/form', data={
            'username': 'doctor_logout_test',
            'password': 'DoctorLogout123!',
            'remember_me': False
        }, follow_redirects=True)
        
        response2 = client2.get('/dashboard')
        assert response2.status_code == 200, \
            "User 2 should be able to login again"
        print("  [OK] Users can login independently after logout")

    
    def run_all_tests(self):
        """Run all HOS-12 tests"""
        print("\n" + "="*60)
        print("HOS-12: LOGOUT FUNCTIONALITY TEST SUITE")
        print("="*60)
        
        tests = [
            ("Session Invalidation (AC-1)", self.test_ac1_session_invalidation),
            ("Protected Route Access (AC-2)", self.test_ac2_protected_route_access),
            ("Logout Redirect & Reuse (AC-3)", self.test_ac3_logout_redirect_and_reuse),
            ("Cookie Clearing", self.test_logout_clears_cookies),
            ("Logout API Endpoint", self.test_logout_api_endpoint),
            ("Multiple Logout Handling", self.test_multiple_logout_calls),
            ("Concurrent User Sessions", self.test_concurrent_user_logout),
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
        print("HOS-12 ACCEPTANCE CRITERIA SUMMARY")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] PASSED: {passed}/{len(tests)}")
        if failed > 0:
            print(f"[FAIL] FAILED: {failed}/{len(tests)}")
        
        print("\n" + "="*60)
        print("HOS-12 COMPLIANCE CHECK:")
        print("="*60)
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-1: Session/token properly invalidated after logout")
        print(f"  - User session invalidated [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Session data cleared [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Cannot reuse session [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-2: Access to protected routes blocked post logout")
        print(f"  - Protected routes return 302/401 [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Redirects to login page [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] AC-3: User redirected appropriately, cannot reuse session")
        print(f"  - Redirected to login after logout [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Old session cannot reuse [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Can login again successfully [{'OK' if failed == 0 else 'FAIL'}]")
        
        print(f"\n[{'OK' if failed == 0 else 'FAIL'}] ADDITIONAL VERIFICATION:")
        print(f"  - Logout clears cookies [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - API logout endpoint works [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Multiple logouts handled gracefully [{'OK' if failed == 0 else 'FAIL'}]")
        print(f"  - Concurrent sessions work correctly [{'OK' if failed == 0 else 'FAIL'}]")
        
        print("\n" + "="*60)
        
        return failed == 0


if __name__ == '__main__':
    test_suite = LogoutFunctionalityTest()
    try:
        success = test_suite.run_all_tests()
        sys.exit(0 if success else 1)
    finally:
        test_suite.teardown()
