"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './AnalyticsPage.module.css';

// Define TypeScript interface for UserPlotProps
interface UserPlotProps {
  userName: string;
}

// UserPlot component for displaying user-specific plots
const UserPlot: React.FC<UserPlotProps> = ({ userName }) => {
  return <div>Plots for {userName}</div>;
};

// AnalyticsPage component
const AnalyticsPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const users = ['Konstantinos', 'Jack', 'Matis', 'Fadi', 'Kyoya', 'Evangelos', 'John', 
                        'Jane', 'Sarah', 'Charles', 'Robert', 'Maria', 'Joseph', 'Francis', 'Michele', 
                        'Sacha', 'Adam', 'Eve', 'Huxley', 'Alex', 'Paul', 'Elio', 'Rhea'];
  const [filteredUsers, setFilteredUsers] = useState(users);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollUsers = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -container.offsetWidth / 3 : container.offsetWidth / 3;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Filter users as per the search term
    const newFilteredUsers = users.filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredUsers(newFilteredUsers);
  }, [searchTerm]); // Re-run the effect whenever searchTerm changes

  return (
    <div className={`${styles.analyticsBg} flex flex-col items-center pt-16 pb-8 min-h-screen analytics-font`}>
      <h1 className="text-5xl font-bold mb-4">Dashboard Analytics</h1>
      
      {/* Search bar for filtering plots, with reduced width */}
      <div className="flex justify-center mt-8 mb-6">
        <input
          type="text"
          placeholder="Search for a user..."
          className="p-2 rounded shadow"
          style={{ width: '100%' }} // Reduced width of the search bar
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Scrollable Navigation bar for user selection, centered */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button onClick={() => scrollUsers('left')}>&lt;</button>
        <div ref={scrollContainerRef} className="flex gap-4 overflow-auto scroll-smooth scrollbar-hide" style={{ width: '40vw' }}>
        {filteredUsers.map((user) => (
            <button
              key={user}
              className="px-4 py-2 min-w-max rounded shadow bg-lime-50 text-gray-700 hover:bg-cyan-300 transition-colors duration-200 ease-in-out"
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </button>
          ))}
        </div>
        <button onClick={() => scrollUsers('right')}>&gt;</button>
      </div>
      
      {/* Display user-specific plot or a prompt to select a user */}
      <div className="flex-1 flex justify-center items-center text-gray-600">
        {selectedUser ? <UserPlot userName={selectedUser} /> : <div>Please select a user to view the data.</div>}
      </div>
    </div>
  );
};

export default AnalyticsPage;
