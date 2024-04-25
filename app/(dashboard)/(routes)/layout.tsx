"use client"

import React from "react";
import StandardWebGazerNavbar from "@/components/navbar-webgazer";
import StandardInstructionsNavbar from "@/components/navbar-instructions";
import QuizNavbar from "@/components/quiz-navbar";
import Sidebar from "@/components/sidebar";
import { WebGazerProvider } from "@/contexts/WebGazerContext";


interface DashboardLayoutProps {
  children: React.ReactNode;
  navbarType?: 'standard-manual' | 'quiz' | 'standard-auto' | 'instructions';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navbarType }) => {
  let navbar;
  let sidebar;
  let sidebarPresence = navbarType !== undefined; // Sidebar presence based on navbarType

  // Dynamically choose the navbar based on navbarType
  switch (navbarType) {
    case 'standard-manual':
      navbar = <StandardWebGazerNavbar />;
      sidebar = <Sidebar />;
      break;
    case 'instructions':
      navbar = <StandardInstructionsNavbar />;
      sidebar = <Sidebar />;
      break;
    case 'standard-auto':
      navbar = <StandardWebGazerNavbar />;
      sidebar = <Sidebar />;
      break;
    case 'quiz':
      navbar = <QuizNavbar />;
      sidebar = <Sidebar />;
      break;
    default:
      navbar = null; // Default case if no navbarType is provided
      sidebar = null; // Assume no sidebar for default case
  }
  

  return (
    <WebGazerProvider>
      <div className="h-full relative">
        {sidebarPresence && (
          <div className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[1000] bg-gray-900" style={{width: 'var(--sidebar-width)'}}>
            {sidebar}
          </div>
        )}
        <main style={sidebarPresence ? { paddingLeft: 'var(--sidebar-width)' } : {}}>
          {navbar}
          {children}
        </main>
      </div>
    </WebGazerProvider>
  );
};

export default DashboardLayout;