import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveSession, getSession, clearSession, authHeaders } from './auth'

describe('auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  describe('saveSession', () => {
    it('should save session to localStorage', () => {
      const session = { username: 'testuser', sessionId: 'abc123' }
      
      saveSession(session)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'sca_session',
        JSON.stringify(session)
      )
    })

    it('should dispatch session-change event', () => {
      const session = { username: 'testuser', sessionId: 'abc123' }
      
      saveSession(session)
      
      expect(window.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('getSession', () => {
    it('should return null when no session exists', () => {
      localStorage.getItem.mockReturnValue(null)
      
      const result = getSession()
      
      expect(result).toBeNull()
    })

    it('should return parsed session when exists', () => {
      const session = { username: 'testuser', sessionId: 'abc123' }
      localStorage.getItem.mockReturnValue(JSON.stringify(session))
      
      const result = getSession()
      
      expect(result).toEqual(session)
    })

    it('should return null for invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json')
      
      const result = getSession()
      
      expect(result).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should remove session from localStorage', () => {
      clearSession()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('sca_session')
    })

    it('should dispatch session-change event', () => {
      clearSession()
      
      expect(window.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('authHeaders', () => {
    it('should return empty object when no session', () => {
      localStorage.getItem.mockReturnValue(null)
      
      const result = authHeaders()
      
      expect(result).toEqual({})
    })

    it('should return headers with session data', () => {
      const session = { username: 'testuser', sessionId: 'abc123' }
      localStorage.getItem.mockReturnValue(JSON.stringify(session))
      
      const result = authHeaders()
      
      expect(result).toEqual({
        'x-username': 'testuser',
        'x-session-id': 'abc123'
      })
    })
  })
})
