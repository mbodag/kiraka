import { LandingNavbar } from "@/components/landing-navbar";
import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const backgroundStyle = {
    backgroundImage: `url('/Wavy_GreenTurquoise_bg.svg')`, // Adjust the path if your public folder is configured differently
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100%', // ensure it covers the full height of the component
    width: '100%', // ensure it covers the full width of the component
    zIndex: -1,
  };

  return (
    <main className="h-full overflow-auto">
      <div className="absolute w-full h-full" style={backgroundStyle}></div>
      <LandingNavbar />
      <div className="mx-auto max-w-screen-xl h-full w-full">{children}</div>
    </main>
  );
};

export default LandingLayout;
