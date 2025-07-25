
import React, { useState } from 'react';
import { EvaluationResult, Language, InterviewAnswer } from '../types';
import { translations } from '../constants';
import ScoreGauge from './ScoreGauge';
import { CheckCircleIcon, XCircleIcon } from './icons';
import Loader from './Loader';

interface ResultsPageProps {
  result: EvaluationResult;
  answers: InterviewAnswer[]; // Kept for potential future use (e.g., constructing email body)
  onRestart: () => void;
  language: Language;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onRestart, language }) => {
  const t = translations[language];
  const isPassed = result.overallScore >= 75;

  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!validateEmail(email)) {
      setEmailError(t.invalidEmail);
      setEmailStatus('error');
      return;
    }
    
    setEmailStatus('sending');
    // Simulate API call to send email
    setTimeout(() => {
        setEmailStatus('sent');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl bg-surface dark:bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-8 text-center">{t.interviewResults}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-muted dark:text-gray-400 mb-4">{t.overallPerformance}</h3>
            <ScoreGauge score={result.overallScore} />
          </div>
          <div className="md:col-span-2 bg-gray-100 dark:bg-gray-700/50 p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-muted dark:text-gray-400 mb-4">{t.hiringDecision}</h3>
            <div className={`flex items-center p-4 rounded-lg ${isPassed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                {isPassed ? <CheckCircleIcon className="w-10 h-10 text-green-500 mr-4 flex-shrink-0" /> : <XCircleIcon className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" />}
                <p className={`text-lg font-semibold ${isPassed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                    {result.decision}
                </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-primary-dark dark:text-primary-light text-center">{t.emailReportTitle}</h3>
            <p className="text-center text-muted dark:text-gray-400 mt-2 mb-6 max-w-2xl mx-auto">{t.emailReportDescription}</p>
            
            <div className="max-w-lg mx-auto">
                {emailStatus === 'sent' ? (
                     <div className="text-center p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <p className="font-semibold text-green-800 dark:text-green-300">{t.reportSentSuccess} <span className="font-bold">{email}</span></p>
                    </div>
                ) : emailStatus === 'sending' ? (
                     <div className="h-24">
                        <Loader text={t.sending}/>
                     </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.emailPlaceholder}
                            required
                            className="flex-grow mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light text-text dark:text-gray-200"
                            aria-label={t.emailPlaceholder}
                        />
                        <button type="submit" className="py-3 px-6 border border-transparent rounded-lg shadow-sm font-medium text-primary-text bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all">
                            {t.sendReport}
                        </button>
                    </form>
                )}
                {emailStatus === 'error' && <p className="text-red-500 text-center mt-2">{emailError}</p>}
            </div>
        </div>

        <div className="text-center mt-12">
          <button onClick={onRestart} className="px-10 py-3 bg-primary-light text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-transform transform hover:scale-105 shadow-lg">
            {t.tryAgain}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
