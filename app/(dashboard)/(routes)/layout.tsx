"use client"

import React from "react";
import StandardNavbar from "@/components/navbar";
import StandardWebGazerNavbar from "@/components/navbar_webgazer";
import QuizNavbar from "@/components/quiz-navbar";
import Sidebar from "@/components/sidebar";
import { WebGazerProvider } from "@/contexts/WebGazerContext";


interface DashboardLayoutProps {
  children: React.ReactNode;
  navbarType?: 'standard-manual' | 'quiz' | 'standard-auto';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navbarType }) => {
  let navbar;
  let sidebarPresence = navbarType !== undefined; // Sidebar presence based on navbarType

  // Dynamically choose the navbar based on navbarType
  switch (navbarType) {
    case 'standard-manual':
      navbar = <StandardNavbar />;
      break;
    case 'standard-auto':
      navbar = <StandardWebGazerNavbar />;
      break;
    case 'quiz':
      navbar = <QuizNavbar />;
      break;
    default:
      navbar = null; // Default case if no navbarType is provided
  }

  return (
    <WebGazerProvider>
      <div className="h-full relative">
        {sidebarPresence && (
          <div className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[1000] bg-gray-900" style={{width: 'var(--sidebar-width)'}}>
            <Sidebar />
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