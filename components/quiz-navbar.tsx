import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

const QuizNavbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center py-4 px-8 w-full" style={{ background: 'linear-gradient(to bottom, rgba(7, 107, 52, 0.88), rgba(7, 107, 52, 0.8))' }}>
      <Link href="/webgazer-mode-2" passHref>
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white">Back to Text</Button>
      </Link>
    </div>
  );
};

export default QuizNavbar;
