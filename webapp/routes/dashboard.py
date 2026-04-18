"""
Dashboard Routes - HOS-14 Dashboard & Reporting

Provides endpoints for dashboard metrics and reporting:
- Aggregated patient metrics
- Appointment statistics
- Revenue analytics
- Real-time dashboard data
- KPI statistics and visualizations (HOS-15)
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..services.aggregation import DataAggregationService
from ..services.statistics import StatisticsService
from ..decorators import permission_required
from ..roles import Permission

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/metrics', methods=['GET'])
@login_required
def get_metrics():
    """
    Get all dashboard metrics.
    
    Returns aggregated data for patients, appointments, and revenue.
    
    Response (200):
        {
            "patients": {
                "total": 150,
                "active": 120,
                "inactive": 30
            },
            "appointments": {
                "total": 45,
                "scheduled": 20,
                "completed": 15,
                "cancelled": 5,
                "pending": 5
            },
            "revenue": {
                "total": 15000.00,
                "today": 500.00,
                "week": 3500.00,
                "month": 12000.00,
                "currency": "USD"
            },
            "timestamp": "2026-04-18T12:00:00Z",
            "user": {
                "id": 1,
                "role": "admin"
            }
        }
    """
    try:
        metrics = DataAggregationService.get_all_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve metrics'
        }), 500


@dashboard_bp.route('/patients/stats', methods=['GET'])
@login_required
@permission_required(Permission.VIEW_PATIENTS)
def get_patient_stats():
    """
    Get detailed patient statistics.
    
    Requires: VIEW_PATIENTS permission
    
    Response (200):
        {
            "metrics": {
                "total": 150,
                "active": 120,
                "inactive": 30
            },
            "timestamp": "2026-04-18T12:00:00Z"
        }
    """
    try:
        stats = DataAggregationService.get_patient_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve patient statistics'
        }), 500


@dashboard_bp.route('/appointments/stats', methods=['GET'])
@login_required
@permission_required(Permission.VIEW_APPOINTMENTS)
def get_appointment_stats():
    """
    Get detailed appointment statistics.
    
    Requires: VIEW_APPOINTMENTS permission
    
    Response (200):
        {
            "metrics": {
                "total": 45,
                "scheduled": 20,
                "completed": 15,
                "cancelled": 5,
                "pending": 5
            },
            "timestamp": "2026-04-18T12:00:00Z"
        }
    """
    try:
        stats = DataAggregationService.get_appointment_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve appointment statistics'
        }), 500


@dashboard_bp.route('/revenue/stats', methods=['GET'])
@login_required
@permission_required(Permission.MANAGE_SYSTEM)
def get_revenue_stats():
    """
    Get detailed revenue statistics.
    
    Requires: MANAGE_SYSTEM permission (admin only)
    
    Response (200):
        {
            "metrics": {
                "total": 15000.00,
                "today": 500.00,
                "week": 3500.00,
                "month": 12000.00,
                "currency": "USD"
            },
            "timestamp": "2026-04-18T12:00:00Z"
        }
    """
    try:
        stats = DataAggregationService.get_revenue_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve revenue statistics'
        }), 500


@dashboard_bp.route('/summary', methods=['GET'])
@login_required
def get_dashboard_summary():
    """
    Get dashboard summary for quick overview.
    
    Response (200):
        {
            "patients_count": 150,
            "appointments_count": 45,
            "revenue_today": 500.00,
            "timestamp": "2026-04-18T12:00:00Z"
        }
    """
    try:
        metrics = DataAggregationService.get_all_metrics()
        
        summary = {
            'patients_count': metrics['patients']['total'],
            'appointments_count': metrics['appointments']['total'],
            'revenue_today': metrics['revenue']['today'],
            'timestamp': metrics['timestamp']
        }
        
        # Add role-specific data
        if current_user.role == 'admin':
            summary['revenue_month'] = metrics['revenue']['month']
        
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve dashboard summary'
        }), 500


# =====================================================================
# HOS-15: Statistics Dashboard Endpoints
# =====================================================================

@dashboard_bp.route('/statistics/kpis', methods=['GET'])
@login_required
def get_dashboard_kpis():
    """
    Get key performance indicators for dashboard.
    
    Returns all KPI metrics with timestamp.
    
    Response (200):
        {
            "kpis": {
                "total_patients": 150,
                "active_patients": 120,
                "appointments_today": 45,
                "revenue_today": 2500.00,
                "bed_occupancy_rate": 78.5,
                ...
            },
            "timestamp": "2026-04-18T12:00:00Z",
            "user_info": {"id": 1, "role": "admin"}
        }
    """
    try:
        kpis = StatisticsService.get_dashboard_kpis()
        return jsonify(kpis), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve KPIs'
        }), 500


@dashboard_bp.route('/statistics/charts', methods=['GET'])
@login_required
def get_chart_data():
    """
    Get chart data for visualizations.
    
    Returns structured data for appointment status, revenue trends,
    patient distribution, and department metrics.
    
    Response (200):
        {
            "appointment_status": {
                "labels": ["Scheduled", "Completed", "Cancelled", "Pending"],
                "values": [20, 15, 5, 5],
                "colors": ["#4CAF50", "#2196F3", "#FF9800", "#FFC107"]
            },
            "revenue_trend": {...},
            "patient_distribution": {...},
            "department_metrics": {...}
        }
    """
    try:
        charts = StatisticsService.get_chart_data()
        return jsonify(charts), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve chart data'
        }), 500


@dashboard_bp.route('/statistics/update-info', methods=['GET'])
@login_required
def get_update_info():
    """
    Get information about data update intervals.
    
    Returns cache duration, update interval, and next update timestamp.
    
    Response (200):
        {
            "last_update": "2026-04-18T12:00:00Z",
            "update_interval_seconds": 10,
            "next_update": "2026-04-18T12:00:10Z",
            "is_cached": true,
            "cache_duration": 30
        }
    """
    try:
        info = StatisticsService.get_update_info()
        return jsonify(info), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve update information'
        }), 500


@dashboard_bp.route('/statistics/role-dashboard', methods=['GET'])
@login_required
def get_role_based_dashboard():
    """
    Get dashboard with role-based metric visibility.
    
    Returns metrics appropriate for the user's role:
    - Admin: All metrics including financial and system metrics
    - Doctor: Patient and appointment metrics
    - Nurse: Basic patient and appointment metrics
    - Receptionist: Appointment metrics primarily
    
    Response (200):
        {
            "kpis": {...},
            "patient_metrics": {...},
            "appointment_metrics": {...},
            "financial_metrics": {...},  # Admin only
            "operational_metrics": {...},  # Admin & managers
            "system_metrics": {...}  # Admin only
        }
    """
    try:
        user_role = current_user.role if hasattr(current_user, 'role') else 'guest'
        dashboard = StatisticsService.get_role_based_dashboard(user_role)
        return jsonify(dashboard), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve role-based dashboard'
        }), 500


@dashboard_bp.route('/statistics/filtered', methods=['GET'])
@login_required
def get_filtered_dashboard():
    """
    Get dashboard with filtering applied.
    
    Query Parameters:
        - date_from (str): Start date YYYY-MM-DD
        - date_to (str): End date YYYY-MM-DD
        - department (str): Filter by department
        - category (str): Filter by category
    
    Response (200):
        {
            "filters": {
                "date_from": "2026-03-18",
                "date_to": "2026-04-18",
                "department": "Cardiology"
            },
            "kpis": {...},
            "charts": {...}
        }
    """
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        department = request.args.get('department')
        category = request.args.get('category')
        
        filtered = StatisticsService.get_filtered_dashboard(
            date_from=date_from,
            date_to=date_to,
            department=department,
            category=category
        )
        return jsonify(filtered), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve filtered dashboard'
        }), 500


@dashboard_bp.route('/statistics/patient-stats', methods=['GET'])
@login_required
@permission_required(Permission.VIEW_PATIENTS)
def get_patient_statistics():
    """
    Get detailed patient statistics.
    
    Requires: VIEW_PATIENTS permission
    
    Response (200):
        {
            "total_patients": 150,
            "active_patients": 120,
            "inactive_patients": 30,
            "gender_distribution": {"male": 75, "female": 75},
            "age_distribution": {...},
            "status_distribution": {...}
        }
    """
    try:
        stats = StatisticsService.get_patient_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve patient statistics'
        }), 500


@dashboard_bp.route('/statistics/appointment-stats', methods=['GET'])
@login_required
@permission_required(Permission.VIEW_APPOINTMENTS)
def get_appointment_statistics():
    """
    Get detailed appointment statistics.
    
    Requires: VIEW_APPOINTMENTS permission
    
    Response (200):
        {
            "total_appointments": 45,
            "scheduled": 20,
            "completed": 15,
            "cancelled": 5,
            "pending": 5,
            "average_duration_minutes": 25,
            "no_show_rate": 3.5,
            "appointment_types": {...}
        }
    """
    try:
        stats = StatisticsService.get_appointment_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve appointment statistics'
        }), 500


@dashboard_bp.route('/statistics/revenue-stats', methods=['GET'])
@login_required
@permission_required(Permission.MANAGE_SYSTEM)
def get_revenue_statistics():
    """
    Get detailed revenue statistics.
    
    Requires: MANAGE_SYSTEM permission (admin only)
    
    Response (200):
        {
            "revenue_today": 2500.00,
            "revenue_week": 17500.00,
            "revenue_month": 65000.00,
            "revenue_trend": 5.2,
            "average_transaction": 250.00,
            "currency": "USD",
            "top_departments": {...},
            "payment_methods": {...}
        }
    """
    try:
        stats = StatisticsService.get_revenue_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve revenue statistics'
        }), 500
