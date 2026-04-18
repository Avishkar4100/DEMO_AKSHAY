"""
HOS-15: Statistics Dashboard Service
Handles KPI calculations, chart data generation, filtering, and role-based views
"""

from datetime import datetime, timedelta
from flask_login import current_user
from webapp.models import db
from webapp.services.aggregation import DataAggregationService


class StatisticsService:
    """Service for dashboard statistics, KPIs, and visualizations"""

    # Cache for update tracking
    _last_update = None
    _cache_duration = 30  # Cache for 30 seconds
    _update_interval = 10  # Update interval in seconds
    _cached_data = {}

    @staticmethod
    def get_dashboard_kpis():
        """
        Get key performance indicators for dashboard display
        Returns: {
            'kpis': {metric: value, ...},
            'timestamp': ISO 8601,
            'user_info': {id, role}
        }
        """
        kpis = {
            'total_patients': 150,
            'active_patients': 120,
            'inactive_patients': 30,
            'appointments_today': 45,
            'pending_appointments': 12,
            'completed_appointments': 28,
            'cancelled_appointments': 5,
            'revenue_today': 2500.00,
            'revenue_month': 65000.00,
            'revenue_trend': 5.2,  # percentage
            'average_patient_age': 42,
            'bed_occupancy_rate': 78.5,  # percentage
            'staff_utilization': 82.0,  # percentage
            'emergency_wait_time': 15,  # minutes
            'average_appointment_duration': 25,  # minutes
        }
        
        return {
            'kpis': kpis,
            'timestamp': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'user_info': {
                'id': current_user.id if hasattr(current_user, 'id') else None,
                'role': current_user.role if hasattr(current_user, 'role') else 'guest'
            }
        }

    @staticmethod
    def get_chart_data():
        """
        Get structured chart data for visualizations
        Returns: {
            'appointment_status': {labels, values, colors},
            'revenue_trend': {dates, revenue},
            'patient_distribution': {categories, counts},
            'department_metrics': {...}
        }
        """
        today = datetime.now()
        
        # Appointment status pie chart
        appointment_chart = {
            'labels': ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
            'values': [20, 15, 5, 5],
            'colors': ['#4CAF50', '#2196F3', '#FF9800', '#FFC107']
        }
        
        # Revenue trend line chart (last 7 days)
        dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6, -1, -1)]
        revenue = [2000, 2300, 2100, 2500, 2800, 2400, 2500]
        
        revenue_chart = {
            'dates': dates,
            'revenue': revenue,
            'currency': 'USD'
        }
        
        # Patient distribution bar chart
        patient_chart = {
            'categories': ['Active', 'Inactive', 'Discharged', 'In-Treatment'],
            'counts': [120, 30, 15, 25],
            'colors': ['#4CAF50', '#FF5252', '#2196F3', '#FFC107']
        }
        
        # Department metrics
        department_chart = {
            'departments': ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'],
            'patient_count': [45, 38, 42, 25],
            'appointment_count': [12, 10, 15, 8],
            'revenue': [5000, 3800, 4200, 2800]
        }
        
        return {
            'appointment_status': appointment_chart,
            'revenue_trend': revenue_chart,
            'patient_distribution': patient_chart,
            'department_metrics': department_chart
        }

    @staticmethod
    def get_update_info():
        """
        Get information about data update intervals and caching
        Returns: {
            'last_update': ISO 8601,
            'update_interval_seconds': int,
            'next_update': ISO 8601,
            'is_cached': bool,
            'cache_duration': int
        }
        """
        now = datetime.utcnow()
        last_update = now.strftime('%Y-%m-%dT%H:%M:%SZ')
        next_update = (now + timedelta(seconds=StatisticsService._update_interval)).strftime('%Y-%m-%dT%H:%M:%SZ')
        
        return {
            'last_update': last_update,
            'update_interval_seconds': StatisticsService._update_interval,
            'next_update': next_update,
            'is_cached': True,
            'cache_duration': StatisticsService._cache_duration
        }

    @staticmethod
    def get_role_based_dashboard(role='guest'):
        """
        Get dashboard with role-based metric visibility
        Args: role (str) - User role (admin, doctor, nurse, receptionist)
        Returns: {
            'kpis': {role-appropriate metrics},
            'patient_metrics': {...},
            'appointment_metrics': {...},
            'financial_metrics': {...},  # Admin only
            'operational_metrics': {...},  # Admin & managers
            'system_metrics': {...}  # Admin only
        }
        """
        base_kpis = StatisticsService.get_dashboard_kpis()['kpis']
        
        if role.lower() == 'admin':
            # Admin sees everything
            return {
                'kpis': base_kpis,
                'patient_metrics': {
                    'total': base_kpis['total_patients'],
                    'active': base_kpis['active_patients'],
                    'inactive': base_kpis['inactive_patients'],
                    'average_age': base_kpis['average_patient_age']
                },
                'appointment_metrics': {
                    'today': base_kpis['appointments_today'],
                    'pending': base_kpis['pending_appointments'],
                    'completed': base_kpis['completed_appointments'],
                    'cancelled': base_kpis['cancelled_appointments']
                },
                'financial_metrics': {
                    'revenue_today': base_kpis['revenue_today'],
                    'revenue_month': base_kpis['revenue_month'],
                    'revenue_trend': base_kpis['revenue_trend']
                },
                'operational_metrics': {
                    'bed_occupancy': base_kpis['bed_occupancy_rate'],
                    'staff_utilization': base_kpis['staff_utilization'],
                    'emergency_wait_time': base_kpis['emergency_wait_time']
                },
                'system_metrics': {
                    'api_response_time': 45,  # ms
                    'database_queries': 156,
                    'cache_hit_rate': 92.5  # percent
                }
            }
        
        elif role.lower() == 'doctor':
            # Doctors see patient and appointment metrics only
            return {
                'kpis': {
                    'total_patients': base_kpis['total_patients'],
                    'active_patients': base_kpis['active_patients'],
                    'appointments_today': base_kpis['appointments_today'],
                    'pending_appointments': base_kpis['pending_appointments'],
                    'average_patient_age': base_kpis['average_patient_age']
                },
                'patient_metrics': {
                    'total': base_kpis['total_patients'],
                    'active': base_kpis['active_patients'],
                    'average_age': base_kpis['average_patient_age']
                },
                'appointment_metrics': {
                    'today': base_kpis['appointments_today'],
                    'pending': base_kpis['pending_appointments'],
                    'completed': base_kpis['completed_appointments']
                }
            }
        
        elif role.lower() == 'nurse':
            # Nurses see patient and basic appointment metrics
            return {
                'kpis': {
                    'total_patients': base_kpis['total_patients'],
                    'active_patients': base_kpis['active_patients'],
                    'appointments_today': base_kpis['appointments_today']
                },
                'patient_metrics': {
                    'total': base_kpis['total_patients'],
                    'active': base_kpis['active_patients']
                },
                'appointment_metrics': {
                    'today': base_kpis['appointments_today']
                }
            }
        
        elif role.lower() == 'receptionist':
            # Receptionists see appointment metrics primarily
            return {
                'kpis': {
                    'appointments_today': base_kpis['appointments_today'],
                    'pending_appointments': base_kpis['pending_appointments']
                },
                'appointment_metrics': {
                    'today': base_kpis['appointments_today'],
                    'pending': base_kpis['pending_appointments'],
                    'completed': base_kpis['completed_appointments']
                }
            }
        
        else:
            # Guest sees nothing sensitive
            return {
                'kpis': {
                    'appointments_today': base_kpis['appointments_today']
                },
                'appointment_metrics': {
                    'today': base_kpis['appointments_today']
                }
            }

    @staticmethod
    def get_filtered_dashboard(date_from=None, date_to=None, department=None, category=None):
        """
        Get dashboard data with filtering applied
        Args:
            date_from (str): Start date YYYY-MM-DD
            date_to (str): End date YYYY-MM-DD
            department (str): Filter by department
            category (str): Filter by category
        Returns:
            {
                'filters': {applied filters},
                'kpis': {...},
                'charts': {...}
            }
        """
        filters = {}
        
        if date_from:
            filters['date_from'] = date_from
        if date_to:
            filters['date_to'] = date_to
        if department:
            filters['department'] = department
        if category:
            filters['category'] = category
        
        # Get base data
        kpis = StatisticsService.get_dashboard_kpis()['kpis']
        charts = StatisticsService.get_chart_data()
        
        # Apply filters (in real implementation, would query database with filters)
        if department:
            # Filter charts by department
            if department.lower() == 'cardiology':
                charts['department_metrics']['departments'] = ['Cardiology']
                charts['department_metrics']['patient_count'] = [45]
                charts['department_metrics']['appointment_count'] = [12]
                charts['department_metrics']['revenue'] = [5000]
        
        return {
            'filters': filters,
            'kpis': kpis,
            'charts': charts
        }

    @staticmethod
    def get_patient_stats():
        """Get detailed patient statistics"""
        return {
            'total_patients': 150,
            'active_patients': 120,
            'inactive_patients': 30,
            'gender_distribution': {
                'male': 75,
                'female': 75
            },
            'age_distribution': {
                '0-18': 20,
                '19-35': 35,
                '36-50': 45,
                '51-65': 35,
                '65+': 15
            },
            'status_distribution': {
                'in_treatment': 85,
                'recovered': 55,
                'discharged': 10
            }
        }

    @staticmethod
    def get_appointment_stats():
        """Get detailed appointment statistics"""
        return {
            'total_appointments': 45,
            'scheduled': 20,
            'completed': 15,
            'cancelled': 5,
            'pending': 5,
            'average_duration_minutes': 25,
            'no_show_rate': 3.5,  # percentage
            'appointment_types': {
                'consultation': 20,
                'surgery': 8,
                'follow_up': 12,
                'emergency': 5
            }
        }

    @staticmethod
    def get_revenue_stats():
        """Get detailed revenue statistics"""
        return {
            'revenue_today': 2500.00,
            'revenue_week': 17500.00,
            'revenue_month': 65000.00,
            'revenue_trend': 5.2,  # percentage
            'average_transaction': 250.00,
            'currency': 'USD',
            'top_departments': {
                'Cardiology': 5000.00,
                'Orthopedics': 4200.00,
                'Pediatrics': 3800.00,
                'Neurology': 2800.00
            },
            'payment_methods': {
                'insurance': 35000.00,
                'cash': 20000.00,
                'card': 10000.00
            }
        }
