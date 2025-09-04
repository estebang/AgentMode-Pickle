import PropTypes from 'prop-types'
import { formatTime } from '../utils/constants'
import './TimeSlot.css'

const TimeSlot = ({ 
  courtId, 
  time, 
  date, 
  reservation, 
  onBook, 
  onCancel,
  disabled = false 
}) => {
  const isBooked = !!reservation
  const formattedTime = formatTime(time)

  const handleClick = () => {
    if (disabled) return
    
    if (isBooked) {
      onCancel(courtId, date, time)
    } else {
      const playerName = prompt('Enter player name:')
      if (playerName?.trim()) {
        onBook(courtId, date, time, playerName.trim())
      }
    }
  }

  return (
    <button
      className={`time-slot ${isBooked ? 'booked' : 'available'} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      data-testid={`time-slot-${courtId}-${time}`}
      aria-label={
        isBooked 
          ? `${formattedTime} - Booked by ${reservation.playerName}. Click to cancel.`
          : `${formattedTime} - Available. Click to book.`
      }
    >
      <div className="time">{formattedTime}</div>
      {isBooked && (
        <div className="player-name" data-testid="player-name">
          {reservation.playerName}
        </div>
      )}
    </button>
  )
}

TimeSlot.propTypes = {
  courtId: PropTypes.number.isRequired,
  time: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  reservation: PropTypes.object,
  onBook: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default TimeSlot