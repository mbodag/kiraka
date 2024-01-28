"use client";

import { Button } from "./ui/button";

const ModeToggle = () => {
  return (
    <div className="flex flex-row justify-center space-x-2"> {/* Adjusted space-x value for a small space */}
      <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Mode 1</Button> {/* Semi-transparent green buttons */}
      <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Mode 2</Button>
      <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Mode 3</Button>
    </div>
  );
};

export default ModeToggle;
