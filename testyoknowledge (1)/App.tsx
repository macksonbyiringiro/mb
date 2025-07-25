
import React, { useState, useCallback } from 'react';
import { AppScreen, UserInfo, InterviewQuestion, InterviewAnswer, EvaluationResult, Language } from './types';
import { translations } from './constants';
import * as geminiService from './services/geminiService';
import HomePage from './components/HomePage';
import UserInfoForm from './components/UserInfoForm';
import InterviewScreen from './components/InterviewScreen';
import ResultsPage from './components/ResultsPage';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Home);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const t = translations[language];

  const handleStart = () => {
    setCurrentScreen(AppScreen.Form);
  };
  
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
        setCurrentScreen(AppScreen.Interview);
      } else {
        setError(t.errorGeneratingQuestions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneratingQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [t.errorGeneratingQuestions]);

  const handleInterviewComplete = useCallback(async (answers: InterviewAnswer[]) => {
    if (!userInfo) return;
    setCurrentScreen(AppScreen.Results); // Move to results screen to show loader there
    setIsLoading(true);
    setError('');
    try {
      const result = await geminiService.evaluateAnswers(userInfo, answers);
      setEvaluationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorEvaluating);
      // If error, stay on results page to show error message
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, t.errorEvaluating]);

  const handleRestart = () => {
    setCurrentScreen(AppScreen.Home);
    setUserInfo(null);
    setQuestions([]);
    setEvaluationResult(null);
    setError('');
  };

  const renderScreen = () => {
    if (error && currentScreen !== AppScreen.Results) {
      // General error screen if something breaks badly
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t.errorOccurred}</h2>
          <p className="text-muted mb-6">{error}</p>
          <button onClick={handleRestart} className="px-6 py-2 bg-primary-light text-white font-semibold rounded-lg">
            {t.tryAgain}
          </button>
        </div>
      );
    }

    switch (currentScreen) {
      case AppScreen.Home:
        return <HomePage onStart={handleStart} language={language} setLanguage={handleLanguageChange} />;
      case AppScreen.Form:
        return <UserInfoForm onSubmit={handleFormSubmit} language={language} onLanguageChange={handleLanguageChange} />;
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
          return <ResultsPage result={evaluationResult} onRestart={handleRestart} language={userInfo?.language || language} />;
        }
        if(error) {
             return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">{t.errorOccurred}</h2>
                  <p className="text-muted mb-6">{error}</p>
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
    <div className="min-h-screen bg-background font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;
