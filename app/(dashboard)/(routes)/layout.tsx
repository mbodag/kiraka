import StandardNavbar from "@/components/navbar";
import QuizNavbar from "@/components/quiz-navbar";
import Sidebar from "@/components/sidebar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navbarType?: 'standard' | 'quiz';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navbarType = 'standard' }) => {
  return (
    <div className="h-full relative">
      {navbarType === 'standard' && (
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
          <Sidebar />
        </div>
      )}
      <main className={`${navbarType === 'standard' ? 'md:pl-72' : ''}`}>
        {navbarType === 'standard' ? <StandardNavbar /> : <QuizNavbar />}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
