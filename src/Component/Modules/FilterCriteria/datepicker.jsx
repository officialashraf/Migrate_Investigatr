import { useState, useRef, useEffect } from 'react';
import './date.module.css';
import AppButton from '../../Common/Buttton/button';
import PropTypes from 'prop-types';

const DatePicker = ({ onSubmit, initialDates, onClose }) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate);
  const [startDate, setStartDate] = useState(initialDates?.startDate || null);
  const [endDate, setEndDate] = useState(initialDates?.endDate || null);
  const [startTime, setStartTime] = useState(initialDates?.startTime || { hours: 0, minutes: 0 });
  const [endTime, setEndTime] = useState(initialDates?.endTime || { hours: 0, minutes: 0 });

  // State for dropdowns
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Refs for dropdown close handling
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  console.warn('initialDates', initialDates);

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Handle form submission
  const handleSubmit = () => {
    onSubmit({
      startDate,
      endDate,
      startTime,
      endTime
    });
  };

  console.log('handleSubmit', handleSubmit);

  // Handle form clearing
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime({ hours: 0, minutes: 0 });
    setEndTime({ hours: 0, minutes: 0 });
  };

  // Generate years for dropdown (10 years back and 10 years forward)
  const generateYears = () => {
    const currentYear = currentDate.getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days from previous month
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const allDays = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      allDays.push({
        day: prevMonthDays - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      allDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }

    // Add days from next month
    const remainingCells = 42 - allDays.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingCells; i++) {
      allDays.push({
        day: i,
        month: month + 1 > 11 ? 0 : month + 1,
        year: month + 1 > 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return allDays;
  };

  // Calendar navigation with dropdown support
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Year selection handler
  const handleYearSelect = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setShowYearDropdown(false);
  };

  // Month selection handler
  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex));
    setShowMonthDropdown(false);
  };

  // Date selection handler
  const handleDateClick = (day) => {
    const selectedDate = new Date(day.year, day.month, day.day);

    if (!startDate || (startDate && endDate) || selectedDate < startDate) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else {
      setEndDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Time handlers
  const incrementTime = (type, field) => {
    const updater = field === 'hours'
      ? (prev) => ({ ...prev, hours: (prev.hours + 1) % 24 })
      : (prev) => ({ ...prev, minutes: (prev.minutes + 30) % 60 });

    if (type === 'start') {
      setStartTime(updater);
    } else {
      setEndTime(updater);
    }
  };

  const decrementTime = (type, field) => {
    const updater = field === 'hours'
      ? (prev) => ({ ...prev, hours: (prev.hours - 1 + 24) % 24 })
      : (prev) => ({ ...prev, minutes: (prev.minutes - 30 + 60) % 60 });

    if (type === 'start') {
      setStartTime(updater);
    } else {
      setEndTime(updater);
    }
  };

  // Apply preset date ranges
  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  // Check if a day is in the selected range
  const isInRange = (day) => {
    if (!startDate || !endDate) return false;
    const date = new Date(day.year, day.month, day.day);
    return date > startDate && date < endDate;
  };

  // Check if a day is start or end date
  const isStartOrEndDate = (day) => {
    if (!startDate) return false;

    const date = new Date(day.year, day.month, day.day);
    if (startDate && date.getTime() === startDate.getTime()) return 'start';
    if (endDate && date.getTime() === endDate.getTime()) return 'end';

    return false;
  };

  // Format time with leading zeros
  const formatTwoDigits = (num) => num.toString().padStart(2, '0');

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-icon" onClick={onClose}>
          &times;
        </button>
        <div className="popup-content" style={{ backgroundColor: '#101D2B' }}>
          <div className="date-picker-container">
            <div className="date-picker-layout">
              <div className="presets-container">
                <button type="button" className="preset-option">Custom</button>
                <button type="button" className="preset-option" onClick={() => applyPreset(30)}>Last 30 Days</button>
                <button type="button" className="preset-option" onClick={() => applyPreset(90)}>Last 90 Days</button>
                <button type="button" className="preset-option" onClick={() => applyPreset(180)}>Last 6 months</button>
              </div>

              <div className="calendar-container">
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input type="text" id="startDate" name="startDate" value={formatDate(startDate)} readOnly />
                  </div>

                  <div className="date-input-group">
                    <label htmlFor="endDate">End Date</label>
                    <input id="endDate" type="text" value={formatDate(endDate)} readOnly />
                  </div>
                </div>

                <div className="time-selectors">
                  <div className="time-selector">
                    <div className="time-arrows">
                      <button
                        className="time-arrow up"
                        onClick={() => incrementTime('start', 'hours')}
                      >▲</button>
                      <span>{formatTwoDigits(startTime.hours)}</span>
                      <button
                        className="time-arrow down"
                        onClick={() => decrementTime('start', 'hours')}
                      >▼</button>
                    </div>

                    <span className="time-separator">:</span>

                    <div className="time-arrows">
                      <button
                        className="time-arrow up"
                        onClick={() => incrementTime('start', 'minutes')}
                      >▲</button>
                      <span>{formatTwoDigits(startTime.minutes)}</span>
                      <button
                        className="time-arrow down"
                        onClick={() => decrementTime('start', 'minutes')}
                      >▼</button>
                    </div>
                  </div>

                  <div className="time-selector">
                    <div className="time-arrows">
                      <button
                        className="time-arrow up"
                        onClick={() => incrementTime('end', 'hours')}
                      >▲</button>
                      <span>{formatTwoDigits(endTime.hours)}</span>
                      <button
                        className="time-arrow down"
                        onClick={() => decrementTime('end', 'hours')}
                      >▼</button>
                    </div>

                    <span className="time-separator">:</span>

                    <div className="time-arrows">
                      <button
                        className="time-arrow up"
                        onClick={() => incrementTime('end', 'minutes')}
                      >▲</button>
                      <span>{formatTwoDigits(endTime.minutes)}</span>
                      <button
                        className="time-arrow down"
                        onClick={() => decrementTime('end', 'minutes')}
                      >▼</button>
                    </div>
                  </div>
                </div>

                <div className="calendar-header">
                  <button className="calendar-nav" onClick={prevMonth}>❮</button>

                  <div className="current-month-selector" style={{ position: 'relative', display: 'flex', gap: '5px' }}>
                    {/* Month Dropdown */}
                    <div ref={monthDropdownRef} style={{ position: 'relative' }}>
                      <button
                        className="month-dropdown-trigger"
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ddd',
                          cursor: 'pointer',
                          padding: '5px 10px'
                        }}
                      >
                        {monthNames[currentMonth.getMonth()]} ▼
                      </button>

                      {showMonthDropdown && (
                        <div
                          className="month-dropdown"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: '#101D2B',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            width: '120px'
                          }}
                        >
                          {monthNames.map((month, index) => (
                            <div
                              key={month}
                              onClick={() => handleMonthSelect(index)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: '#ddd',
                                backgroundColor: index === currentMonth.getMonth() ? '#4a90e2' : 'transparent',
                                border: 'none',
                                width: '100%',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2a5a8a'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = index === currentMonth.getMonth() ? '#4a90e2' : 'transparent'}
                            >
                              {month}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Year Dropdown */}
                    <div ref={yearDropdownRef} style={{ position: 'relative' }}>
                      <button
                        className="year-dropdown-trigger"
                        onClick={() => setShowYearDropdown(!showYearDropdown)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ddd',
                          cursor: 'pointer',
                          padding: '5px 10px'
                        }}
                      >
                        {currentMonth.getFullYear()} ▼
                      </button>

                      {showYearDropdown && (
                        <div
                          className="year-dropdown"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: '#101D2B',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            width: '80px'
                          }}
                        >
                          {generateYears().map((year) => (
                            <div
                              key={year}
                              onClick={() => handleYearSelect(year)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: '#ddd',
                                backgroundColor: year === currentMonth.getFullYear() ? '#4a90e2' : 'transparent',
                                border: 'none',
                                width: '100%',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2a5a8a'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = year === currentMonth.getFullYear() ? '#4a90e2' : 'transparent'}
                            >
                              {year}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="calendar-nav" onClick={nextMonth}>❯</button>
                </div>

                <div className="calendar-grid">
                  {dayNames.map(day => (
                    <div className="day-name" key={day}>{day}</div>
                  ))}

                  {generateCalendarDays().map((day, index) => {
                    const rangeStatus = isStartOrEndDate(day);
                    const inRange = isInRange(day);

                    return (
                      <div
                        key={index}
                        className={`calendar-day 
                    ${!day.isCurrentMonth ? 'outside-month' : ''} 
                    ${rangeStatus === 'start' ? 'start-date' : ''} 
                    ${rangeStatus === 'end' ? 'end-date' : ''} 
                    ${inRange ? 'in-range' : ''}`
                        }
                      >
                        <button
                          onClick={() => handleDateClick(day)}
                          className="calendar-day-button"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            textAlign: 'center',
                            width: '100%',
                            fontSize: 'inherit',
                            color: day.isCurrentMonth ? '#ddd' : '#ddd',
                          }}
                          aria-label={`Select date: ${day.day}`}
                        >
                          {day.day}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="button-group" style={{ gap: '10px' }}>
                  <AppButton className="btn-clear" onClick={handleClear}>Clear</AppButton>
                  <AppButton className="btn-done" onClick={handleSubmit}>Done</AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DatePicker.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialDates: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    startTime: PropTypes.shape({
      hours: PropTypes.number,
      minutes: PropTypes.number
    }),
    endTime: PropTypes.shape({
      hours: PropTypes.number,
      minutes: PropTypes.number
    })
  }),
  onClose: PropTypes.func.isRequired
};

export default DatePicker;