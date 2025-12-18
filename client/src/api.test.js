import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './api'

describe('api.js', () => {
  describe('getErrorMessage', () => {
    it('should extract message from response data', () => {
      const error = {
        response: {
          data: {
            message: 'User not found'
          }
        }
      }
      
      expect(getErrorMessage(error)).toBe('User not found')
    })

    it('should fall back to error message', () => {
      const error = {
        message: 'Network Error'
      }
      
      expect(getErrorMessage(error)).toBe('Network Error')
    })

    it('should return default message for unknown error', () => {
      const error = {}
      
      expect(getErrorMessage(error)).toBe('Something went wrong')
    })

    it('should handle null error', () => {
      expect(getErrorMessage(null)).toBe('Something went wrong')
    })

    it('should handle undefined error', () => {
      expect(getErrorMessage(undefined)).toBe('Something went wrong')
    })

    it('should prioritize response data message over error message', () => {
      const error = {
        response: {
          data: {
            message: 'API Error'
          }
        },
        message: 'Generic Error'
      }
      
      expect(getErrorMessage(error)).toBe('API Error')
    })
  })
})
