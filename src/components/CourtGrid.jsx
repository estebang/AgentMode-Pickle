import PropTypes from 'prop-types'
import { COURTS, TIME_SLOTS } from '../utils/constants'
import TimeSlot from './TimeSlot'
import './CourtGrid.css'

const CourtGrid = ({ 
  date, 
  onBook, 
  onCancel,
  getReservation 
}) => {
  return (
    <div className="court-grid" data-testid="court-grid">
      <div className="grid-header">
        <div className="corner-cell"></div>
        {COURTS.map(court => (
          <div key={court.id} className="court-header">
            {court.name}
          </div>
        ))}
      </div>
      
      {TIME_SLOTS.map(time => (
        <div key={time} className="time-row">
          <div className="time-header">{time}</div>
          {COURTS.map(court => (
            <TimeSlot
              key={`${court.id}-${time}`}
              courtId={court.id}
              time={time}
              date={date}
              reservation={getReservation(court.id, date, time)}
              onBook={onBook}
              onCancel={onCancel}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

CourtGrid.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onBook: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  getReservation: PropTypes.func.isRequired
}

export default CourtGrid