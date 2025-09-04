import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock the prompt function for booking tests
const mockPrompt = vi.fn()
global.prompt = mockPrompt

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the main application', () => {
    render(<App />)
    
    expect(screen.getByText('Pickleball Court Reservations')).toBeInTheDocument()
    expect(screen.getByTestId('date-navigator')).toBeInTheDocument()
    expect(screen.getByTestId('court-grid')).toBeInTheDocument()
  })

  it('should start in daily view mode', () => {
    render(<App />)
    
    expect(screen.getByTestId('view-toggle')).toHaveTextContent('Switch to Weekly')
  })

  it('should toggle between daily and weekly views', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Should start in daily mode
    expect(screen.getByTestId('view-toggle')).toHaveTextContent('Switch to Weekly')
    expect(screen.getByTestId('court-grid')).toBeInTheDocument()
    
    // Switch to weekly mode
    await user.click(screen.getByTestId('view-toggle'))
    
    expect(screen.getByTestId('view-toggle')).toHaveTextContent('Switch to Daily')
    expect(screen.getByTestId('weekly-view')).toBeInTheDocument()
    expect(screen.queryByTestId('court-grid')).not.toBeInTheDocument()
  })

  it('should allow booking a court slot', async () => {
    const user = userEvent.setup()
    mockPrompt.mockReturnValue('John Doe')
    
    render(<App />)
    
    // Click on an available time slot
    const timeSlot = screen.getByTestId('time-slot-1-06:00')
    await user.click(timeSlot)
    
    expect(mockPrompt).toHaveBeenCalledWith('Enter player name:')
    
    // Should show the booked slot
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    // The slot should now be marked as booked
    expect(timeSlot).toHaveClass('booked')
  })

  it('should allow canceling a reservation', async () => {
    const user = userEvent.setup()
    mockPrompt.mockReturnValue('Jane Smith')
    
    render(<App />)
    
    // First book a slot
    const timeSlot = screen.getByTestId('time-slot-2-09:00')
    await user.click(timeSlot)
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
    
    // Now cancel it
    await user.click(timeSlot)
    
    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
    
    // Should be available again
    expect(timeSlot).toHaveClass('available')
  })

  it('should handle multiple reservations', async () => {
    const user = userEvent.setup()
    
    render(<App />)
    
    // Book multiple slots
    mockPrompt.mockReturnValue('Player 1')
    await user.click(screen.getByTestId('time-slot-1-08:00'))
    
    mockPrompt.mockReturnValue('Player 2')
    await user.click(screen.getByTestId('time-slot-3-10:00'))
    
    mockPrompt.mockReturnValue('Player 3')
    await user.click(screen.getByTestId('time-slot-5-15:00'))
    
    // All players should be visible
    await waitFor(() => {
      expect(screen.getByText('Player 1')).toBeInTheDocument()
      expect(screen.getByText('Player 2')).toBeInTheDocument()
      expect(screen.getByText('Player 3')).toBeInTheDocument()
    })
  })

  it('should navigate dates correctly', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const dateDisplay = screen.getByTestId('date-display')
    const originalDate = dateDisplay.textContent
    
    // Navigate to next day
    await user.click(screen.getByTestId('next-button'))
    
    expect(dateDisplay.textContent).not.toBe(originalDate)
    
    // Navigate back
    await user.click(screen.getByTestId('prev-button'))
    
    expect(dateDisplay.textContent).toBe(originalDate)
  })

  it('should go to today when today button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate away from today first
    await user.click(screen.getByTestId('next-button'))
    await user.click(screen.getByTestId('next-button'))
    
    // Go back to today
    await user.click(screen.getByTestId('today-button'))
    
    const dateDisplay = screen.getByTestId('date-display')
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    expect(dateDisplay).toHaveTextContent(today)
  })

  it('should show legend with correct information', () => {
    render(<App />)
    
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Booked')).toBeInTheDocument()
    
    const legend = document.querySelector('.legend')
    expect(legend).toBeInTheDocument()
  })

  it('should handle empty player name gracefully', async () => {
    const user = userEvent.setup()
    mockPrompt.mockReturnValue('')
    
    render(<App />)
    
    const timeSlot = screen.getByTestId('time-slot-1-12:00')
    await user.click(timeSlot)
    
    // Should not book the slot
    expect(timeSlot).toHaveClass('available')
    expect(screen.queryByTestId('player-name')).not.toBeInTheDocument()
  })

  it('should handle user canceling booking prompt', async () => {
    const user = userEvent.setup()
    mockPrompt.mockReturnValue(null)
    
    render(<App />)
    
    const timeSlot = screen.getByTestId('time-slot-4-14:00')
    await user.click(timeSlot)
    
    // Should not book the slot
    expect(timeSlot).toHaveClass('available')
    expect(screen.queryByTestId('player-name')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<App />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Pickleball Court Reservations')
    })

    it('should have accessible buttons', () => {
      render(<App />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // All buttons should be accessible (not disabled or hidden)
        expect(button).not.toHaveAttribute('disabled')
      })
    })

    it('should provide proper aria-labels for time slots', () => {
      render(<App />)
      
      const timeSlot = screen.getByTestId('time-slot-1-06:00')
      expect(timeSlot).toHaveAttribute('aria-label')
      expect(timeSlot.getAttribute('aria-label')).toContain('6:00 AM')
      expect(timeSlot.getAttribute('aria-label')).toContain('Available')
    })
  })

  describe('Responsive behavior', () => {
    it('should render grid layout correctly', () => {
      render(<App />)
      
      const courtGrid = screen.getByTestId('court-grid')
      expect(courtGrid).toHaveClass('court-grid')
    })

    it('should show all courts in the grid', () => {
      render(<App />)
      
      // Should show Court 1 through Court 10
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(`Court ${i}`)).toBeInTheDocument()
      }
    })
  })

  describe('State persistence', () => {
    it('should maintain reservations when switching views', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue('Test Player')
      
      render(<App />)
      
      // Book a slot in daily view
      await user.click(screen.getByTestId('time-slot-1-09:00'))
      
      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument()
      })
      
      // Switch to weekly view and back
      await user.click(screen.getByTestId('view-toggle'))
      await user.click(screen.getByTestId('view-toggle'))
      
      // Reservation should still be there
      expect(screen.getByText('Test Player')).toBeInTheDocument()
    })

    it('should maintain reservations when navigating dates', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue('Persistent Player')
      
      render(<App />)
      
      // Book a slot
      await user.click(screen.getByTestId('time-slot-3-11:00'))
      
      await waitFor(() => {
        expect(screen.getByText('Persistent Player')).toBeInTheDocument()
      })
      
      // Navigate away and back
      await user.click(screen.getByTestId('next-button'))
      await user.click(screen.getByTestId('prev-button'))
      
      // Reservation should still be there
      expect(screen.getByText('Persistent Player')).toBeInTheDocument()
    })
  })
})