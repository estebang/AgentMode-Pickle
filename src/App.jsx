import { useState } from 'react'
import './App.css'

const NUM_COURTS = 10;
const today = new Date();

function getWeekDates(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function App() {
  const [view, setView] = useState('daily'); // 'daily' or 'weekly'
  const [selectedDate, setSelectedDate] = useState(today);

  // Placeholder reservation data
  const reservations = {};

  const handlePrev = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (view === 'daily' ? -1 : -7));
      return d;
    });
  };
  const handleNext = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (view === 'daily' ? 1 : 7));
      return d;
    });
  };

  return (
    <div className="container">
      <h1>Pickleball Court Reservations</h1>
      <div className="view-toggle">
        <button onClick={() => setView('daily')} disabled={view === 'daily'}>Daily</button>
        <button onClick={() => setView('weekly')} disabled={view === 'weekly'}>Weekly</button>
      </div>
      <div className="date-nav">
        <button onClick={handlePrev}>Prev</button>
        <span style={{ margin: '0 1rem' }}>
          {view === 'daily' ? formatDate(selectedDate) :
            `${formatDate(getWeekDates(selectedDate)[0])} - ${formatDate(getWeekDates(selectedDate)[6])}`}
        </span>
        <button onClick={handleNext}>Next</button>
      </div>
      <div className="schedule">
        {view === 'daily' ? (
          <DailySchedule date={selectedDate} reservations={reservations} />
        ) : (
          <WeeklySchedule weekDates={getWeekDates(selectedDate)} reservations={reservations} />
        )}
      </div>
    </div>
  );
}

function DailySchedule({ date, reservations }) {
  return (
    <div>
      <h2>Daily View: {date.toDateString()}</h2>
      <table>
        <thead>
          <tr>
            <th>Court</th>
            <th>Reservations</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: NUM_COURTS }, (_, i) => (
            <tr key={i}>
              <td>Court {i + 1}</td>
              <td>(none)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklySchedule({ weekDates, reservations }) {
  return (
    <div>
      <h2>Weekly View</h2>
      <table>
        <thead>
          <tr>
            <th>Court</th>
            {weekDates.map((d, idx) => (
              <th key={idx}>{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: NUM_COURTS }, (_, i) => (
            <tr key={i}>
              <td>Court {i + 1}</td>
              {weekDates.map((d, idx) => (
                <td key={idx}>(none)</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App
