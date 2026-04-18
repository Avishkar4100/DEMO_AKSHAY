"""
Dashboard Routes - HOS-14 Dashboard & Reporting

Provides endpoints for dashboard metrics and reporting:
- Aggregated patient metrics
- Appointment statistics
- Revenue analytics
- Real-time dashboard data
"""

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from ..services.aggregation import DataAggregationService
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
