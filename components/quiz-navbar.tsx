import React from 'react';
import { Button } from './ui/button';
import Routes from '@/config/routes';

const QuizNavbar: React.FC = () => {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Programmatically navigate using Next.js router since window.history is not feasible
      window.location.href = Routes.DEFAULT_MODE;
    }
  };

  return (
    <div className="monospace-jetbrains-mono flex justify-between items-center py-4 px-5 w-full" style={{ background: 'linear-gradient(to bottom, rgba(7, 107, 52, 0.88), rgba(7, 107, 52, 0.8))' }}>
      <Button onClick={goBack} className="rounded-xl bg-green-200/30 hover:bg-green-200/50 text-white">
        Back to Texts
      </Button>
    </div>
  );
};

export default QuizNavbar;
