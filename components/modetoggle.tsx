"use client";

import Link from "next/link";
import { Button } from "./ui/button";

const ModeToggle = () => {
  return (
    <div className="flex flex-row justify-center space-x-2">
      {" "}
      {/* Adjusted space-x value for a small space */}
      <Link href="/dashboard">
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
          Manual
        </Button>{" "}
      </Link>
      {/* Semi-transparent green buttons */}
      <Link href="/webgazer-mode-2">
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
          Automatic
        </Button>
      </Link>
      {/* <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
        Mode 3
      </Button> */}
    </div>
  );
};

export default ModeToggle;
