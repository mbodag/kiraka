"use client";

import { Button } from "./ui/button";

const ModeToggle = () => {
  return (
    <div className="flex flex-row justify-center space-x-20">
      <Button>Mode 1</Button>
      <Button>Mode 2</Button>
      <Button>Mode 3</Button>
    </div>
  );
};

export default ModeToggle;
