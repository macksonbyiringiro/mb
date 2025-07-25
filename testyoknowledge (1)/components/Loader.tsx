
import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
    <p className="text-muted text-lg">{text}</p>
  </div>
);

export default Loader;
