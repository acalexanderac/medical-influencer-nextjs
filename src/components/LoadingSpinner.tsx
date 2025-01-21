import { useEffect, useState } from 'react';

export default function LoadingSpinner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para evitar el flash en cargas rápidas
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
        </div>
      </div>
    </div>
  );
} 