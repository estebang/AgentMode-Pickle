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

// Generate mock reservations: { [date]: { [court]: [ { start, end, name } ] } }
function generateMockReservations() {
  const data = {};
  const names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Drew", "Sam", "Avery"];
  const startHour = 8; // 8am
  const endHour = 20; // 8pm
  const slotMinutes = 90;
  const today = new Date();
  for (let dayOffset = -3; dayOffset <= 10; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = formatDate(date);
    data[dateStr] = {};
    for (let court = 1; court <= NUM_COURTS; court++) {
      data[dateStr][court] = [];
      let slotStart = new Date(date);
      slotStart.setHours(startHour, 0, 0, 0);
      while (slotStart.getHours() < endHour) {
        if (Math.random() < 0.5) { // 50% chance of a reservation
          const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60000);
          const name = names[Math.floor(Math.random() * names.length)];
          data[dateStr][court].push({
            start: slotStart.toTimeString().slice(0,5),
            end: slotEnd.toTimeString().slice(0,5),
            name
          });
        }
        slotStart = new Date(slotStart.getTime() + slotMinutes * 60000);
      }
    }
  }
  return data;
}

function App() {
  const [view, setView] = useState('daily'); // 'daily' or 'weekly'
  const [selectedDate, setSelectedDate] = useState(today);
  const [reservations] = useState(generateMockReservations());

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
  const dateStr = formatDate(date);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ court: 1, start: '08:00', name: '' });
  const slotMinutes = 90;
  const startHour = 8;
  const endHour = 20;
  // Generate time slots
  const slots = [];
  let slotStart = new Date(date);
  slotStart.setHours(startHour, 0, 0, 0);
  while (slotStart.getHours() < endHour) {
    const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60000);
    slots.push({
      start: slotStart.toTimeString().slice(0, 5),
      end: slotEnd.toTimeString().slice(0, 5)
    });
    slotStart = slotEnd;
  }

  // Add reservation handler (mock, does not persist)
  const handleAdd = (e) => {
    e.preventDefault();
    alert(`Reservation added!\nCourt: ${form.court}\nTime: ${form.start}\nPlayer: ${form.name}`);
    setShowForm(false);
    setForm({ court: 1, start: '08:00', name: '' });
  };

  return (
    <div>
      <h2>Daily View: {date.toDateString()}</h2>
      <button onClick={() => setShowForm(f => !f)} style={{ marginBottom: 12 }}>
        {showForm ? 'Cancel' : 'Add Reservation'}
      </button>
      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: 16, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
          <label>
            Court:
            <select value={form.court} onChange={e => setForm(f => ({ ...f, court: Number(e.target.value) }))}>
              {Array.from({ length: NUM_COURTS }, (_, i) => (
                <option key={i+1} value={i+1}>Court {i+1}</option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: 12 }}>
            Time:
            <select value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}>
              {slots.map((s, idx) => (
                <option key={idx} value={s.start}>{s.start} - {s.end}</option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: 12 }}>
            Player Name:
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ marginLeft: 4 }} />
          </label>
          <button type="submit" style={{ marginLeft: 12 }}>Add</button>
        </form>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 700, background: '#fff' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Time</th>
              {Array.from({ length: NUM_COURTS }, (_, i) => (
                <th key={i} style={{ textAlign: 'center', padding: 8 }}>Court {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, sIdx) => (
              <tr key={sIdx}>
                <td style={{ padding: 8, fontWeight: 500 }}>{slot.start} - {slot.end}</td>
                {Array.from({ length: NUM_COURTS }, (_, cIdx) => {
                  const courtRes = reservations[dateStr] && reservations[dateStr][cIdx + 1] ? reservations[dateStr][cIdx + 1] : [];
                  const res = courtRes.find(r => r.start === slot.start);
                  return (
                    <td key={cIdx} style={{ padding: 8, background: res ? '#d1e7dd' : '#f8f9fa', border: '1px solid #eee', minWidth: 90 }}>
                      {res ? (
                        <span>{res.name}</span>
                      ) : (
                        <span style={{ color: '#bbb' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              {weekDates.map((d, idx) => {
                const dateStr = formatDate(d);
                return (
                  <td key={idx}>
                    {reservations[dateStr] && reservations[dateStr][i+1] && reservations[dateStr][i+1].length > 0 ? (
                      reservations[dateStr][i+1].map((r, ridx) => (
                        <div key={ridx} style={{ marginBottom: 4 }}>
                          {r.start} - {r.end}: {r.name}
                        </div>
                      ))
                    ) : <span>(none)</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App
