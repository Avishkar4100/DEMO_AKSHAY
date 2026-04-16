"""
Seed Demo Users for HMS - HOS-9
Creates sample users for each role with secure, documented credentials.

Usage:
    python seed_demo_users.py              # Create demo users in development database
    python seed_demo_users.py --reset      # Delete and recreate demo users
    python seed_demo_users.py --clear      # Delete demo users only
    python seed_demo_users.py --verify     # Test login for all demo users

Demo Users Created:
    - admin@hms.local (Password: Admin@12345)      - ADMIN role, all permissions
    - doctor@hms.local (Password: Doctor@12345)    - DOCTOR role, medical access
    - nurse@hms.local (Password: Nurse@12345)      - NURSE role, support functions
    - receptionist@hms.local (Password: Recep@12345) - RECEPTIONIST role, appointments

Note: For production, use environment variables or secure credential management.
"""

import sys
import os
import argparse

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from webapp.app import create_app
from webapp.models import db, User
from webapp.roles import Role
from webapp.auth import AuthenticationService


# Demo user definitions with secure passwords
DEMO_USERS = {
    "admin@hms.local": {
        "username": "admin",
        "email": "admin@hms.local",
        "password": "Admin@12345",
        "first_name": "System",
        "last_name": "Administrator",
        "role": Role.ADMIN,
        "description": "System Administrator - Full access to all features"
    },
    "doctor@hms.local": {
        "username": "doctor",
        "email": "doctor@hms.local",
        "password": "Doctor@12345",
        "first_name": "John",
        "last_name": "Smith",
        "role": Role.DOCTOR,
        "description": "Medical Doctor - Access to patient records and medical functions"
    },
    "nurse@hms.local": {
        "username": "nurse",
        "email": "nurse@hms.local",
        "password": "Nurse@12345",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "role": Role.NURSE,
        "description": "Nurse Assistant - Assists with patient care and medical documentation"
    },
    "receptionist@hms.local": {
        "username": "receptionist",
        "email": "receptionist@hms.local",
        "password": "Recep@12345",
        "first_name": "Emma",
        "last_name": "Williams",
        "role": Role.RECEPTIONIST,
        "description": "Front Desk Receptionist - Manages appointments and patient registration"
    }
}


class DemoUserSeeder:
    """Management utility for demo users"""
    
    def __init__(self, app_env='development'):
        """Initialize seeder with Flask app context"""
        self.app = create_app(app_env)
        self.app_context = self.app.app_context()
        self.app_context.push()
        
    def cleanup(self):
        """Cleanup app context"""
        self.app_context.pop()
    
    def delete_demo_users(self):
        """Delete all demo users from database"""
        print("\n" + "="*60)
        print("DELETING DEMO USERS")
        print("="*60)
        
        deleted_count = 0
        for email, user_data in DEMO_USERS.items():
            user = User.query.filter_by(email=email).first()
            if user:
                db.session.delete(user)
                deleted_count += 1
                print(f"✓ Deleted: {email}")
        
        if deleted_count > 0:
            db.session.commit()
            print(f"\n✓ Total deleted: {deleted_count} users")
        else:
            print("\n✓ No demo users to delete")
        
        return deleted_count
    
    def create_demo_users(self):
        """Create demo users in database"""
        print("\n" + "="*60)
        print("CREATING DEMO USERS")
        print("="*60)
        
        created_count = 0
        updated_count = 0
        errors = []
        
        for email, user_data in DEMO_USERS.items():
            try:
                # Check if user already exists
                user = User.query.filter_by(email=email).first()
                
                if user:
                    # Update existing user
                    user.username = user_data['username']
                    user.first_name = user_data['first_name']
                    user.last_name = user_data['last_name']
                    user.set_password(user_data['password'])
                    user.set_role(user_data['role'])
                    user.is_active = True
                    updated_count += 1
                    status = "UPDATED"
                else:
                    # Create new user
                    user = User(
                        username=user_data['username'],
                        email=email,
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        is_active=True
                    )
                    user.set_password(user_data['password'])
                    user.set_role(user_data['role'])
                    db.session.add(user)
                    created_count += 1
                    status = "CREATED"
                
                print(f"\n✓ {status}: {email}")
                print(f"  Role: {user_data['role'].name}")
                print(f"  Name: {user_data['first_name']} {user_data['last_name']}")
                print(f"  Password: {user_data['password']}")
                
            except Exception as e:
                error_msg = f"✗ ERROR creating {email}: {str(e)}"
                errors.append(error_msg)
                print(f"\n{error_msg}")
        
        # Commit all changes
        try:
            db.session.commit()
            print("\n" + "="*60)
            print("✓ SUMMARY")
            print("="*60)
            print(f"✓ Created: {created_count} users")
            print(f"✓ Updated: {updated_count} users")
            
            if errors:
                print(f"✗ Errors: {len(errors)}")
                for error in errors:
                    print(f"  {error}")
            
            return (created_count + updated_count) > 0
        
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ DATABASE ERROR: {str(e)}")
            return False
    
    def verify_demo_users(self):
        """Verify that demo users can login with correct credentials"""
        print("\n" + "="*60)
        print("VERIFYING DEMO USER CREDENTIALS")
        print("="*60)
        
        verified_count = 0
        failed_count = 0
        
        for email, user_data in DEMO_USERS.items():
            try:
                # Attempt credential validation (returns boolean)
                is_valid = AuthenticationService.validate_credentials(
                    username=user_data['username'],
                    password=user_data['password']
                )
                
                if is_valid:
                    verified_count += 1
                    user = User.query.filter_by(email=email).first()
                    print(f"\n✓ VERIFIED: {email}")
                    print(f"  Username: {user_data['username']}")
                    print(f"  Role: {user.get_role().name}")
                    print(f"  Login: SUCCESS")
                else:
                    failed_count += 1
                    print(f"\n✗ FAILED: {email}")
                    print(f"  Username: {user_data['username']}")
                    print(f"  Error: Invalid credentials")
            
            except Exception as e:
                failed_count += 1
                print(f"\n✗ ERROR verifying {email}: {str(e)}")
        
        print("\n" + "="*60)
        print("✓ VERIFICATION SUMMARY")
        print("="*60)
        print(f"✓ Verified: {verified_count}/{len(DEMO_USERS)}")
        if failed_count > 0:
            print(f"✗ Failed: {failed_count}/{len(DEMO_USERS)}")
        else:
            print("✓ All demo users verified successfully!")
        
        return failed_count == 0
    
    def get_demo_users_info(self):
        """Get information about current demo users"""
        print("\n" + "="*60)
        print("DEMO USERS INFORMATION")
        print("="*60)
        
        for email, user_data in DEMO_USERS.items():
            user = User.query.filter_by(email=email).first()
            status = "EXISTS" if user else "NOT FOUND"
            
            print(f"\n{status}: {email}")
            print(f"  Username: {user_data['username']}")
            print(f"  Password: {user_data['password']}")
            print(f"  Role: {user_data['role'].name}")
            print(f"  Name: {user_data['first_name']} {user_data['last_name']}")
            print(f"  Description: {user_data['description']}")
            
            if user and user.is_active:
                print(f"  Status: ACTIVE")
            elif user:
                print(f"  Status: INACTIVE")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Seed demo users for HMS system"
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Delete and recreate demo users'
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Delete demo users only'
    )
    parser.add_argument(
        '--verify',
        action='store_true',
        help='Verify demo user credentials'
    )
    parser.add_argument(
        '--info',
        action='store_true',
        help='Show info about demo users'
    )
    parser.add_argument(
        '--env',
        default='development',
        choices=['development', 'testing', 'production'],
        help='App environment'
    )
    
    args = parser.parse_args()
    
    seeder = DemoUserSeeder(args.env)
    
    try:
        if args.clear:
            seeder.delete_demo_users()
        
        elif args.reset:
            seeder.delete_demo_users()
            seeder.create_demo_users()
        
        elif args.verify:
            seeder.verify_demo_users()
        
        elif args.info:
            seeder.get_demo_users_info()
        
        else:
            # Default: create demo users
            seeder.create_demo_users()
            print("\n" + "="*60)
            print("NEXT STEPS")
            print("="*60)
            print("1. Verify credentials: python seed_demo_users.py --verify")
            print("2. View details: python seed_demo_users.py --info")
            print("3. Reset users: python seed_demo_users.py --reset")
            print("4. Check DEMO_CREDENTIALS.md for full documentation")
    
    finally:
        seeder.cleanup()


if __name__ == "__main__":
    sys.exit(0 if main() is None else 1)
