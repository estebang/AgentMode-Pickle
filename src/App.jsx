import { useState } from 'react'
import { useReservations } from './hooks/useReservations'
import CourtGrid from './components/CourtGrid'
import DateNavigator from './components/DateNavigator'
import './App.css'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('daily')
  
  const {
    addReservation,
    removeReservation,
    getReservation
  } = useReservations()

  const handleBook = (courtId, date, time, playerName) => {
    addReservation(courtId, date, time, playerName)
  }

  const handleCancel = (courtId, date, time) => {
    removeReservation(courtId, date, time)
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'daily' ? 'weekly' : 'daily')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pickleball Court Reservations</h1>
        <div className="controls">
          <button 
            className={`view-toggle ${viewMode}`}
            onClick={toggleViewMode}
            data-testid="view-toggle"
          >
            {viewMode === 'daily' ? 'Switch to Weekly' : 'Switch to Daily'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <DateNavigator 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
        />
        
        {viewMode === 'daily' ? (
          <CourtGrid
            date={currentDate}
            onBook={handleBook}
            onCancel={handleCancel}
            getReservation={getReservation}
          />
        ) : (
          <div className="weekly-view" data-testid="weekly-view">
            <p>Weekly view coming soon...</p>
          </div>
        )}
        
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Booked</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
