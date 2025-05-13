import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import bookingService from '@/services/bookingService';
import React from 'react';

export default function TableVisualization({ restaurantId, tables }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [tableAvailability, setTableAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);

  // Available time slots
  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Create tables from props and fetch restaurant tables
  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    // Create tables from the tables object in props
    if (tables && Object.keys(tables).length > 0) {
      // Create a map to track used tableIds to ensure uniqueness
      const usedTableIds = new Set();
      const allTables = [];
      
      // Generate unique table IDs for each size and count
      let tableCounter = 1;
      Object.entries(tables).forEach(([size, count]) => {
        for (let i = 0; i < count; i++) {
          // Ensure tableId is unique
          while (usedTableIds.has(tableCounter)) {
            tableCounter++;
          }
          
          usedTableIds.add(tableCounter);
          allTables.push({
            tableId: tableCounter,
            size: parseInt(size),
            restaurantId: restaurantId
          });
          
          tableCounter++;
        }
      });
      
      console.log('TableVisualization - Input data:', { restaurantId, tables });
      console.log('TableVisualization - Generated tables:', allTables);
      setAvailableTables(allTables);
    } else {
      setAvailableTables([]);
    }
  }, [restaurantId, tables]);

  // Fetch booking availability
  useEffect(() => {
    if (restaurantId) {
      fetchTableAvailability();
    }
  }, [restaurantId, selectedDate, selectedTime]);

  const fetchTableAvailability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format date as YYYY-MM-DD for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Get all bookings for this restaurant and date using the onDate endpoint
      const bookingsForDate = await bookingService.getRestaurantBookings(
        restaurantId,
        formattedDate
      );
      
      console.log('TableVisualization - Fetched bookings:', bookingsForDate);
      
      // Filter out cancelled bookings
      const activeBookings = bookingsForDate.filter(
        booking => booking.status !== 'CANCELLED'
      );
      
      // Create a map of booked tables
      const bookedTables = {};
      
      // Mark all tables with active bookings as booked
      activeBookings.forEach(booking => {
        // Convert tableId to number if it's a string to ensure consistent comparison
        const tableId = typeof booking.tableId === 'string'
          ? parseInt(booking.tableId, 10)
          : booking.tableId;
        
        // Check if the booking time is close to the selected time (within 1 hour)
        const bookingTime = booking.time.substring(0, 5); // Extract HH:MM
        const bookingHour = parseInt(bookingTime.split(':')[0]);
        const selectedHour = parseInt(selectedTime.split(':')[0]);
        
        if (Math.abs(bookingHour - selectedHour) <= 1) {
          bookedTables[tableId] = booking;
        }
      });

      console.log('TableVisualization - Booked tables:', bookedTables);
      setTableAvailability(bookedTables);
    } catch (err) {
      console.error('Error fetching table availability:', err);
      setError('Failed to load table availability');
    } finally {
      setLoading(false);
    }
  };

  // Generate a visual representation of tables
  const renderTables = () => {
    if (availableTables.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No table information available</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tables</h3>
          <div className="flex space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded-full mr-1"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 rounded-full mr-1"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 place-items-center">
          {availableTables.map((table) => {
            // Check if this table is booked
            // Ensure consistent type comparison by converting to number if needed
            const tableId = typeof table.tableId === 'string'
              ? parseInt(table.tableId, 10)
              : table.tableId;
            
            const isBooked = tableAvailability[tableId] !== undefined;
            
            return (
              <div
                key={`table-${table.tableId}`}
                className="p-2 text-center flex flex-col items-center"
              >
                {/* Table visualization */}
                <div className="relative mx-auto" style={{ width: '80px', height: '80px' }}>
                  {/* Table - round */}
                  <div className={`absolute inset-0 m-auto rounded-full border-2 mt-0.5 ${
                    isBooked
                      ? 'border-red-400 bg-red-50'
                      : 'border-green-400 bg-green-50'
                    }`}
                       style={{
                         width: table.size <= 2 ? '40px' : table.size <= 4 ? '50px' : '60px',
                         height: table.size <= 2 ? '40px' : table.size <= 4 ? '50px' : '60px',
                         top: '50%',
                         left: '50%',
                         transform: 'translate(-50%, -50%)'
                       }}>
                    {/* Table ID */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">{table.tableId}</span>
                    </div>
                  </div>
                  
                  {/* Chairs */}
                  {Array.from({ length: Math.min(table.size, 8) }).map((_, i) => {
                    // Use a unique key that includes the table ID and chair index
                    const chairKey = `table-${table.tableId}-chair-${i}`;
                    // Calculate position for each chair around the table
                    const angle = (i * (360 / Math.min(table.size, 8))) * (Math.PI / 180);
                    const radius = table.size <= 2 ? 30 : table.size <= 4 ? 35 : 40;
                    const x = 40 + radius * Math.cos(angle);
                    const y = 40 + radius * Math.sin(angle);
                    
                    return (
                      <div
                        key={chairKey}
                        className={`absolute rounded-full border ${
                          isBooked
                            ? 'bg-red-300 border-red-500'
                            : 'bg-green-300 border-green-500'
                          }`}
                        style={{
                          width: '12px',
                          height: '12px',
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      ></div>
                    );
                  })}
                </div>
                
                <div className="text-xs mt-1 text-center">
                  <div className="font-bold">Table {table.tableId}</div>
                  <div>{table.size} seats</div>
                  {isBooked && <div className="text-red-600 font-semibold">Booked</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Table Availability</span>
          {error && <span className="text-sm text-red-500">{error}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Select Date
              </label>
              <div className="grid grid-cols-7 gap-1">
                {dates.map((date, index) => (
                  <Button
                    key={`date-${index}`}
                    variant={date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
                    className="p-2 h-auto flex flex-col"
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-xs">{format(date, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(date, 'd')}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-1" />
              Select Time
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
              {timeSlots.map((time) => (
                <Button
                  key={`time-${time}`}
                  variant={time === selectedTime ? "default" : "outline"}
                  className="p-2"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          renderTables()
        )}
      </CardContent>
    </Card>
  );
}