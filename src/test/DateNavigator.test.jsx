import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateNavigator from '../components/DateNavigator'

describe('DateNavigator', () => {
  const mockOnDateChange = vi.fn()
  
  const defaultProps = {
    currentDate: new Date('2024-03-15'), // Friday
    onDateChange: mockOnDateChange,
    viewMode: 'daily'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Daily view mode', () => {
    it('should render correctly in daily mode', () => {
      render(<DateNavigator {...defaultProps} />)
      
      expect(screen.getByTestId('date-navigator')).toBeInTheDocument()
      expect(screen.getByTestId('date-display')).toHaveTextContent('Friday, March 15, 2024')
      expect(screen.getByTestId('prev-button')).toBeInTheDocument()
      expect(screen.getByTestId('next-button')).toBeInTheDocument()
      expect(screen.getByTestId('today-button')).toBeInTheDocument()
    })

    it('should navigate to previous day', async () => {
      const user = userEvent.setup()
      render(<DateNavigator {...defaultProps} />)
      
      await user.click(screen.getByTestId('prev-button'))
      
      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(14) // March 14
    })

    it('should navigate to next day', async () => {
      const user = userEvent.setup()
      render(<DateNavigator {...defaultProps} />)
      
      await user.click(screen.getByTestId('next-button'))
      
      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(16) // March 16
    })

    it('should have correct aria-labels for daily navigation', () => {
      render(<DateNavigator {...defaultProps} />)
      
      expect(screen.getByTestId('prev-button')).toHaveAttribute('aria-label', 'Go to previous day')
      expect(screen.getByTestId('next-button')).toHaveAttribute('aria-label', 'Go to next day')
    })
  })

  describe('Weekly view mode', () => {
    const weeklyProps = {
      ...defaultProps,
      viewMode: 'weekly'
    }

    it('should render correctly in weekly mode', () => {
      render(<DateNavigator {...weeklyProps} />)
      
      // Should show week range
      expect(screen.getByTestId('date-display')).toHaveTextContent('Mar 15 - Mar 21, 2024')
    })

    it('should navigate to previous week', async () => {
      const user = userEvent.setup()
      render(<DateNavigator {...weeklyProps} />)
      
      await user.click(screen.getByTestId('prev-button'))
      
      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(8) // March 8 (7 days earlier)
    })

    it('should navigate to next week', async () => {
      const user = userEvent.setup()
      render(<DateNavigator {...weeklyProps} />)
      
      await user.click(screen.getByTestId('next-button'))
      
      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(22) // March 22 (7 days later)
    })

    it('should have correct aria-labels for weekly navigation', () => {
      render(<DateNavigator {...weeklyProps} />)
      
      expect(screen.getByTestId('prev-button')).toHaveAttribute('aria-label', 'Go to previous week')
      expect(screen.getByTestId('next-button')).toHaveAttribute('aria-label', 'Go to next week')
    })
  })

  describe('Today button', () => {
    it('should navigate to today when clicked', async () => {
      const user = userEvent.setup()
      const pastDate = new Date('2024-01-01')
      const props = { ...defaultProps, currentDate: pastDate }
      
      render(<DateNavigator {...props} />)
      
      await user.click(screen.getByTestId('today-button'))
      
      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      
      // Should be today's date (within a reasonable tolerance)
      const now = new Date()
      const timeDiff = Math.abs(calledDate.getTime() - now.getTime())
      expect(timeDiff).toBeLessThan(60000) // Within 1 minute
    })

    it('should display "Today" text', () => {
      render(<DateNavigator {...defaultProps} />)
      
      expect(screen.getByTestId('today-button')).toHaveTextContent('Today')
    })
  })

  describe('Date formatting', () => {
    it('should format different dates correctly in daily mode', () => {
      const dates = [
        { date: new Date('2024-01-01'), expected: 'Monday, January 1, 2024' },
        { date: new Date('2024-12-31'), expected: 'Tuesday, December 31, 2024' },
        { date: new Date('2024-06-15'), expected: 'Saturday, June 15, 2024' }
      ]

      dates.forEach(({ date, expected }) => {
        const { unmount } = render(<DateNavigator {...defaultProps} currentDate={date} />)
        expect(screen.getByTestId('date-display')).toHaveTextContent(expected)
        unmount()
      })
    })

    it('should format week ranges correctly in weekly mode', () => {
      const testCases = [
        { 
          date: new Date('2024-03-01'), // Friday
          expected: 'Mar 1 - Mar 7, 2024' 
        },
        { 
          date: new Date('2024-12-29'), // Sunday 
          expected: 'Dec 29 - Jan 4, 2025' // Crosses year boundary
        }
      ]

      testCases.forEach(({ date, expected }) => {
        const { unmount } = render(
          <DateNavigator {...defaultProps} currentDate={date} viewMode="weekly" />
        )
        expect(screen.getByTestId('date-display')).toHaveTextContent(expected)
        unmount()
      })
    })
  })

  describe('Month boundary navigation', () => {
    it('should handle navigating across month boundaries in daily mode', async () => {
      const user = userEvent.setup()
      const endOfMonth = new Date('2024-03-31') // Last day of March
      
      render(<DateNavigator {...defaultProps} currentDate={endOfMonth} />)
      
      await user.click(screen.getByTestId('next-button'))
      
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(1) // April 1st
      expect(calledDate.getMonth()).toBe(3) // April (0-indexed)
    })

    it('should handle navigating across month boundaries in weekly mode', async () => {
      const user = userEvent.setup()
      const endOfMonth = new Date('2024-03-29') // Near end of March
      
      render(<DateNavigator {...defaultProps} currentDate={endOfMonth} viewMode="weekly" />)
      
      await user.click(screen.getByTestId('next-button'))
      
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(5) // April 5th (7 days later)
      expect(calledDate.getMonth()).toBe(3) // April
    })
  })

  describe('Year boundary navigation', () => {
    it('should handle navigating across year boundaries', async () => {
      const user = userEvent.setup()
      const endOfYear = new Date('2024-12-31')
      
      render(<DateNavigator {...defaultProps} currentDate={endOfYear} />)
      
      await user.click(screen.getByTestId('next-button'))
      
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getDate()).toBe(1) // January 1st
      expect(calledDate.getMonth()).toBe(0) // January
      expect(calledDate.getFullYear()).toBe(2025)
    })
  })
})