import { useState } from 'react';
import { translations } from '../constants/translations';

const CustomCalendar = ({ lang, unavailability = [], onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const formatTime = (timeString, locale) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    let formattedTime = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    if (locale === 'th-TH') {
      formattedTime += ' น.'; // Add ' น.' for Thai locale
    }
    return formattedTime;
  };

  const toLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const hasUnavailability = (date) => {
    const dateString = toLocalISOString(date);
    return unavailability.some(item => item.date === dateString);
  };
  
  const getUnavailabilityForDate = (date) => {
    const dateString = toLocalISOString(date);
    return unavailability.filter(item => item.date === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (date) => {
    if (hasUnavailability(date)) {
        setSelectedDate(date);
    } else {
        setSelectedDate(null);
    }
  }

  const weekDays = lang === 'th' ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="calendar-container">
        <div className="header">
          <button onClick={handlePrevMonth}>&lt;</button>
          <h2>{currentDate.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="weekdays">
          {weekDays.map(d => <div key={d} className="weekday">{d}</div>)}
        </div>
        <div className="days-grid">
          {days.map((d, i) => (
            <div
              key={i}
              className={`day-cell ${d.getMonth() !== currentDate.getMonth() ? 'padding-day' : ''} ${isToday(d) ? 'today' : ''} ${hasUnavailability(d) ? 'has-event' : ''} ${selectedDate && d.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
              onClick={() => handleDayClick(d)}
            >
              <span>{d.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
      
      {selectedDate && (
        <div className="details-pane">
            <h3 className="details-header">
                {translations[lang]?.yourUnavailability || 'Your Unavailable Times'} on {selectedDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <ul className="details-list">
                {getUnavailabilityForDate(selectedDate).map(item => (
                    <li key={item.id} className="detail-item">
                        <span>{formatTime(item.startTime, lang === 'th' ? 'th-TH' : 'en-US')} - {formatTime(item.endTime, lang === 'th' ? 'th-TH' : 'en-US')}</span>
                        <button className="delete-btn" onClick={() => onDelete(item)}>
                            {translations[lang]?.delete || 'Delete'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          background-color: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .header button {
          background: none;
          border: 1px solid #cbd5e1;
          border-radius: 9999px;
          width: 2rem;
          height: 2rem;
          cursor: pointer;
        }
        .weekdays, .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }
        .weekday {
          font-weight: 600;
          color: #4a5568;
          padding: 0.5rem 0;
        }
        .day-cell {
          padding: 0.25rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 1px solid #e2e8f0;
          transition: background-color 0.2s;
        }
        .day-cell span {
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
        }
        .day-cell.padding-day {
          color: #a0aec0;
        }
        .day-cell.today span {
          background-color: #3b82f6;
          color: white;
        }
        .day-cell.has-event {
          cursor: pointer;
          background-color: rgba(239, 68, 68, 0.1);
          font-weight: bold;
        }
        .day-cell.has-event:hover span {
          background-color: #ef4444;
          color: white;
        }
        .day-cell.selected span {
            background-color: #ef4444;
            color: white;
        }
        .details-pane {
            margin-top: 1.5rem;
            padding: 1rem;
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
        }
        .details-header {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        .details-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .delete-btn {
            background-color: #ef4444;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
            cursor: pointer;
        }
        .delete-btn:hover {
            background-color: #dc2626;
        }
      `}</style>
    </>
  );
};

export default CustomCalendar;
