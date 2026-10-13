const ApiError = require("../utils/ApiError")

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }
    const userRole = String(req.user.role || '').toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());
    if (!normalizedAllowedRoles.includes(userRole)) {
        return next(ApiError.forbidden(`This action requires one of: ${allowedRoles.join(', ')}`));
    }
    next();
};

module.exports = { requireRole };