import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourtGrid from '../components/CourtGrid'
import { COURTS, TIME_SLOTS } from '../utils/constants'

describe('CourtGrid', () => {
  const mockProps = {
    date: new Date('2024-03-15'),
    onBook: vi.fn(),
    onCancel: vi.fn(),
    getReservation: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render court grid with correct structure', () => {
    render(<CourtGrid {...mockProps} />)
    
    expect(screen.getByTestId('court-grid')).toBeInTheDocument()
  })

  it('should render all court headers', () => {
    render(<CourtGrid {...mockProps} />)
    
    COURTS.forEach(court => {
      expect(screen.getByText(court.name)).toBeInTheDocument()
    })
  })

  it('should render all time slots in headers', () => {
    render(<CourtGrid {...mockProps} />)
    
    TIME_SLOTS.forEach(time => {
      expect(screen.getByText(time)).toBeInTheDocument()
    })
  })

  it('should render TimeSlot for each court and time combination', () => {
    render(<CourtGrid {...mockProps} />)
    
    // Should have COURTS.length * TIME_SLOTS.length TimeSlot components
    const expectedSlots = COURTS.length * TIME_SLOTS.length
    const timeSlots = screen.getAllByRole('button')
    expect(timeSlots).toHaveLength(expectedSlots)
  })

  it('should pass correct props to TimeSlot components', () => {
    const mockGetReservation = vi.fn()
    mockGetReservation.mockReturnValue({ playerName: 'Test Player' })
    
    const props = {
      ...mockProps,
      getReservation: mockGetReservation
    }
    
    render(<CourtGrid {...props} />)
    
    // Should call getReservation for each court/time combination
    expect(mockGetReservation).toHaveBeenCalledTimes(COURTS.length * TIME_SLOTS.length)
    
    // Check a few specific calls
    expect(mockGetReservation).toHaveBeenCalledWith(1, props.date, '06:00')
    expect(mockGetReservation).toHaveBeenCalledWith(10, props.date, '21:00')
  })

  it('should handle reservations correctly', () => {
    const mockGetReservation = vi.fn()
    mockGetReservation.mockImplementation((courtId, date, time) => {
      if (courtId === 1 && time === '09:00') {
        return { playerName: 'John Doe', courtId: 1, time: '09:00' }
      }
      return null
    })
    
    const props = {
      ...mockProps,
      getReservation: mockGetReservation
    }
    
    render(<CourtGrid {...props} />)
    
    // Should show the reservation in the grid
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should create unique test IDs for each time slot', () => {
    render(<CourtGrid {...mockProps} />)
    
    // Check a few specific test IDs exist
    expect(screen.getByTestId('time-slot-1-06:00')).toBeInTheDocument()
    expect(screen.getByTestId('time-slot-5-12:00')).toBeInTheDocument()
    expect(screen.getByTestId('time-slot-10-21:00')).toBeInTheDocument()
  })

  it('should maintain proper grid structure with headers', () => {
    render(<CourtGrid {...mockProps} />)
    
    const grid = screen.getByTestId('court-grid')
    
    // Grid should have the court-grid class for CSS styling
    expect(grid).toHaveClass('court-grid')
  })

  describe('Edge cases', () => {
    it('should handle empty reservations array', () => {
      const props = {
        ...mockProps,
        getReservation: vi.fn().mockReturnValue(null)
      }
      
      render(<CourtGrid {...props} />)
      
      // All slots should be available (no player names visible)
      expect(screen.queryByTestId('player-name')).not.toBeInTheDocument()
    })

    it('should handle date changes correctly', () => {
      const newDate = new Date('2024-03-16')
      const mockGetReservation = vi.fn()
      
      const { rerender } = render(<CourtGrid {...mockProps} getReservation={mockGetReservation} />)
      
      rerender(<CourtGrid {...mockProps} date={newDate} getReservation={mockGetReservation} />)
      
      // Should call getReservation with the new date
      expect(mockGetReservation).toHaveBeenCalledWith(expect.any(Number), newDate, expect.any(String))
    })

    it('should handle multiple reservations on same date', () => {
      const mockGetReservation = vi.fn()
      mockGetReservation.mockImplementation((courtId, date, time) => {
        const reservations = {
          '1-09:00': { playerName: 'Player 1' },
          '2-09:00': { playerName: 'Player 2' },
          '1-10:00': { playerName: 'Player 3' }
        }
        return reservations[`${courtId}-${time}`] || null
      })
      
      const props = {
        ...mockProps,
        getReservation: mockGetReservation
      }
      
      render(<CourtGrid {...props} />)
      
      expect(screen.getByText('Player 1')).toBeInTheDocument()
      expect(screen.getByText('Player 2')).toBeInTheDocument()
      expect(screen.getByText('Player 3')).toBeInTheDocument()
    })
  })
})