const ApiError = require("../utils/ApiError")

const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
        return next(ApiError.forbidden(`This action requires one of: ${allowedRoles.join(', ')}`));
    }
    next();
};

module.exports = { requireRole };