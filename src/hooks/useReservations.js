import { useState, useCallback } from 'react'
import { formatDate } from '../utils/constants'

export const useReservations = () => {
  const [reservations, setReservations] = useState(new Map())

  const getReservationKey = useCallback((courtId, date, time) => {
    return `${courtId}-${formatDate(date)}-${time}`
  }, [])

  const addReservation = useCallback((courtId, date, time, playerName) => {
    const key = getReservationKey(courtId, date, time)
    setReservations(prev => new Map(prev).set(key, {
      courtId,
      date: formatDate(date),
      time,
      playerName,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
  }, [getReservationKey])

  const removeReservation = useCallback((courtId, date, time) => {
    const key = getReservationKey(courtId, date, time)
    setReservations(prev => {
      const newReservations = new Map(prev)
      newReservations.delete(key)
      return newReservations
    })
  }, [getReservationKey])

  const getReservation = useCallback((courtId, date, time) => {
    const key = getReservationKey(courtId, date, time)
    return reservations.get(key)
  }, [reservations, getReservationKey])

  const isSlotAvailable = useCallback((courtId, date, time) => {
    return !getReservation(courtId, date, time)
  }, [getReservation])

  const getReservationsForDate = useCallback((date) => {
    const dateStr = formatDate(date)
    return Array.from(reservations.values()).filter(reservation => 
      reservation.date === dateStr
    )
  }, [reservations])

  return {
    reservations: Array.from(reservations.values()),
    addReservation,
    removeReservation,
    getReservation,
    isSlotAvailable,
    getReservationsForDate
  }
}