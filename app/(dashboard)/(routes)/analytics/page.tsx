"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './AnalyticsPage.module.css';
import { Button } from "@/components/ui/button";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js/auto';
import { useAuth, useUser } from "@clerk/nextjs";
import Routes from '@/config/routes';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Define TypeScript interface for UserPlotProps
interface UserRecord {
  timestamp: string;
  textId: number;
  avgWPM: number;
  quizScore: number;
}

interface UserPlotProps {
  userName: string;
  userData: { [key: string]: UserRecord[] };
}

// Fetch analytics data
const getAnalytics = async (userId: string | null | undefined) => {
  try {
    const response = await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(await response.json());
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching response", error);
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = Routes.DEFAULT_MODE;
  }
};

// AnalyticsPage component
const AnalyticsPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [userData, setUserData] = useState<{ [key: string]: UserRecord[] }>({});
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [isAdmin, setAdmin] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const response = await getAnalytics(userId)
      setUserData(response.usersData);
      setUsers(Object.keys(response.usersData));
      setAdmin(response.isAdmin)
      if (!response.isAdmin){
        setSelectedUser('Your data')
      }
        };
    fetchAnalyticsData();
  }, [userId]);

  const scrollUsers = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef;
      const scrollAmount =
        direction === "left"
          ? -container.offsetWidth / 3
          : container.offsetWidth / 3;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Filter users as per the search term
    const newFilteredUsers = users.filter((user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(newFilteredUsers);
  }, [searchTerm, users]); // Re-run the effect whenever searchTerm changes

  // UserPlot component
  const UserPlot: React.FC<UserPlotProps> = ({ userName }) => {
    const userRecords = userData[userName] || [];
    const labels = userRecords.map(
      (record: any) => `${record.timestamp} (ID: ${record.textId})`
    );

    // Conditional title based on the userName
    const plotTitle = userName === "Your data" ? "Your Performance" : `${userName}'s Performance`;

    // Combined data for both Average WPM and Quiz Score
    const combinedData = {
      labels,
      datasets: [
        {
          label: "Average WPM",
          data: userRecords.map((record: any) => record.avgWPM),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          type: "line" as const, // Specify the type directly in the dataset
          yAxisID: "yWpm", // Reference to the WPM Y-axis ID
        },
        {
          label: "Quiz Score (%)",
          data: userRecords.map((record: any) => record.quizScore),
          backgroundColor: "rgba(153, 102, 255, 0.4)",
          borderColor: "rgba(153, 102, 255, 1)",
          type: "bar" as const, // Specify the type directly in the dataset
          yAxisID: "yQuiz", // Reference to the Quiz Score Y-axis ID
        },
      ],
    };

    const commonOptions = {
      responsive: true,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      stacked: false, // Ensures that the bar chart does not stack over the line chart
      scales: {
        yWpm: {
          type: "linear" as const,
          position: "left" as const,
          beginAtZero: true,
          title: {
            display: true,
            text: "Average WPM",
          },
          grid: {
            drawOnChartArea: true, // Only the left axis will draw grid lines by default
          },
        },
        yQuiz: {
          type: "linear" as const,
          position: "right" as const,
          beginAtZero: true,
          max: 100, // For percentage-based values
          title: {
            display: true,
            text: "Quiz Score (%)",
          },
          grid: {
            drawOnChartArea: false, // Prevents the right axis from drawing grid lines
          },
        },
        x: {
          display: true,
          title: {
            display: true,
            text: "Date (Text ID)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: plotTitle,
          font: {
            size: 18,
          },
        },
      },
    };

    return (
      <div
        className="plot-container"
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
          width: "60vw",
        }}
      >
        <Line data={combinedData as any} options={commonOptions} />
      </div>
    );
  };

  return (
    <div
      className={`${styles.analyticsBg} flex flex-col items-center pt-10 pb-8 min-h-screen analytics-font`}
    >
      <div className="self-start absolute top-4 left-4">
          <Button onClick={goBack} className="ml-4 shadow rounded-xl bg-lime-50/60 hover:bg-lime-50/100 text-gray-900 bold" style={{ fontSize: "17px" }}>Back</Button>
      </div>

      <h1 className="text-5xl font-bold mb-4">Dashboard Analytics</h1>

      {/* Search bar for filtering plots, with reduced width */}
      {isAdmin && (<div className="flex justify-center mt-6 mb-6">
        <input
          type="text"
          placeholder="Search for a user..."
          className="p-2 rounded shadow"
          style={{ width: "100%" }} // Reduced width of the search bar
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>)}
      
      {/* Scrollable Navigation bar for user selection, centered */}
      {isAdmin && <div className="flex justify-center items-center gap-4 mb-4">
      <button onClick={() => scrollUsers("left")}>&lt;</button>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-auto scroll-smooth scrollbar-hide scrollbar-hide"
          style={{ width: "30vw" }}
        >
          {filteredUsers.map((user) => (
            <button
              key={user}
              className="px-4 py-2 min-w-max rounded shadow bg-lime-50 text-gray-700 hover:bg-purple-200 transition-colors duration-200 ease-in-out"
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </button>
          ))}
        </div>
         <button onClick={() => scrollUsers("right")}>&gt;</button>
      </div> }

      {/* Display user-specific plot or a prompt to select a user */}
      <div className="flex-1 flex justify-center items-center text-gray-600">
        {selectedUser ? (
          <UserPlot userName={selectedUser} userData={userData} />
        ) : (
          <div>Please select a user to view the data.</div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;