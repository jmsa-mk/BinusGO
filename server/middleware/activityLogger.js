import ActivityLog from '../models/ActivityLog.js';

export function logActivity(action, detailFn) {
  return async (req, _res, next) => {
    try {
      const detail = typeof detailFn === 'function' ? detailFn(req) : detailFn;
      ActivityLog.create({
        user: req.user?._id,
        userName: req.user?.name || 'Guest',
        userRole: req.user?.role || 'Guest',
        action,
        detail: detail || '',
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '',
      }).catch(() => {});
    } catch {}
    next();
  };
}
