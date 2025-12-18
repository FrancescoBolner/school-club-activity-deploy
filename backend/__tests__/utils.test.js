import {
  toNumber,
  buildPagination,
  isValidEmail,
  isValidUsername,
  sanitizeString,
  validatePassword,
  isValidRole,
  calculatePages
} from '../utils.js'

describe('toNumber', () => {
  test('converts valid positive number string', () => {
    expect(toNumber('5', 10)).toBe(5)
  })

  test('converts valid number', () => {
    expect(toNumber(15, 10)).toBe(15)
  })

  test('returns fallback for zero', () => {
    expect(toNumber(0, 10)).toBe(10)
  })

  test('returns fallback for negative number', () => {
    expect(toNumber(-5, 10)).toBe(10)
  })

  test('returns fallback for NaN', () => {
    expect(toNumber(NaN, 10)).toBe(10)
  })

  test('returns fallback for undefined', () => {
    expect(toNumber(undefined, 10)).toBe(10)
  })

  test('returns fallback for null', () => {
    expect(toNumber(null, 10)).toBe(10)
  })

  test('returns fallback for non-numeric string', () => {
    expect(toNumber('abc', 10)).toBe(10)
  })

  test('returns fallback for empty string', () => {
    expect(toNumber('', 10)).toBe(10)
  })

  test('returns fallback for Infinity', () => {
    expect(toNumber(Infinity, 10)).toBe(10)
  })
})

describe('buildPagination', () => {
  const allowedOrder = { 
    name: 'clubName', 
    members: 'memberCount' 
  }

  test('returns default values for empty query', () => {
    const result = buildPagination({}, allowedOrder, 'clubName')
    expect(result).toEqual({
      search: '',
      orderKey: 'clubName',
      direction: 'ASC',
      limit: 10,
      page: 1,
      offset: 0
    })
  })

  test('parses search query', () => {
    const result = buildPagination({ q: 'chess' }, allowedOrder, 'clubName')
    expect(result.search).toBe('chess')
  })

  test('uses allowed order key', () => {
    const result = buildPagination({ orderBy: 'members' }, allowedOrder, 'clubName')
    expect(result.orderKey).toBe('memberCount')
  })

  test('falls back to default for unknown order key', () => {
    const result = buildPagination({ orderBy: 'unknown' }, allowedOrder, 'clubName')
    expect(result.orderKey).toBe('clubName')
  })

  test('sets DESC direction', () => {
    const result = buildPagination({ order: 'DESC' }, allowedOrder, 'clubName')
    expect(result.direction).toBe('DESC')
  })

  test('sets DESC direction case insensitive', () => {
    const result = buildPagination({ order: 'desc' }, allowedOrder, 'clubName')
    expect(result.direction).toBe('DESC')
  })

  test('defaults to ASC direction', () => {
    const result = buildPagination({ order: 'invalid' }, allowedOrder, 'clubName')
    expect(result.direction).toBe('ASC')
  })

  test('respects limit', () => {
    const result = buildPagination({ limit: '20' }, allowedOrder, 'clubName')
    expect(result.limit).toBe(20)
  })

  test('caps limit at 50', () => {
    const result = buildPagination({ limit: '100' }, allowedOrder, 'clubName')
    expect(result.limit).toBe(50)
  })

  test('calculates correct offset', () => {
    const result = buildPagination({ page: '3', limit: '10' }, allowedOrder, 'clubName')
    expect(result.page).toBe(3)
    expect(result.offset).toBe(20)
  })
})

describe('isValidEmail', () => {
  test('accepts valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  test('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  test('accepts email with numbers', () => {
    expect(isValidEmail('user123@example.com')).toBe(true)
  })

  test('rejects email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false)
  })

  test('rejects email without domain', () => {
    expect(isValidEmail('test@')).toBe(false)
  })

  test('rejects email without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  test('rejects email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false)
  })

  test('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidUsername', () => {
  test('accepts valid alphanumeric username', () => {
    expect(isValidUsername('john123')).toBe(true)
  })

  test('accepts username with underscore', () => {
    expect(isValidUsername('john_doe')).toBe(true)
  })

  test('rejects username too short', () => {
    expect(isValidUsername('ab')).toBe(false)
  })

  test('rejects username too long', () => {
    expect(isValidUsername('a'.repeat(31))).toBe(false)
  })

  test('rejects username with special characters', () => {
    expect(isValidUsername('john@doe')).toBe(false)
  })

  test('rejects username with spaces', () => {
    expect(isValidUsername('john doe')).toBe(false)
  })

  test('rejects empty string', () => {
    expect(isValidUsername('')).toBe(false)
  })

  test('rejects null', () => {
    expect(isValidUsername(null)).toBe(false)
  })

  test('rejects undefined', () => {
    expect(isValidUsername(undefined)).toBe(false)
  })
})

describe('sanitizeString', () => {
  test('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  test('limits length to 255 characters', () => {
    const longString = 'a'.repeat(300)
    expect(sanitizeString(longString).length).toBe(255)
  })

  test('returns empty string for null', () => {
    expect(sanitizeString(null)).toBe('')
  })

  test('returns empty string for undefined', () => {
    expect(sanitizeString(undefined)).toBe('')
  })

  test('returns empty string for number', () => {
    expect(sanitizeString(123)).toBe('')
  })

  test('preserves valid string', () => {
    expect(sanitizeString('valid string')).toBe('valid string')
  })
})

describe('validatePassword', () => {
  test('accepts valid password', () => {
    const result = validatePassword('password123')
    expect(result.valid).toBe(true)
  })

  test('rejects password too short', () => {
    const result = validatePassword('12345')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('at least 6')
  })

  test('rejects password too long', () => {
    const result = validatePassword('a'.repeat(129))
    expect(result.valid).toBe(false)
    expect(result.message).toContain('at most 128')
  })

  test('rejects empty password', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
  })

  test('rejects null password', () => {
    const result = validatePassword(null)
    expect(result.valid).toBe(false)
  })

  test('rejects undefined password', () => {
    const result = validatePassword(undefined)
    expect(result.valid).toBe(false)
  })
})

describe('isValidRole', () => {
  test('accepts STU role', () => {
    expect(isValidRole('STU')).toBe(true)
  })

  test('accepts CM role', () => {
    expect(isValidRole('CM')).toBe(true)
  })

  test('accepts VP role', () => {
    expect(isValidRole('VP')).toBe(true)
  })

  test('accepts CL role', () => {
    expect(isValidRole('CL')).toBe(true)
  })

  test('accepts ADM role', () => {
    expect(isValidRole('ADM')).toBe(true)
  })

  test('rejects invalid role', () => {
    expect(isValidRole('ADMIN')).toBe(false)
  })

  test('rejects lowercase role', () => {
    expect(isValidRole('stu')).toBe(false)
  })

  test('rejects empty string', () => {
    expect(isValidRole('')).toBe(false)
  })
})

describe('calculatePages', () => {
  test('calculates pages correctly', () => {
    expect(calculatePages(25, 10)).toBe(3)
  })

  test('returns 1 for zero items', () => {
    expect(calculatePages(0, 10)).toBe(1)
  })

  test('returns exact pages when divisible', () => {
    expect(calculatePages(20, 10)).toBe(2)
  })

  test('rounds up for partial pages', () => {
    expect(calculatePages(21, 10)).toBe(3)
  })

  test('handles single item', () => {
    expect(calculatePages(1, 10)).toBe(1)
  })
})
