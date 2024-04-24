import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import Routes from '@/config/routes';

const QuizNavbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center py-4 px-8 w-full" style={{ background: 'linear-gradient(to bottom, rgba(7, 107, 52, 0.88), rgba(7, 107, 52, 0.8))' }}>
      <Link href={Routes.DEFAULT_MODE} passHref>
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white">Back to Texts</Button>
      </Link>
    </div>
  );
};

export default QuizNavbar;
