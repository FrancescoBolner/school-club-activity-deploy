import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock api module
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Helper to create test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
})

// Render helper with all providers
export const renderWithProviders = (ui, { route = '/', ...options } = {}) => {
  const queryClient = createTestQueryClient()
  
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
  
  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient
  }
}

describe('Component Integration Tests', () => {
  describe('Navigation Links', () => {
    it('should render navigation correctly', () => {
      const TestNav = () => (
        <nav>
          <a href="/">Home</a>
          <a href="/clubs">Browse Clubs</a>
          <a href="/notifications">Notifications</a>
        </nav>
      )

      renderWithProviders(<TestNav />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Browse Clubs')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
  })

  describe('Form Components', () => {
    it('should handle input changes', () => {
      const TestForm = () => {
        return (
          <form>
            <input 
              type="text" 
              placeholder="Search clubs..."
              data-testid="search-input"
            />
            <button type="submit">Search</button>
          </form>
        )
      }

      renderWithProviders(<TestForm />)
      
      const input = screen.getByTestId('search-input')
      fireEvent.change(input, { target: { value: 'chess' } })
      
      expect(input.value).toBe('chess')
    })

    it('should display error state', () => {
      const ErrorDisplay = ({ error }) => (
        <div role="alert" className="error">
          {error}
        </div>
      )

      renderWithProviders(<ErrorDisplay error="Failed to load data" />)
      
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data')
    })
  })

  describe('Loading States', () => {
    it('should show loading indicator', () => {
      const LoadingComponent = ({ isLoading }) => (
        <div>
          {isLoading ? (
            <span data-testid="loading">Loading...</span>
          ) : (
            <span data-testid="content">Content loaded</span>
          )}
        </div>
      )

      renderWithProviders(<LoadingComponent isLoading={true} />)
      
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show content when loaded', () => {
      const LoadingComponent = ({ isLoading }) => (
        <div>
          {isLoading ? (
            <span data-testid="loading">Loading...</span>
          ) : (
            <span data-testid="content">Content loaded</span>
          )}
        </div>
      )

      renderWithProviders(<LoadingComponent isLoading={false} />)
      
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should render pagination buttons', () => {
      const Pagination = ({ page, pages, onPageChange }) => (
        <div className="pagination">
          <button 
            onClick={() => onPageChange(page - 1)} 
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>Page {page} of {pages}</span>
          <button 
            onClick={() => onPageChange(page + 1)} 
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      )

      const handlePageChange = vi.fn()
      renderWithProviders(
        <Pagination page={2} pages={5} onPageChange={handlePageChange} />
      )
      
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Next'))
      expect(handlePageChange).toHaveBeenCalledWith(3)
      
      fireEvent.click(screen.getByText('Previous'))
      expect(handlePageChange).toHaveBeenCalledWith(1)
    })

    it('should disable previous on first page', () => {
      const Pagination = ({ page, pages }) => (
        <div className="pagination">
          <button disabled={page <= 1}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages}>Next</button>
        </div>
      )

      renderWithProviders(<Pagination page={1} pages={5} />)
      
      expect(screen.getByText('Previous')).toBeDisabled()
      expect(screen.getByText('Next')).not.toBeDisabled()
    })

    it('should disable next on last page', () => {
      const Pagination = ({ page, pages }) => (
        <div className="pagination">
          <button disabled={page <= 1}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages}>Next</button>
        </div>
      )

      renderWithProviders(<Pagination page={5} pages={5} />)
      
      expect(screen.getByText('Previous')).not.toBeDisabled()
      expect(screen.getByText('Next')).toBeDisabled()
    })
  })

  describe('Club Card Display', () => {
    it('should render club information', () => {
      const ClubCard = ({ club }) => (
        <div className="club-card" data-testid="club-card">
          <h2>{club.clubName}</h2>
          <p>{club.description}</p>
          <span>Members: {club.memberCount}/{club.memberMax}</span>
        </div>
      )

      const mockClub = {
        clubName: 'Chess Club',
        description: 'A club for chess enthusiasts',
        memberCount: 15,
        memberMax: 30
      }

      renderWithProviders(<ClubCard club={mockClub} />)
      
      expect(screen.getByText('Chess Club')).toBeInTheDocument()
      expect(screen.getByText('A club for chess enthusiasts')).toBeInTheDocument()
      expect(screen.getByText('Members: 15/30')).toBeInTheDocument()
    })
  })

  describe('Event Card Display', () => {
    it('should render event information', () => {
      const EventCard = ({ event }) => (
        <div className="event-card" data-testid="event-card">
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <span>{event.clubName}</span>
        </div>
      )

      const mockEvent = {
        title: 'Chess Tournament',
        description: 'Annual chess tournament',
        clubName: 'Chess Club',
        startDate: '2024-03-15T10:00:00Z'
      }

      renderWithProviders(<EventCard event={mockEvent} />)
      
      expect(screen.getByText('Chess Tournament')).toBeInTheDocument()
      expect(screen.getByText('Annual chess tournament')).toBeInTheDocument()
      expect(screen.getByText('Chess Club')).toBeInTheDocument()
    })
  })
})
