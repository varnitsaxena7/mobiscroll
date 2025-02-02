import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addMonths, subMonths } from "date-fns";

const Header = ({ onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    onDateChange(selectedDate);
  }, [selectedDate, onDateChange]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 select-none">
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Select date"
        >
          <CalendarIcon size={20} className="text-gray-500" />
          <span className="text-lg font-semibold">
            {format(selectedDate, "MMMM yyyy")}
          </span>
        </button>

        {showDatePicker && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              calendarClassName="rounded-lg border border-gray-200 shadow-md"
              dayClassName={(date) =>
                date.getDate() === selectedDate.getDate()
                  ? "bg-blue-600 text-white rounded-md"
                  : "hover:bg-gray-200"
              }
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <button
          onClick={handleTodayClick}
          className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mx-2 cursor-pointer"
        >
          Today
        </button>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {showDatePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default Header;
