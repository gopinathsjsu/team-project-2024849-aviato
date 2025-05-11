// src/pages/Home.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Utensils, Star, ChevronRight } from 'lucide-react';
import SearchForm from '@/components/search/SearchForm';
import { format } from 'date-fns';

export default function Home() {
  // Featured restaurants with more detailed information like OpenTable
  const featuredRestaurants = [
    {
      id: 1,
      name: 'Spice Garden',
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      cuisine: 'Indian',
      priceRange: '$$',
      rating: 4.5,
      reviewCount: 187,
      location: 'Santa Clara',
      bookingsToday: 82,
      availableTimes: ['11:30 AM', '12:00 PM', '1:30 PM']
    },
    {
      id: 2,
      name: 'Bella Italia',
      image: 'https://images.pexels.com/photos/1082343/pexels-photo-1082343.jpeg',
      cuisine: 'Italian',
      priceRange: '$$$',
      rating: 4.3,
      reviewCount: 143,
      location: 'San Jose',
      bookingsToday: 65,
      availableTimes: ['11:30 AM', '12:45 PM', '1:30 PM']
    },
    {
      id: 3,
      name: 'Sushi Express',
      image: 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg',
      cuisine: 'Japanese',
      priceRange: '$$',
      rating: 4.7,
      reviewCount: 236,
      location: 'Mountain View',
      bookingsToday: 93,
      availableTimes: ['11:30 AM', '12:00 PM', '1:30 PM']
    }
  ];
  
  // Default date for booking links
  const defaultDate = format(new Date(), 'yyyy-MM-dd');
  const defaultPartySize = '2';

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-orange-500">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-orange-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="font-sans">
      {/* Hero Section with Search Form */}
      <section className="relative bg-gray-800">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" 
             style={{ backgroundImage: "url('https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg')" }}>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-sans text-white">
              Find and book the best restaurants
            </h1>
            <p className="text-xl mb-8 font-sans text-white">
              Discover amazing dining experiences and reserve your table in seconds
            </p>
          </div>
          
          {/* Search Form Card */}
          <div className="max-w-2xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center font-sans">Featured Restaurants</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredRestaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px] duration-300">
                <div className="h-52 overflow-hidden">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                
                <div className="p-5">
                  <Link to={`/restaurant/${restaurant.id}`} className="hover:text-orange-600">
                    <h3 className="text-xl font-bold mb-2 font-sans">{restaurant.name}</h3>
                  </Link>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2 text-lg">
                      {renderStars(restaurant.rating)}
                    </div>
                    <span className="text-sm text-gray-600">{restaurant.reviewCount} reviews</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3 font-sans">
                    <span className="mr-2">{restaurant.cuisine}</span>
                    <span className="mr-2">•</span>
                    <span className="mr-2">{restaurant.priceRange}</span>
                    <span className="mr-2">•</span>
                    <span>{restaurant.location}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4 font-sans">
                    <span>Booked {restaurant.bookingsToday} times today</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.availableTimes.map(time => (
                      <Link 
                        key={time} 
                        to={`/booking/${restaurant.id}?time=${encodeURIComponent(time)}&date=${defaultDate}&partySize=${defaultPartySize}`}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="min-w-16 border-orange-400 text-orange-600 hover:bg-orange-50 font-sans"
                        >
                          {time}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/search">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-sans">
                View All Restaurants
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-sans">How ThaliBook Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-sans">Search</h3>
              <p className="text-gray-600 font-sans">
                Find restaurants by location, cuisine, or availability
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-sans">Book</h3>
              <p className="text-gray-600 font-sans">
                Reserve your table with just a few clicks
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-sans">Enjoy</h3>
              <p className="text-gray-600 font-sans">
                Experience amazing dining with no waiting
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}