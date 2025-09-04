import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReservations } from '../hooks/useReservations'

describe('useReservations', () => {
  let hook

  beforeEach(() => {
    const { result } = renderHook(() => useReservations())
    hook = result
  })

  it('should initialize with empty reservations', () => {
    expect(hook.current.reservations).toEqual([])
  })

  describe('addReservation', () => {
    it('should add a new reservation', () => {
      const date = new Date('2024-03-15')
      const courtId = 1
      const time = '09:00'
      const playerName = 'John Doe'

      act(() => {
        hook.current.addReservation(courtId, date, time, playerName)
      })

      expect(hook.current.reservations).toHaveLength(1)
      expect(hook.current.reservations[0]).toMatchObject({
        courtId,
        date: '2024-03-15',
        time,
        playerName
      })
    })

    it('should generate unique IDs for reservations', () => {
      const date = new Date('2024-03-15')

      act(() => {
        hook.current.addReservation(1, date, '09:00', 'John')
        hook.current.addReservation(2, date, '10:00', 'Jane')
      })

      const reservations = hook.current.reservations
      expect(reservations).toHaveLength(2)
      expect(reservations[0].id).not.toBe(reservations[1].id)
      expect(reservations[0].id).toBeTruthy()
      expect(reservations[1].id).toBeTruthy()
    })

    it('should handle multiple reservations for different courts at same time', () => {
      const date = new Date('2024-03-15')
      const time = '09:00'

      act(() => {
        hook.current.addReservation(1, date, time, 'Player 1')
        hook.current.addReservation(2, date, time, 'Player 2')
      })

      expect(hook.current.reservations).toHaveLength(2)
      expect(hook.current.isSlotAvailable(1, date, time)).toBe(false)
      expect(hook.current.isSlotAvailable(2, date, time)).toBe(false)
      expect(hook.current.isSlotAvailable(3, date, time)).toBe(true)
    })
  })

  describe('removeReservation', () => {
    beforeEach(() => {
      const date = new Date('2024-03-15')
      act(() => {
        hook.current.addReservation(1, date, '09:00', 'John Doe')
        hook.current.addReservation(2, date, '10:00', 'Jane Smith')
      })
    })

    it('should remove an existing reservation', () => {
      const date = new Date('2024-03-15')

      act(() => {
        hook.current.removeReservation(1, date, '09:00')
      })

      expect(hook.current.reservations).toHaveLength(1)
      expect(hook.current.reservations[0].playerName).toBe('Jane Smith')
    })

    it('should not affect other reservations when removing one', () => {
      const date = new Date('2024-03-15')

      act(() => {
        hook.current.removeReservation(1, date, '09:00')
      })

      expect(hook.current.isSlotAvailable(1, date, '09:00')).toBe(true)
      expect(hook.current.isSlotAvailable(2, date, '10:00')).toBe(false)
    })

    it('should handle removing non-existent reservation gracefully', () => {
      const date = new Date('2024-03-15')
      const initialLength = hook.current.reservations.length

      act(() => {
        hook.current.removeReservation(5, date, '15:00')
      })

      expect(hook.current.reservations).toHaveLength(initialLength)
    })
  })

  describe('getReservation', () => {
    beforeEach(() => {
      const date = new Date('2024-03-15')
      act(() => {
        hook.current.addReservation(1, date, '09:00', 'John Doe')
      })
    })

    it('should return reservation for valid slot', () => {
      const date = new Date('2024-03-15')
      const reservation = hook.current.getReservation(1, date, '09:00')

      expect(reservation).toBeTruthy()
      expect(reservation.playerName).toBe('John Doe')
      expect(reservation.courtId).toBe(1)
    })

    it('should return undefined for empty slot', () => {
      const date = new Date('2024-03-15')
      const reservation = hook.current.getReservation(2, date, '09:00')

      expect(reservation).toBeUndefined()
    })

    it('should return undefined for different date', () => {
      const differentDate = new Date('2024-03-16')
      const reservation = hook.current.getReservation(1, differentDate, '09:00')

      expect(reservation).toBeUndefined()
    })
  })

  describe('isSlotAvailable', () => {
    beforeEach(() => {
      const date = new Date('2024-03-15')
      act(() => {
        hook.current.addReservation(1, date, '09:00', 'John Doe')
      })
    })

    it('should return false for booked slot', () => {
      const date = new Date('2024-03-15')
      expect(hook.current.isSlotAvailable(1, date, '09:00')).toBe(false)
    })

    it('should return true for available slot', () => {
      const date = new Date('2024-03-15')
      expect(hook.current.isSlotAvailable(2, date, '09:00')).toBe(true)
      expect(hook.current.isSlotAvailable(1, date, '10:00')).toBe(true)
    })
  })

  describe('getReservationsForDate', () => {
    beforeEach(() => {
      const date1 = new Date('2024-03-15')
      const date2 = new Date('2024-03-16')

      act(() => {
        hook.current.addReservation(1, date1, '09:00', 'John Doe')
        hook.current.addReservation(2, date1, '10:00', 'Jane Smith')
        hook.current.addReservation(1, date2, '09:00', 'Bob Wilson')
      })
    })

    it('should return all reservations for a specific date', () => {
      const date1 = new Date('2024-03-15')
      const reservations = hook.current.getReservationsForDate(date1)

      expect(reservations).toHaveLength(2)
      expect(reservations.map(r => r.playerName)).toContain('John Doe')
      expect(reservations.map(r => r.playerName)).toContain('Jane Smith')
    })

    it('should return empty array for date with no reservations', () => {
      const emptyDate = new Date('2024-03-20')
      const reservations = hook.current.getReservationsForDate(emptyDate)

      expect(reservations).toEqual([])
    })

    it('should not return reservations from other dates', () => {
      const date2 = new Date('2024-03-16')
      const reservations = hook.current.getReservationsForDate(date2)

      expect(reservations).toHaveLength(1)
      expect(reservations[0].playerName).toBe('Bob Wilson')
    })
  })
})