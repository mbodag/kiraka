"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './AnalyticsPage.module.css';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Define TypeScript interface for UserPlotProps
interface UserRecord {
  timestamp: string;
  textId: number;
  avgWPM: number;
  quizScore: number;
}

interface UserData {
  [key: string]: UserRecord[];
}

interface UserPlotProps {
  userName: string;
  userData: { [key: string]: UserRecord[] };
}

const userData: UserData = {
    "Konstantinos":[],
    "Jack": [
      { timestamp: "8/2/2024", textId: 1, avgWPM: 150, quizScore: 50 },
      { timestamp: "21/2/2024", textId: 2, avgWPM: 200, quizScore: 70 },
      { timestamp: "23/2/2024", textId: 3, avgWPM: 250, quizScore: 60 },
      { timestamp: "27/2/2024", textId: 4, avgWPM: 300, quizScore: 70 },
      { timestamp: "3/3/2024", textId: 5, avgWPM: 220, quizScore: 80 },
      { timestamp: "11/3/2024", textId: 6, avgWPM: 350, quizScore: 60 },
      { timestamp: "8/2/2024", textId: 12, avgWPM: 150, quizScore: 50 },
      { timestamp: "21/2/2024", textId: 5, avgWPM: 200, quizScore: 90 },
      { timestamp: "23/2/2024", textId: 11, avgWPM: 250, quizScore: 60 },
      { timestamp: "27/2/2024", textId: 9, avgWPM: 300, quizScore: 70 },
      { timestamp: "3/3/2024", textId: 8, avgWPM: 220, quizScore: 100 },
      { timestamp: "11/3/2024", textId: 7, avgWPM: 350, quizScore: 60 },
      { timestamp: "21/3/2024", textId: 15, avgWPM: 450, quizScore: 45 }
    ],
    // "Matis":[],
    "Fadi":[
      { timestamp: "8/2/2024", textId: 1, avgWPM: 150, quizScore: 50 },
      { timestamp: "21/2/2024", textId: 2, avgWPM: 200, quizScore: 70 },
      { timestamp: "23/2/2024", textId: 3, avgWPM: 250, quizScore: 60 },
      { timestamp: "27/2/2024", textId: 4, avgWPM: 300, quizScore: 70 },
      { timestamp: "3/3/2024", textId: 5, avgWPM: 220, quizScore: 100 },
      { timestamp: "11/3/2024", textId: 6, avgWPM: 350, quizScore: 60 },
      { timestamp: "21/3/2024", textId: 7, avgWPM: 450, quizScore: 90 }
    ],
    "Kyoya":[
      { timestamp: "8/2/2024", textId: 1, avgWPM: 150, quizScore: 50 },
      { timestamp: "21/2/2024", textId: 2, avgWPM: 200, quizScore: 70 },
      { timestamp: "21/3/2024", textId: 7, avgWPM: 450, quizScore: 95 }
    ],
    "Evangelos":[],
    "John":[],
    "Jane":[],
    "Sarah":[],
    "Charles":[]
  };

// AnalyticsPage component
const AnalyticsPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const users = ['Konstantinos', 'Jack', 'Matis', 'Fadi', 'Kyoya', 'Evangelos', 'John', 
                 'Jane', 'Sarah', 'Charles'];
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


    // UserPlot component
    const UserPlot: React.FC<UserPlotProps> = ({ userName }: { userName: string }) => {
      const userRecords = userData[userName] || [];
      const labels = userRecords.map(record => `${record.timestamp} (ID: ${record.textId})`);
    
      // Average WPM plot remains the same
      const avgWpmData = {
        labels,
        datasets: [{
          label: 'Average Word Per Minute (WPM)',
          data: userRecords.map(record => record.avgWPM),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
        }],
      };
    
      // Convert the quiz score plot to a histogram (emulated using a bar chart)
      const quizScoreData = {
        labels,
        datasets: [{
          label: 'Quiz Score (%)',
          data: userRecords.map(record => record.quizScore),
          backgroundColor: 'rgba(153, 102, 255, 0.3)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        }],
      };
    
      const commonOptionsQuiz = {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100, // Set max value for y-axis if applicable
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date (Text ID)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: userName + "'s Quiz Performance",
          },
        },
      };

      const commonOptionsWPM = {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date (Text ID)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: userName + "'s WPM Performance",
          },
        },
      };
    
      return (
        <div className="plot-container mt-4" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0,0,0,0.3)', width: '40vw' }}>
          <div style={{ height: '20vw', marginBottom: '20px' }}>
            <Line data={avgWpmData} options={commonOptionsWPM} />
          </div>
          <div style={{ height: '20vw' }}>
            {/* Use Bar instead of Line for the quiz score histogram */}
            <Bar data={quizScoreData} options={{ ...commonOptionsQuiz, scales: { ...commonOptionsQuiz.scales, x: { ...commonOptionsQuiz.scales.x, stacked: true }, y: { ...commonOptionsQuiz.scales.y, stacked: true } } }} />
          </div>
        </div>
      );
    };


  return (
    <div className={`${styles.analyticsBg} flex flex-col items-center pt-10 pb-8 min-h-screen analytics-font`}>

      <div className="self-start absolute top-4 left-4">
        <Link href="/dashboard">
          <Button className="ml-4 shadow bg-lime-50/60 hover:bg-lime-50/100 text-gray-900 bold">Back</Button>
        </Link>
      </div>

      <h1 className="text-5xl font-bold mb-4">Dashboard Analytics</h1>
      
      {/* Search bar for filtering plots, with reduced width */}
      <div className="flex justify-center mt-6 mb-6">
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
        <div ref={scrollContainerRef} className="flex gap-4 overflow-auto scroll-smooth scrollbar-hide" style={{ width: '30vw' }}>
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
        {selectedUser ? <UserPlot userName={selectedUser} userData={userData} /> : <div>Please select a user to view the data.</div>}
      </div>
    </div>
  );
};

export default AnalyticsPage;





// "use client";

// import React, { useState, useRef, useEffect } from 'react';
// import styles from './AnalyticsPage.module.css';
// import Link from 'next/link';
// import { Button } from "@/components/ui/button";
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const initialUserData = {
//   "Konstantinos":[],
//   "Jack": [
//     { timestamp: "8/2/2024", textId: 1, avgWPM: 150, quizScore: 50 },
//     { timestamp: "21/2/2024", textId: 2, avgWPM: 200, quizScore: 70 },
//     { timestamp: "23/2/2024", textId: 3, avgWPM: 250, quizScore: 60 },
//     { timestamp: "27/2/2024", textId: 4, avgWPM: 300, quizScore: 70 },
//     { timestamp: "3/3/2024", textId: 5, avgWPM: 220, quizScore: 80 },
//     { timestamp: "11/3/2024", textId: 6, avgWPM: 350, quizScore: 60 },
//     { timestamp: "21/3/2024", textId: 7, avgWPM: 450, quizScore: 45 }
//   ],
//   "Matis":[],
//   "Fadi":[],
//   "Kyoya":[],
//   "Evangelos":[],
//   "John":[],
//   "Jane":[],
//   "Sarah":[],
//   "Charles":[]
// };


// // Define TypeScript interface for UserPlotProps
// interface UserPlotProps {
//   userName: string;
// }

// // UserPlot component for displaying user-specific plots
// const UserPlot: React.FC<UserPlotProps> = ({ userName }) => {
//   return <div>Plots for {userName}</div>;
// };

// // AnalyticsPage component
// const AnalyticsPage: React.FC = () => {
//   const [selectedUser, setSelectedUser] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [users, setUsers] = useState(Object.keys(initialUserData)); // In future, fetch this list from your database
//   const [userData, setUserData] = useState(initialUserData); // In future, this will be fetched based on the selected user

//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   const scrollUsers = (direction: 'left' | 'right') => {
//     if (scrollContainerRef.current) {
//       const { current: container } = scrollContainerRef;
//       const scrollAmount = direction === 'left' ? -container.offsetWidth / 3 : container.offsetWidth / 3;
//       container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   // Effect for filtering users based on search term
//   useEffect(() => {
//     const filteredUsers = Object.keys(initialUserData).filter(user =>
//       user.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setUsers(filteredUsers);
//   }, [searchTerm]);


  
//   // UserPlot component
//   const UserPlot = ({ userName }) => {
//     const userRecords = userData[userName] || [];
//     const labels = userRecords.map(record => record.timestamp);

//     const avgWpmData = {
//       labels,
//       datasets: [{
//         label: 'Average WPM',
//         data: userRecords.map(record => record.avgWPM),
//         borderColor: 'rgb(53, 162, 235)',
//         backgroundColor: 'rgba(53, 162, 235, 0.5)',
//       }],
//     };

//     const quizScoreData = {
//       labels,
//       datasets: [{
//         label: 'Quiz Score (%)',
//         data: userRecords.map(record => record.quizScore),
//         borderColor: 'rgb(255, 99, 132)',
//         backgroundColor: 'rgba(255, 99, 132, 0.5)',
//       }],
//     };

//     const options = {
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     };

//     return (
//       <>
//         <div className="chart-container">
//           <h2>Average WPM Over Time</h2>
//           <Line data={avgWpmData} options={options} />
//         </div>
//         <div className="chart-container">
//           <h2>Quiz Score (%) Over Time</h2>
//           <Line data={quizScoreData} options={options} />
//         </div>
//       </>
//     );
//   };
  

//   return (
//     <div className={`${styles.analyticsBg} flex flex-col items-center pt-16 pb-8 min-h-screen analytics-font`}>

//       <div className="self-start absolute top-4 left-4">
//         <Link href="/dashboard">
//           <Button className="ml-4 shadow bg-lime-50/60 hover:bg-lime-50/100 text-gray-900 bold">Back</Button>
//         </Link>
//       </div>

//       <h1 className="text-5xl font-bold mb-4">Dashboard Analytics</h1>
      
//       <input
//         type="text"
//         placeholder="Search for a user..."
//         className="p-2 rounded shadow w-1/3"
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//       <div className="scroll-container mt-4" ref={scrollContainerRef} style={{ overflowX: 'auto', display: 'flex', gap: '10px' }}>
//         {users.map(user => (
//           <button key={user} onClick={() => setSelectedUser(user)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
//             {user}
//           </button>
//         ))}
//       </div>
//       {selectedUser && <UserPlot userName={selectedUser} />}
//     </div>
//   );
// };

// export default AnalyticsPage;