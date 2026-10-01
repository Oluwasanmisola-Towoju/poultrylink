const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Translates known Prisma error codes into clean ApiErrors instead of leaking
// raw Prisma internals to the client.
function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return ApiError.conflict(`A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`);
      case 'P2003':
        return ApiError.badRequest('Invalid reference to a related record');
      case 'P2025':
        return ApiError.notFound('Record not found');
      default:
        return ApiError.internal('Database error');
    }
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err instanceof ApiError ? err : mapPrismaError(err);

  if (!error) {
    error = ApiError.internal(env.NODE_ENV === 'production' ? 'Something went wrong' : err.message);
  }

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  const payload = {
    success: false,
    message: error.message,
  };
  if (error.details) payload.details = error.details;
  if (env.NODE_ENV === 'development' && !error.isOperational) payload.stack = err.stack;

  res.status(error.statusCode || 500).json(payload);
}

module.exports = { notFoundHandler, errorHandler };