import PropTypes from 'prop-types'
import './DateNavigator.css'

const DateNavigator = ({ currentDate, onDateChange, viewMode }) => {
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() - 7)
    }
    onDateChange(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() + 1)
    } else {
      newDate.setDate(currentDate.getDate() + 7)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const formatDisplayDate = () => {
    if (viewMode === 'daily') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else {
      const endDate = new Date(currentDate)
      endDate.setDate(currentDate.getDate() + 6)
      return `${currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`
    }
  }

  return (
    <div className="date-navigator" data-testid="date-navigator">
      <button 
        className="nav-button"
        onClick={goToPrevious}
        aria-label={`Go to previous ${viewMode === 'daily' ? 'day' : 'week'}`}
        data-testid="prev-button"
      >
        ←
      </button>
      
      <div className="date-display" data-testid="date-display">
        {formatDisplayDate()}
      </div>
      
      <button 
        className="nav-button"
        onClick={goToNext}
        aria-label={`Go to next ${viewMode === 'daily' ? 'day' : 'week'}`}
        data-testid="next-button"
      >
        →
      </button>
      
      <button 
        className="today-button"
        onClick={goToToday}
        data-testid="today-button"
      >
        Today
      </button>
    </div>
  )
}

DateNavigator.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['daily', 'weekly']).isRequired
}

export default DateNavigator