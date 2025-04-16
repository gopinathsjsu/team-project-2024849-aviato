// src/components/search/SearchForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function SearchForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    partySize: '2',
    location: ''
  });

  const handleChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          {/* Date Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Date</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 w-full"
                value={searchParams.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
          </div>
          
          {/* Time Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Time</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <Select 
                value={searchParams.time}
                onValueChange={(value) => handleChange('time', value)}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue>{searchParams.time}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'].map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Party Size Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Party Size</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <Select 
                value={searchParams.partySize}
                onValueChange={(value) => handleChange('partySize', value)}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue>{searchParams.partySize}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Location Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Location (optional)</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="City or Zip"
                className="pl-10 w-full"
                value={searchParams.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-12 text-base"
        >
          Find a Table
        </Button>
      </form>
    </div>
  );
}