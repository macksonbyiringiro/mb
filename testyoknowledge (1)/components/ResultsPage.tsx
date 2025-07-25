
import React from 'react';
import { EvaluationResult, Language } from '../types';
import { translations } from '../constants';
import ScoreGauge from './ScoreGauge';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ResultsPageProps {
  result: EvaluationResult;
  onRestart: () => void;
  language: Language;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onRestart, language }) => {
  const t = translations[language];
  const isPassed = result.overallScore >= 75;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-surface p-8 sm:p-12 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold text-primary-dark mb-8 text-center">{t.interviewResults}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-100 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-muted mb-4">{t.overallPerformance}</h3>
            <ScoreGauge score={result.overallScore} />
          </div>
          <div className="md:col-span-2 bg-gray-100 p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-muted mb-4">{t.hiringDecision}</h3>
            <div className={`flex items-center p-4 rounded-lg ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPassed ? <CheckCircleIcon className="w-10 h-10 text-green-500 mr-4 flex-shrink-0" /> : <XCircleIcon className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" />}
                <p className={`text-lg font-semibold ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                    {result.decision}
                </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="text-lg font-bold text-green-800 mb-3">{t.strengths}</h4>
            <ul className="list-disc list-inside space-y-2 text-green-700">
              {result.strengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h4 className="text-lg font-bold text-yellow-800 mb-3">{t.weaknesses}</h4>
            <ul className="list-disc list-inside space-y-2 text-yellow-700">
              {result.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg md:col-span-2 lg:col-span-1">
            <h4 className="text-lg font-bold text-blue-800 mb-3">{t.recommendations}</h4>
            <ul className="list-disc list-inside space-y-2 text-blue-700">
              {result.recommendations.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button onClick={onRestart} className="px-10 py-3 bg-primary-light text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-lg">
            {t.tryAgain}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
