
import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';
import { BotIcon } from './icons';

interface HomePageProps {
  onStart: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart, language, setLanguage }) => {
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center text-text">
      <div className="w-full max-w-2xl bg-surface p-8 sm:p-12 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-light rounded-full">
                <BotIcon className="w-10 h-10 text-primary-text" />
            </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-dark mb-4">{t.welcomeTitle}</h1>
        <p className="text-lg text-muted mb-8 max-w-xl mx-auto">{t.welcomeDescription}</p>
        
        <div className="flex justify-center mb-8 space-x-4">
            <button
                onClick={() => setLanguage(Language.RW)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${language === Language.RW ? 'bg-primary-dark text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                {t.rwanda}
            </button>
            <button
                onClick={() => setLanguage(Language.EN)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${language === Language.EN ? 'bg-primary-dark text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
                {t.uk}
            </button>
        </div>

        <button 
          onClick={onStart} 
          className="w-full sm:w-auto px-12 py-4 bg-primary-light text-primary-text font-bold text-lg rounded-xl hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-lg"
        >
          {t.startInterview}
        </button>
        <p className="mt-4 text-sm text-gray-400">made by mackson</p>
      </div>
    </div>
  );
};

export default HomePage;
