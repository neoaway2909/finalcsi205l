import React, { useMemo, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { translations } from '../../constants/translations';

/**
 * Calendar Picker Component
 * Allows users to select a date for advance appointments
 *
 * @param {Date} currentDate - Currently displayed month/year
 * @param {Date} selectedDate - Currently selected date
 * @param {Function} onDateSelect - Callback when date is selected
 * @param {Function} onMonthNavigate - Callback to navigate months (-1 or +1)
 * @param {string} lang - Language ('th' or 'en')
 */
export const CalendarPicker = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthNavigate,
  lang = 'th'
}) => {
  const generateCalendar = useCallback((year, month) => {
    const monthData = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push({ date: daysInPrevMonth - firstDay + j + 1, isCurrentMonth: false });
        } else if (day > daysInMonth) {
          week.push({ date: day - daysInMonth, isCurrentMonth: false });
          day++;
        } else {
          const today = new Date();
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isUnavailable = (day === 10 || day === 15) && month === currentDate.getMonth() && year === currentDate.getFullYear();
          week.push({ date: day, isCurrentMonth: true, disabled: isPast, unavailable: isUnavailable });
          day++;
        }
      }
      monthData.push(week);
      if (day > daysInMonth) break;
    }
    return monthData;
  }, [currentDate]);

  const calendarMonth = useMemo(
    () => generateCalendar(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate, generateCalendar]
  );

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth && !day.disabled && !day.unavailable) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
      onDateSelect(newSelectedDate);
    }
  };

  const calendarDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="booking-calendar-container">
      <div className="calendar-header">
        <h3>{translations[lang].selectDate}</h3>
        <div className="calendar-nav">
          <button
            className="btn-icon"
            onClick={() => onMonthNavigate(-1)}
            disabled={currentDate.getFullYear() === 2025 && currentDate.getMonth() === 0}
          >
            <FaChevronLeft />
          </button>
          <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button
            className="btn-icon"
            onClick={() => onMonthNavigate(1)}
            disabled={currentDate.getFullYear() === 2027 && currentDate.getMonth() === 11}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {calendarDays.map(day => (
          <div key={day} className="calendar-day">{day}</div>
        ))}
        {calendarMonth.flat().map((day, index) => (
          <div
            key={index}
            className={`calendar-date ${day.isCurrentMonth ? '' : 'not-current-month'} ${
              selectedDate &&
              day.isCurrentMonth &&
              selectedDate.getDate() === day.date &&
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear()
                ? 'selected'
                : ''
            } ${day.disabled ? 'disabled' : ''} ${day.unavailable ? 'unavailable' : ''}`}
            onClick={() => handleDateSelect(day)}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );
};
