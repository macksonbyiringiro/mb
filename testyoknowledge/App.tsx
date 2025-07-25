import React, { useState, useCallback } from 'react';
import { AppScreen, UserInfo, InterviewQuestion, InterviewAnswer, EvaluationResult, Language } from './types';
import { translations } from './constants';
import * as geminiService from './services/geminiService';
import HomePage from './components/HomePage';
import UserInfoForm from './components/UserInfoForm';
import PreviewScreen from './components/PreviewScreen';
import IntroductionScreen from './components/IntroductionScreen';
import InterviewScreen from './components/InterviewScreen';
import ResultsPage from './components/ResultsPage';
import Loader from './components/Loader';
import { SettingsProvider } from './contexts/SettingsContext';
import { SettingsIcon } from './components/icons';
import SettingsModal from './components/SettingsModal';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Home);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [introduction, setIntroduction] = useState('');
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = translations[language];

  const handleStart = () => {
    setCurrentScreen(AppScreen.Form);
  };

  const handleGoBackToHome = () => {
    setCurrentScreen(AppScreen.Home);
    setError('');
  };

  const handleGoBackToForm = () => {
    setCurrentScreen(AppScreen.Form);
    setError('');
  };

  const handleGoBackToPreview = () => {
      setCurrentScreen(AppScreen.Preview);
  }
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleFormSubmit = useCallback(async (info: UserInfo) => {
    setUserInfo(info);
    setIsLoading(true);
    setError('');
    try {
      const generatedQuestions = await geminiService.generateQuestions(info);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentScreen(AppScreen.Preview);
      } else {
        setError(t.errorGeneratingQuestions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneratingQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [t.errorGeneratingQuestions]);

  const handlePreviewComplete = useCallback(() => {
    setCurrentScreen(AppScreen.Introduction);
  }, []);

  const handleIntroductionComplete = useCallback((introText: string) => {
    setIntroduction(introText);
    setCurrentScreen(AppScreen.Interview);
  }, []);

  const handleInterviewComplete = useCallback(async (answers: InterviewAnswer[]) => {
    if (!userInfo) return;
    setInterviewAnswers(answers);
    setCurrentScreen(AppScreen.Results);
    setIsLoading(true);
    setError('');
    try {
      const result = await geminiService.evaluateAnswers(userInfo, answers, introduction);
      setEvaluationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorEvaluating);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, introduction, t.errorEvaluating]);

  const handleRestart = () => {
    setCurrentScreen(AppScreen.Home);
    setUserInfo(null);
    setQuestions([]);
    setEvaluationResult(null);
    setInterviewAnswers([]);
    setIntroduction('');
    setError('');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.Home:
        return <HomePage onStart={handleStart} language={language} setLanguage={handleLanguageChange} />;
      case AppScreen.Form:
        return <UserInfoForm onSubmit={handleFormSubmit} language={language} onLanguageChange={handleLanguageChange} onBack={handleGoBackToHome} isLoading={isLoading} error={error} />;
      case AppScreen.Preview:
        return <PreviewScreen questions={questions} onNext={handlePreviewComplete} onBack={handleGoBackToForm} language={userInfo?.language || language} />;
      case AppScreen.Introduction:
        return <IntroductionScreen onComplete={handleIntroductionComplete} language={userInfo?.language || language} onBack={handleGoBackToPreview} />;
      case AppScreen.Interview:
        return <InterviewScreen questions={questions} onComplete={handleInterviewComplete} language={userInfo?.language || language} />;
      case AppScreen.Results:
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader text={t.generatingReport} />
            </div>
          );
        }
        if (evaluationResult) {
          return <ResultsPage result={evaluationResult} answers={interviewAnswers} onRestart={handleRestart} language={userInfo?.language || language} />;
        }
        if(error) {
             return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{t.errorOccurred}</h2>
                  <p className="text-muted dark:text-gray-400 mb-6">{error}</p>
                  <button onClick={handleRestart} className="px-6 py-2 bg-primary-light text-white font-semibold rounded-lg">
                    {t.tryAgain}
                  </button>
                </div>
              );
        }
        return null; // Should not happen
      default:
        return <HomePage onStart={handleStart} language={language} setLanguage={handleLanguageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 font-sans text-text dark:text-gray-200">
      <button
          onClick={() => setIsSettingsOpen(true)}
          className="fixed top-4 right-4 z-[60] p-2 bg-surface dark:bg-gray-700 rounded-full shadow-lg text-muted dark:text-gray-400 hover:text-primary-light dark:hover:text-white transition-colors"
          aria-label="Open settings"
      >
          <SettingsIcon className="w-6 h-6" />
      </button>
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      {renderScreen()}
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <AppContent />
  </SettingsProvider>
);

export default App;