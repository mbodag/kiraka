import StandardNavbar from "@/components/navbar";
import QuizNavbar from "@/components/quiz-navbar";
import Sidebar from "@/components/sidebar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navbarType?: 'standard' | 'quiz';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navbarType }) => {
  let navbar;
  let sidebar;

  if (navbarType === 'standard') {
    navbar = <StandardNavbar />;
    sidebar = (
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
    );
  } else if (navbarType === 'quiz') {
    navbar = <QuizNavbar />;
    sidebar = (
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {sidebar}
      <main className={`${navbarType ? 'md:pl-72' : ''}`}>
        {navbar}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;