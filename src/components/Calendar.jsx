import React, { useState, useEffect } from "react";
import { getDaysInMonth, format, isToday, addDays } from "date-fns"; // Import addDays
import Header from "./Header";

// Utility function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const GridRow = React.memo(
  ({
    resource,
    daysInMonth,
    onSelectCells,
    selectedCells,
    events,
    onMoveEvent,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startCell, setStartCell] = useState(null);
    const [endCell, setEndCell] = useState(null);
    const [draggedEvent, setDraggedEvent] = useState(null); // Track the event being dragged

    const handleMouseDown = (index, event) => {
      if (event) {
        // If clicking on an event, start dragging the event
        setDraggedEvent(event);
        setIsDragging(true);
        setStartCell(index);
        setEndCell(index);
      } else {
        // Otherwise, start selecting cells
        setIsDragging(true);
        setStartCell(index);
        setEndCell(index);
      }
    };

    const handleMouseMove = (index) => {
      if (isDragging) {
        if (draggedEvent) {
          // If dragging an event, update the end cell
          setEndCell(index);
        } else {
          // If selecting cells, update the end cell
          setEndCell(index);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (draggedEvent) {
          // Calculate the number of days moved
          const daysMoved = endCell - startCell;
          // Move the event
          onMoveEvent(draggedEvent.id, daysMoved);
          setDraggedEvent(null); // Reset the dragged event
        } else {
          // Handle cell selection
          onSelectCells(resource.id, startCell, endCell);
        }
      }
    };

    const getEventForCell = (index) => {
      const cellDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        index + 1
      );
      return events.find((event) => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        return cellDate >= eventStartDate && cellDate <= eventEndDate;
      });
    };

    return (
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `200px repeat(${daysInMonth}, 80px)`,
        }}
      >
        <div className="border border-green-400 h-[60px] flex items-center justify-center sticky left-0 z-30 bg-green-200">
          {resource.name}
        </div>
        {[...Array(daysInMonth)].map((_, index) => {
          const event = getEventForCell(index);
          const isSelected =
            selectedCells &&
            selectedCells.resourceId === resource.id &&
            index >= Math.min(startCell, endCell) &&
            index <= Math.max(startCell, endCell);

          return (
            <div
              key={index}
              className={`border border-indigo-400 h-[60px] ${
                isSelected
                  ? "bg-blue-300"
                  : event
                  ? "bg-opacity-50"
                  : "bg-indigo-200"
              }`}
              style={{ backgroundColor: event ? event.color : undefined }}
              onMouseDown={() => handleMouseDown(index, event)}
              onMouseMove={() => handleMouseMove(index)}
              onMouseUp={handleMouseUp}
            >
              {event && <div className="p-1 text-sm">{event.name}</div>}
            </div>
          );
        })}
      </div>
    );
  }
);

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(currentDate);
  const [resources, setResources] = useState(() => {
    const savedResources = localStorage.getItem("resources");
    return savedResources
      ? JSON.parse(savedResources)
      : [{ id: 1, name: "Resource A" }];
  });
  const [selectedCells, setSelectedCells] = useState(null);
  const [events, setEvents] = useState([]); // State to store events

  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
  }, [resources]);

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const addResource = () => {
    const newResource = {
      id: resources.length + 1,
      name: `Resource ${String.fromCharCode(65 + resources.length)}`,
    };
    setResources([...resources, newResource]);
  };

  const handleSelectCells = (resourceId, startCell, endCell) => {
    setSelectedCells({ resourceId, startCell, endCell });
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      startCell + 1
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      endCell + 1
    );
    const eventName = prompt("Enter event name:");
    if (eventName) {
      const newEvent = {
        id: Date.now(),
        resourceId,
        name: eventName,
        startDate,
        endDate,
        color: getRandomColor(), // Assign a random color to the event
      };
      setEvents([...events, newEvent]); // Add the new event to the events state
    }
  };

  const handleMoveEvent = (eventId, daysMoved) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          // Update the event's start and end dates
          const newStartDate = addDays(new Date(event.startDate), daysMoved);
          const newEndDate = addDays(new Date(event.endDate), daysMoved);
          return {
            ...event,
            startDate: newStartDate,
            endDate: newEndDate,
          };
        }
        return event;
      })
    );
  };

  const renderHeaderCells = () => {
    return [...Array(daysInMonth)].map((_, index) => {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        index + 1
      );
      const weekdayName = format(dayDate, "EEE");
      const dayNumber = index + 1;
      const isCurrentDate = isToday(dayDate);

      return (
        <div
          key={index}
          className={`border border-red-400 h-[30px] flex flex-row gap-2 items-center justify-center ${
            isCurrentDate ? "bg-yellow-200" : "bg-red-200"
          }`}
        >
          <div>{weekdayName}</div>
          <div>{dayNumber}</div>
        </div>
      );
    });
  };

  return (
    <div className="relative h-screen flex flex-col">
      <div className="w-full bg-white">
        <Header onDateChange={handleDateChange} />
      </div>

      <div className="overflow-auto flex-1">
        <div className="relative">
          {/* Header Row */}
          <div
            className="sticky top-0 grid min-w-max bg-white z-40"
            style={{
              gridTemplateColumns: `200px repeat(${daysInMonth}, 80px)`,
            }}
          >
            <div className="border border-gray-400 h-[30px] flex items-center justify-center sticky left-0 z-50 bg-white">
              Header
            </div>
            {renderHeaderCells()}
          </div>

          {/* Grid Rows */}
          {resources.map((resource) => (
            <GridRow
              key={resource.id}
              resource={resource}
              daysInMonth={daysInMonth}
              onSelectCells={handleSelectCells}
              selectedCells={selectedCells}
              events={events.filter(
                (event) => event.resourceId === resource.id
              )} // Pass events for the current resource
              onMoveEvent={handleMoveEvent} // Pass the move event handler
            />
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={addResource}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Resource
        </button>
      </div>
    </div>
  );
};

export default Calendar;
