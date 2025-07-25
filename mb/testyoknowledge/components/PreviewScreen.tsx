import React from 'react';
import { InterviewQuestion, Language } from '../types';
import { translations } from '../constants';

interface PreviewScreenProps {
  questions: InterviewQuestion[];
  onNext: () => void;
  onBack: () => void;
  language: Language;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ questions, onNext, onBack, language }) => {
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl bg-surface dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">{t.previewTitle}</h2>
            <p className="text-muted dark:text-gray-400">{t.previewDescription}</p>
        </div>

        <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <ol className="list-decimal list-inside space-y-4">
                {questions.map((q) => (
                    <li key={q.id} className="text-lg text-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700/60 p-4 rounded-lg flex items-start">
                        <span className="font-bold text-primary-light mr-4">{q.id}.</span>
                        <span>{q.question}</span>
                    </li>
                ))}
            </ol>
        </div>
        
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onBack} className="w-full sm:w-auto py-2.5 px-6 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all">
                {t.back}
            </button>
            <button type="button" onClick={onNext} className="w-full sm:w-auto py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-primary-text bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all">
                {t.continueToInterview}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewScreen;
