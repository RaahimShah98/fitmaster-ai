// DateDropdownMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

interface DateDropdownProps {
  dates: string[];
  placeholder?: string;
  onChange?: (selectedDate: string) => void;
  className?: string;
}

const DateDropdownMenu: React.FC<DateDropdownProps> = ({
  dates,
  placeholder = 'Select a date',
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort dates (assuming DD-MM-YYYY format)
  const sortedDates = [...dates].sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-').map(Number);
    const [dayB, monthB, yearB] = b.split('-').map(Number);
    
    if (yearA !== yearB) return yearA - yearB;
    if (monthA !== monthB) return monthA - monthB;
    return  dayB - dayA;
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`relative w-64 font-sans ${className}`}
    >
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-500" />
          <span className={`${!selectedDate ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedDate || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 focus:outline-none"
          role="listbox"
          tabIndex={-1}
        >
          {sortedDates.map((date) => (
            <li
              key={date}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
                selectedDate === date ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => handleDateSelect(date)}
              role="option"
              aria-selected={selectedDate === date}
            >
              {date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DateDropdownMenu;