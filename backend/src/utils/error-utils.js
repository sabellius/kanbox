import createError from "http-errors";

/**
 * Standard error creation helper
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} - HTTP error object
 */
export const createHttpError = (statusCode, message) => {
  return createError(statusCode, message);
};

/**
 * Throw 404 Not Found error
 * @param {string} resource - Resource name (e.g., "Board", "Card")
 */
export const throwNotFound = resource => {
  throw createError(404, `${resource} not found`);
};

/**
 * Throw 400 Bad Request error
 * @param {string} message - Error message
 */
export const throwBadRequest = message => {
  throw createError(400, message);
};

/**
 * Throw 401 Unauthorized error
 * @param {string} message - Error message
 */
export const throwUnauthorized = (message = "Unauthorized") => {
  throw createError(401, message);
};

/**
 * Throw 403 Forbidden error
 * @param {string} message - Error message
 */
export const throwForbidden = (message = "Forbidden") => {
  throw createError(403, message);
};

/**
 * Throw 409 Conflict error
 * @param {string} message - Error message
 */
export const throwConflict = message => {
  throw createError(409, message);
};
