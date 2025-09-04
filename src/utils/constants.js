export const COURTS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Court ${i + 1}`
}))

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
]

export const RESERVATION_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BLOCKED: 'blocked'
}

export const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

export const getWeekDates = (startDate) => {
  const dates = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}