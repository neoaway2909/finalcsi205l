import React from 'react';
import { translations } from '../../constants/translations';

/**
 * Time Slot Picker Component
 * Allows users to select a time slot for appointments
 *
 * @param {Array} timeSlots - Available time slots (strings or objects with label/value)
 * @param {string} selectedTime - Currently selected time
 * @param {Function} onTimeSelect - Callback when time is selected
 * @param {Object} bookedSlots - Object mapping time slots to booked status
 * @param {boolean} isInstantAppointment - Whether this is an instant appointment
 * @param {string} lang - Language ('th' or 'en')
 */
export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  bookedSlots = {},
  isInstantAppointment = false,
  lang = 'th'
}) => {
  if (!timeSlots || timeSlots.length === 0) {
    return null;
  }

  return (
    <div className="booking-time-container">
      <h3>{translations[lang].selectTime}</h3>
      <div className="time-slots-grid">
        {timeSlots.map(time => {
          const timeValue = typeof time === 'object' ? time.value : time;
          const timeLabel = typeof time === 'object' ? time.label : time;
          const isBooked = !isInstantAppointment && bookedSlots[timeValue];

          return (
            <div
              key={timeValue}
              className={`time-slot ${selectedTime === timeValue ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
              onClick={() => !isBooked && onTimeSelect(timeValue)}
              title={isBooked ? 'เวลานี้เต็มแล้ว' : ''}
            >
              {timeLabel}
              {isBooked && <span className="booked-badge">เต็ม</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
