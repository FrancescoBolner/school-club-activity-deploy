// Utility functions extracted for testing

/**
 * Convert a value to a positive number, or return a fallback
 * @param {any} value - Value to convert
 * @param {number} fallback - Fallback value if conversion fails
 * @returns {number}
 */
export const toNumber = (value, fallback) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Build pagination parameters from query object
 * @param {object} query - Request query object
 * @param {object} allowedOrder - Map of allowed order keys
 * @param {string} defaultOrder - Default order key
 * @returns {object} Pagination configuration
 */
export const buildPagination = (query, allowedOrder, defaultOrder) => {
  const search = query.q || ''
  const orderKey = allowedOrder[query.orderBy] || defaultOrder
  const direction = (query.order || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC'
  const limit = Math.min(toNumber(query.limit, 10), 50)
  const page = toNumber(query.page, 1)
  const offset = (page - 1) * limit
  return { search, orderKey, direction, limit, page, offset }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate username format (alphanumeric, 3-30 chars)
 * @param {string} username - Username to validate
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

/**
 * Sanitize string for safe database usage
 * @param {string} str - String to sanitize
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.trim().slice(0, 255)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, message: string}}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' }
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be at most 128 characters' }
  }
  return { valid: true, message: 'Password is valid' }
}

/**
 * Check if a role is valid
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  const validRoles = ['STU', 'CM', 'VP', 'CL', 'ADM']
  return validRoles.includes(role)
}

/**
 * Calculate pages from total and limit
 * @param {number} total - Total items
 * @param {number} limit - Items per page
 * @returns {number}
 */
export const calculatePages = (total, limit) => {
  return Math.ceil(total / limit) || 1
}
