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
  let sidebar;

  if (navbarType === 'standard-manual') {
    navbar = <StandardNavbar />;
    sidebar = (
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
    );
  } else if (navbarType === 'standard-auto') {
    navbar = <StandardWebGazerNavbar />;
    sidebar = (
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
    );
  } else if (navbarType === 'quiz') {
    navbar = <QuizNavbar />;
    sidebar = (
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
    );
  }

  return (
    <WebGazerProvider> {/* Wrap the entire layout in WebGazerProvider */}
      <div className="h-full relative">
        {sidebar}
        <main className={`${navbarType ? 'md:pl-64' : ''}`}>
          {navbar}
          {children}
        </main>
      </div>
    </WebGazerProvider>
  );
};

export default DashboardLayout;