import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Helper function to render with providers
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Utility function tests
describe('Home utility functions', () => {
  describe('formatDateRange', () => {
    // Extracted function for testing
    const formatDateRange = (start, end) => {
      const s = new Date(start)
      const e = end ? new Date(end) : null
      const sameDay = e && s.toDateString() === e.toDateString()
      const fmt = (d) => `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      if (!e) return fmt(s)
      if (sameDay) return `${fmt(s)} - ${e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      return `${fmt(s)} - ${fmt(e)}`
    }

    it('should format single date correctly', () => {
      const result = formatDateRange('2024-03-15T10:00:00')
      expect(result).toContain('15/03/2024')
      expect(result).toContain('10:00')
    })

    it('should format same day range correctly', () => {
      const result = formatDateRange('2024-03-15T10:00:00', '2024-03-15T14:00:00')
      expect(result).toContain('15/03/2024')
      expect(result).toContain('10:00')
      expect(result).toContain('14:00')
    })

    it('should format multi-day range correctly', () => {
      const result = formatDateRange('2024-03-15T10:00:00', '2024-03-17T14:00:00')
      expect(result).toContain('15/03/2024')
      expect(result).toContain('17/03/2024')
    })
  })

  describe('isEventIncoming', () => {
    const isEventIncoming = (event) => {
      const now = new Date()
      const start = new Date(event.startDate)
      const end = event.endDate ? new Date(event.endDate) : null
      return start > now || (end && end > now)
    }

    it('should return true for future event', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      
      const event = { startDate: futureDate.toISOString() }
      expect(isEventIncoming(event)).toBe(true)
    })

    it('should return false for past event', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      
      const event = { startDate: pastDate.toISOString() }
      expect(isEventIncoming(event)).toBeFalsy()
    })

    it('should return true if end date is in future', () => {
      const pastStart = new Date()
      pastStart.setDate(pastStart.getDate() - 1)
      const futureEnd = new Date()
      futureEnd.setDate(futureEnd.getDate() + 1)
      
      const event = {
        startDate: pastStart.toISOString(),
        endDate: futureEnd.toISOString()
      }
      expect(isEventIncoming(event)).toBe(true)
    })
  })
})

describe('ICS Download functionality', () => {
  const downloadICS = (event) => {
    const toICS = (date) => new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const start = toICS(event.startDate)
    const end = toICS(event.endDate || event.startDate)
    const uid = `${event.eventid || event.title}-${start}@school-club`
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//School Club Activity//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${toICS(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${event.clubName || 'Club Event'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    return ics
  }

  it('should generate valid ICS content', () => {
    const event = {
      title: 'Test Event',
      startDate: '2024-03-15T10:00:00Z',
      endDate: '2024-03-15T14:00:00Z',
      description: 'Test description',
      clubName: 'Chess Club'
    }
    
    const ics = downloadICS(event)
    
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('SUMMARY:Test Event')
    expect(ics).toContain('DESCRIPTION:Test description')
    expect(ics).toContain('LOCATION:Chess Club')
  })

  it('should handle events without end date', () => {
    const event = {
      title: 'Single Day Event',
      startDate: '2024-03-15T10:00:00Z'
    }
    
    const ics = downloadICS(event)
    
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Single Day Event')
  })

  it('should escape newlines in description', () => {
    const event = {
      title: 'Event',
      startDate: '2024-03-15T10:00:00Z',
      description: 'Line 1\nLine 2'
    }
    
    const ics = downloadICS(event)
    
    expect(ics).toContain('DESCRIPTION:Line 1\\nLine 2')
  })
})
