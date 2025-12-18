import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
delete window.location
window.location = {
  hostname: 'localhost',
  href: '',
  pathname: '/'
}

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn()
