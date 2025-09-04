import { describe, it, expect, beforeEach } from 'vitest'
import { formatDate, formatTime, getWeekDates, COURTS, TIME_SLOTS, RESERVATION_STATUS } from '../utils/constants'

describe('Constants', () => {
  describe('COURTS', () => {
    it('should have 10 courts', () => {
      expect(COURTS).toHaveLength(10)
    })

    it('should have courts with sequential IDs starting from 1', () => {
      COURTS.forEach((court, index) => {
        expect(court.id).toBe(index + 1)
        expect(court.name).toBe(`Court ${index + 1}`)
      })
    })
  })

  describe('TIME_SLOTS', () => {
    it('should have proper time slots from 6 AM to 9 PM', () => {
      expect(TIME_SLOTS).toHaveLength(16)
      expect(TIME_SLOTS[0]).toBe('06:00')
      expect(TIME_SLOTS[TIME_SLOTS.length - 1]).toBe('21:00')
    })

    it('should have hourly intervals', () => {
      for (let i = 0; i < TIME_SLOTS.length - 1; i++) {
        const current = parseInt(TIME_SLOTS[i].split(':')[0])
        const next = parseInt(TIME_SLOTS[i + 1].split(':')[0])
        expect(next - current).toBe(1)
      }
    })
  })

  describe('RESERVATION_STATUS', () => {
    it('should have all required status values', () => {
      expect(RESERVATION_STATUS.AVAILABLE).toBe('available')
      expect(RESERVATION_STATUS.BOOKED).toBe('booked')
      expect(RESERVATION_STATUS.BLOCKED).toBe('blocked')
    })
  })
})

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date('2024-03-15T10:30:00Z')
      expect(formatDate(date)).toBe('2024-03-15')
    })

    it('should handle different dates correctly', () => {
      expect(formatDate(new Date('2024-01-01T00:00:00Z'))).toBe('2024-01-01')
      expect(formatDate(new Date('2024-12-31T23:59:59Z'))).toBe('2024-12-31')
    })
  })

  describe('formatTime', () => {
    it('should format 24-hour time to 12-hour format', () => {
      expect(formatTime('09:00')).toBe('9:00 AM')
      expect(formatTime('15:00')).toBe('3:00 PM')
      expect(formatTime('00:00')).toBe('12:00 AM')
      expect(formatTime('12:00')).toBe('12:00 PM')
    })

    it('should handle minutes correctly', () => {
      expect(formatTime('09:30')).toBe('9:30 AM')
      expect(formatTime('15:45')).toBe('3:45 PM')
    })
  })

  describe('getWeekDates', () => {
    let startDate

    beforeEach(() => {
      startDate = new Date('2024-03-11') // Monday
    })

    it('should return 7 consecutive dates', () => {
      const dates = getWeekDates(startDate)
      expect(dates).toHaveLength(7)
      
      for (let i = 0; i < dates.length - 1; i++) {
        const current = dates[i].getDate()
        const next = dates[i + 1].getDate()
        expect(next - current).toBe(1)
      }
    })

    it('should start from the provided date', () => {
      const dates = getWeekDates(startDate)
      expect(dates[0].getDate()).toBe(startDate.getDate())
    })

    it('should handle month boundaries correctly', () => {
      const endOfMonth = new Date('2024-03-29') // Friday
      const dates = getWeekDates(endOfMonth)
      
      expect(dates).toHaveLength(7)
      expect(dates[0].getDate()).toBe(29)
      expect(dates[6].getDate()).toBe(4) // Should be April 4th
      expect(dates[6].getMonth()).toBe(3) // April is month 3 (0-based)
    })
  })
})