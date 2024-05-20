import React from 'react';
import { Button } from './ui/button';
import Routes from '@/config/routes';

const QuizNavbar: React.FC = () => {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = Routes.DEFAULT_MODE;
    }
  };

  return (
    <div className="monospace-jetbrains-mono flex justify-between items-center py-4 px-5 w-full" style={{ background: 'linear-gradient(to bottom, var(--gradient-top-color), var(--gradient-bottom-color))', }}>
      <Button onClick={goBack} className="rounded-xl navbar-dashboard-font bg-green-200/30 hover:bg-green-200/50 text-white">
        Go Back
      </Button>
    </div>
  );
};

export default QuizNavbar;
