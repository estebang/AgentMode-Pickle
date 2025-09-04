import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeSlot from '../components/TimeSlot'

// Mock the prompt function
const mockPrompt = vi.fn()
global.prompt = mockPrompt

describe('TimeSlot', () => {
  const defaultProps = {
    courtId: 1,
    time: '09:00',
    date: new Date('2024-03-15'),
    onBook: vi.fn(),
    onCancel: vi.fn(),
    reservation: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Available slot', () => {
    it('should render available time slot correctly', () => {
      render(<TimeSlot {...defaultProps} />)
      
      expect(screen.getByTestId('time-slot-1-09:00')).toBeInTheDocument()
      expect(screen.getByText('9:00 AM')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveClass('available')
    })

    it('should have correct aria-label for available slot', () => {
      render(<TimeSlot {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '9:00 AM - Available. Click to book.')
    })

    it('should call onBook when clicked with valid player name', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue('John Doe')
      
      render(<TimeSlot {...defaultProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(mockPrompt).toHaveBeenCalledWith('Enter player name:')
      expect(defaultProps.onBook).toHaveBeenCalledWith(1, defaultProps.date, '09:00', 'John Doe')
    })

    it('should trim whitespace from player name', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue('  John Doe  ')
      
      render(<TimeSlot {...defaultProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(defaultProps.onBook).toHaveBeenCalledWith(1, defaultProps.date, '09:00', 'John Doe')
    })

    it('should not call onBook when user cancels prompt', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue(null)
      
      render(<TimeSlot {...defaultProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(mockPrompt).toHaveBeenCalled()
      expect(defaultProps.onBook).not.toHaveBeenCalled()
    })

    it('should not call onBook when user enters empty name', async () => {
      const user = userEvent.setup()
      mockPrompt.mockReturnValue('   ')
      
      render(<TimeSlot {...defaultProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(mockPrompt).toHaveBeenCalled()
      expect(defaultProps.onBook).not.toHaveBeenCalled()
    })
  })

  describe('Booked slot', () => {
    const bookedProps = {
      ...defaultProps,
      reservation: {
        courtId: 1,
        date: '2024-03-15',
        time: '09:00',
        playerName: 'Jane Smith',
        id: '123'
      }
    }

    it('should render booked time slot correctly', () => {
      render(<TimeSlot {...bookedProps} />)
      
      expect(screen.getByRole('button')).toHaveClass('booked')
      expect(screen.getByText('9:00 AM')).toBeInTheDocument()
      expect(screen.getByTestId('player-name')).toHaveTextContent('Jane Smith')
    })

    it('should have correct aria-label for booked slot', () => {
      render(<TimeSlot {...bookedProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '9:00 AM - Booked by Jane Smith. Click to cancel.')
    })

    it('should call onCancel when booked slot is clicked', async () => {
      const user = userEvent.setup()
      
      render(<TimeSlot {...bookedProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(defaultProps.onCancel).toHaveBeenCalledWith(1, defaultProps.date, '09:00')
    })
  })

  describe('Disabled slot', () => {
    const disabledProps = {
      ...defaultProps,
      disabled: true
    }

    it('should render disabled slot correctly', () => {
      render(<TimeSlot {...disabledProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled')
      expect(button).toBeDisabled()
    })

    it('should not call any handlers when disabled slot is clicked', async () => {
      const user = userEvent.setup()
      
      render(<TimeSlot {...disabledProps} />)
      
      await user.click(screen.getByRole('button'))
      
      expect(defaultProps.onBook).not.toHaveBeenCalled()
      expect(defaultProps.onCancel).not.toHaveBeenCalled()
      expect(mockPrompt).not.toHaveBeenCalled()
    })
  })

  describe('Time formatting', () => {
    it('should format different times correctly', () => {
      const times = [
        { input: '06:00', expected: '6:00 AM' },
        { input: '12:00', expected: '12:00 PM' },
        { input: '15:30', expected: '3:30 PM' },
        { input: '21:00', expected: '9:00 PM' }
      ]

      times.forEach(({ input, expected }) => {
        const { unmount } = render(<TimeSlot {...defaultProps} time={input} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle very long player names', () => {
      const longNameProps = {
        ...defaultProps,
        reservation: {
          courtId: 1,
          date: '2024-03-15',
          time: '09:00',
          playerName: 'This is a very long player name that might overflow',
          id: '123'
        }
      }

      render(<TimeSlot {...longNameProps} />)
      
      expect(screen.getByTestId('player-name')).toHaveTextContent('This is a very long player name that might overflow')
    })

    it('should handle special characters in player names', () => {
      const specialNameProps = {
        ...defaultProps,
        reservation: {
          courtId: 1,
          date: '2024-03-15',
          time: '09:00',
          playerName: 'José María Ñoño',
          id: '123'
        }
      }

      render(<TimeSlot {...specialNameProps} />)
      
      expect(screen.getByTestId('player-name')).toHaveTextContent('José María Ñoño')
    })
  })
})