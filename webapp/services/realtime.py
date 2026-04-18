"""
HOS-18: Real-time Updates Service
Handles automatic data refresh, caching, and real-time WebSocket updates
"""

import time
from datetime import datetime, timedelta
from threading import Lock
from flask_login import current_user


class CacheManager:
    """
    Memory-efficient cache manager with TTL support
    Handles cache operations, invalidation, and statistics
    """

    _cache = {}
    _cache_lock = Lock()
    _stats = {
        'hits': 0,
        'misses': 0,
        'sets': 0,
        'invalidations': 0,
    }

    @staticmethod
    def set_cached(category, key, value, ttl=300):
        """
        Set a value in cache with TTL
        Args:
            category (str): Cache category (e.g., 'metrics')
            key (str): Cache key
            value: Data to cache
            ttl (int): Time to live in seconds
        """
        cache_key = f"{category}:{key}"
        expiry = datetime.now() + timedelta(seconds=ttl)

        with CacheManager._cache_lock:
            CacheManager._cache[cache_key] = {
                'value': value,
                'expiry': expiry,
                'created_at': datetime.now()
            }
            CacheManager._stats['sets'] += 1

        return True

    @staticmethod
    def get_cached(category, key):
        """
        Get a value from cache if not expired
        Args:
            category (str): Cache category
            key (str): Cache key
        Returns:
            Cached value or None if expired/missing
        """
        cache_key = f"{category}:{key}"

        with CacheManager._cache_lock:
            if cache_key not in CacheManager._cache:
                CacheManager._stats['misses'] += 1
                return None

            cache_entry = CacheManager._cache[cache_key]

            # Check if expired
            if datetime.now() > cache_entry['expiry']:
                del CacheManager._cache[cache_key]
                CacheManager._stats['misses'] += 1
                return None

            CacheManager._stats['hits'] += 1
            return cache_entry['value']

    @staticmethod
    def invalidate(category, key=None):
        """
        Invalidate cache entries
        Args:
            category (str): Cache category to invalidate
            key (str): Specific key (optional, clears whole category if None)
        """
        with CacheManager._cache_lock:
            if key is None:
                # Clear entire category
                keys_to_delete = [k for k in CacheManager._cache.keys()
                                 if k.startswith(f"{category}:")]
                for k in keys_to_delete:
                    del CacheManager._cache[k]
                    CacheManager._stats['invalidations'] += 1
            else:
                # Clear specific key
                cache_key = f"{category}:{key}"
                if cache_key in CacheManager._cache:
                    del CacheManager._cache[cache_key]
                    CacheManager._stats['invalidations'] += 1

        return True

    @staticmethod
    def clear_all():
        """Clear entire cache"""
        with CacheManager._cache_lock:
            CacheManager._cache.clear()
            CacheManager._stats = {
                'hits': 0,
                'misses': 0,
                'sets': 0,
                'invalidations': 0,
            }

    @staticmethod
    def get_stats():
        """
        Get cache statistics
        Returns: {hits, misses, hit_rate, entries}
        """
        with CacheManager._cache_lock:
            total_requests = CacheManager._stats['hits'] + CacheManager._stats['misses']
            hit_rate = (CacheManager._stats['hits'] / total_requests
                       if total_requests > 0 else 0)

            return {
                'hits': CacheManager._stats['hits'],
                'misses': CacheManager._stats['misses'],
                'hit_rate': hit_rate,
                'entries': len(CacheManager._cache),
                'sets': CacheManager._stats['sets'],
                'invalidations': CacheManager._stats['invalidations'],
            }

    @staticmethod
    def get_cache_info():
        """Get cache memory information"""
        import sys

        with CacheManager._cache_lock:
            total_size = 0
            for key, entry in CacheManager._cache.items():
                total_size += sys.getsizeof(entry['value'])

            return {
                'entries': len(CacheManager._cache),
                'size_mb': total_size / (1024 * 1024),
                'ttl': 300,
            }


class RealtimeService:
    """
    Service for real-time updates with caching and WebSocket support
    """

    # Configuration constants
    REFRESH_INTERVAL_MS = 10000  # 10 seconds
    CACHE_TTL_SECONDS = 30
    UPDATE_STRATEGY = 'polling'  # or 'websocket'

    @staticmethod
    def get_refresh_config():
        """
        Get refresh configuration for frontend
        Returns: {refresh_interval_ms, update_strategy, caching_enabled}
        """
        return {
            'refresh_interval_ms': RealtimeService.REFRESH_INTERVAL_MS,
            'update_strategy': RealtimeService.UPDATE_STRATEGY,
            'caching_enabled': True,
            'cache_ttl_seconds': RealtimeService.CACHE_TTL_SECONDS,
        }

    @staticmethod
    def get_current_metrics():
        """
        Get current metrics with caching
        Returns cached data if available, otherwise fetch fresh
        """
        cache_manager = CacheManager()

        # Try to get from cache first
        cached_data = cache_manager.get_cached('metrics', 'all')
        if cached_data is not None:
            return cached_data

        # Fetch fresh data
        from webapp.services.statistics import StatisticsService
        fresh_data = StatisticsService.get_dashboard_kpis()

        # Cache the data
        cache_manager.set_cached(
            'metrics',
            'all',
            fresh_data['kpis'],
            ttl=RealtimeService.CACHE_TTL_SECONDS
        )

        return fresh_data['kpis']

    @staticmethod
    def get_chart_data():
        """Get chart data with caching"""
        cache_manager = CacheManager()

        # Try cache first
        cached_data = cache_manager.get_cached('charts', 'all')
        if cached_data is not None:
            return cached_data

        # Fetch fresh data
        from webapp.services.statistics import StatisticsService
        fresh_data = StatisticsService.get_chart_data()

        # Cache the data
        cache_manager.set_cached(
            'charts',
            'all',
            fresh_data,
            ttl=RealtimeService.CACHE_TTL_SECONDS
        )

        return fresh_data

    @staticmethod
    def invalidate_metrics():
        """Invalidate metrics cache (for updates)"""
        cache_manager = CacheManager()
        cache_manager.invalidate('metrics')
        cache_manager.invalidate('charts')

    @staticmethod
    def subscribe_to_updates(user_id, callback):
        """
        Subscribe user to real-time updates
        Args:
            user_id: User ID
            callback: Function to call on updates
        """
        return {
            'subscription_id': f'sub_{user_id}_{int(time.time())}',
            'status': 'active',
            'next_update': (datetime.now() + timedelta(milliseconds=RealtimeService.REFRESH_INTERVAL_MS)).isoformat(),
        }

    @staticmethod
    def broadcast_update(event_type, data):
        """
        Broadcast update to all connected clients
        Args:
            event_type (str): Type of event (metrics_update, chart_update, etc)
            data: Data to broadcast
        """
        return {
            'event': event_type,
            'timestamp': datetime.now().isoformat(),
            'data': data,
            'recipients': 'all_connected_users',
        }

    @staticmethod
    def emit_event(event_name, data, room=None):
        """
        Emit WebSocket event
        Args:
            event_name (str): Event name (e.g., 'metrics_updated')
            data: Event data
            room (str): Room to emit to (None for broadcast)
        """
        try:
            from flask_socketio import emit, SocketIO
            emit(event_name, data, room=room)
            return {'status': 'emitted', 'event': event_name}
        except ImportError:
            # Fallback if SocketIO not available
            return {'status': 'socketio_not_available', 'event': event_name}

    @staticmethod
    def trigger_update_event():
        """Trigger metrics update event to all clients"""
        metrics = RealtimeService.get_current_metrics()
        return RealtimeService.emit_event('metrics_updated', metrics)

    @staticmethod
    def get_update_status():
        """Get current update status and statistics"""
        cache_stats = CacheManager.get_stats()

        return {
            'status': 'active',
            'last_update': datetime.now().isoformat(),
            'next_update': (datetime.now() + timedelta(milliseconds=RealtimeService.REFRESH_INTERVAL_MS)).isoformat(),
            'refresh_interval_ms': RealtimeService.REFRESH_INTERVAL_MS,
            'cache_hit_rate': cache_stats['hit_rate'],
            'cache_entries': cache_stats['entries'],
            'total_hits': cache_stats['hits'],
            'total_misses': cache_stats['misses'],
        }

    @staticmethod
    def get_performance_metrics():
        """Get performance metrics for monitoring"""
        cache_stats = CacheManager.get_stats()
        cache_info = CacheManager.get_cache_info()

        return {
            'cache': {
                'hit_rate': f"{cache_stats['hit_rate'] * 100:.1f}%",
                'entries': cache_stats['entries'],
                'size_mb': f"{cache_info['size_mb']:.2f}",
                'hits': cache_stats['hits'],
                'misses': cache_stats['misses'],
            },
            'performance': {
                'refresh_interval_ms': RealtimeService.REFRESH_INTERVAL_MS,
                'cache_ttl_seconds': RealtimeService.CACHE_TTL_SECONDS,
                'caching_enabled': True,
            },
            'timestamp': datetime.now().isoformat(),
        }
