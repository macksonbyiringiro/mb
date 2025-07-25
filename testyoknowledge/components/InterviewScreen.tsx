
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewQuestion, InterviewAnswer, Language, SpeechRecognition } from '../types';
import { translations } from '../constants';
import { MicIcon, BotIcon, UserIcon, BookmarkIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';

interface InterviewScreenProps {
  questions: InterviewQuestion[];
  onComplete: (answers: InterviewAnswer[]) => void;
  language: Language;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ questions, onComplete, language }) => {
  const t = translations[language];
  const { settings } = useSettings();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.volume = settings.volume;
    window.speechSynthesis.speak(utterance);
  }, [language, settings.volume]);

  const saveCurrentAnswer = useCallback(() => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    
    const newAnswer: InterviewAnswer = {
      questionId: currentQ.id,
      question: currentQ.question,
      answer: transcript || (isAnswering ? "No answer provided." : ""),
      markedForReview: answers.find(a => a.questionId === currentQ.id)?.markedForReview || false,
    };

    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQ.id);
    let updatedAnswers;
    if (existingAnswerIndex > -1) {
        updatedAnswers = [...answers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
        updatedAnswers = [...answers, newAnswer];
    }
    setAnswers(updatedAnswers);
    return updatedAnswers;
  }, [answers, currentQuestionIndex, isAnswering, questions, transcript]);
  
  // Load question and existing answer when index changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQ = questions[currentQuestionIndex];
      speak(currentQ.question);
      
      const existingAnswer = answers.find(a => a.questionId === currentQ.id);
      if (existingAnswer) {
        setTranscript(existingAnswer.answer);
        setIsAnswering(true);
      } else {
        setTranscript('');
        setIsAnswering(false);
      }
    }
  }, [currentQuestionIndex, questions, speak]); // Do not include 'answers' to avoid loops

  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError(t.unsupportedBrowser);
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`${t.errorOccurred}: ${event.error}. ${t.checkMicPermissions}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
  }, [language, t, isListening]);
  
  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleStartAnswering = () => {
    setIsAnswering(true);
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  };
  
  const handleToggleMarkForReview = () => {
    const questionId = questions[currentQuestionIndex].id;
    const existingAnswer = answers.find(a => a.questionId === questionId);
    const isMarked = existingAnswer?.markedForReview || false;

    const newAnswer: InterviewAnswer = {
      questionId: questionId,
      question: questions[currentQuestionIndex].question,
      answer: transcript,
      markedForReview: !isMarked,
    };

    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    let updatedAnswers;
    if (existingAnswerIndex > -1) {
        updatedAnswers = [...answers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
        updatedAnswers = [...answers, newAnswer];
    }
    setAnswers(updatedAnswers);
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const handleNext = () => {
    stopListening();
    const updatedAnswers = saveCurrentAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(updatedAnswers || answers);
    }
  };

  const handlePrevious = () => {
    stopListening();
    saveCurrentAnswer();

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const isMarked = !!answers.find(a => a.questionId === currentQuestion?.id)?.markedForReview;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl bg-surface dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 text-center">{t.interviewScreenTitle}</h2>
        <div className="text-center mb-4 text-muted dark:text-gray-400">{`${t.question} ${currentQuestionIndex + 1} / ${questions.length}`}</div>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <div className="bg-primary-dark text-white p-6 rounded-xl mb-6 shadow-md">
            <div className="flex items-start space-x-4">
                <BotIcon className="w-8 h-8 flex-shrink-0 mt-1 text-primary-light" />
                <p className="text-xl font-semibold">{currentQuestion?.question}</p>
            </div>
        </div>

        <div className="min-h-[150px] bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-muted dark:text-gray-300 flex items-center mb-2"><UserIcon className="w-5 h-5 mr-2"/> {t.yourAnswer}</h3>
            <p className="text-gray-800 dark:text-gray-200">{isListening ? (transcript ? transcript : <span className="text-gray-400 italic">{t.speakNow}</span>) : transcript}</p>
            {isListening && <div className="flex items-center space-x-2 text-primary-light mt-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span>{t.processing}</span></div>}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isAnswering ? (
            <button onClick={handleStartAnswering} className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-all">
                <MicIcon className="w-6 h-6 mr-2" />
                {t.startAnswering}
            </button>
          ) : (
             <>
                {currentQuestionIndex > 0 && (
                    <button onClick={handlePrevious} className="py-3 px-6 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
                        {t.previousQuestion}
                    </button>
                )}
                <button
                    onClick={handleToggleMarkForReview}
                    className={`p-3 rounded-lg transition-colors ${
                    isMarked
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                    aria-label="Mark for review"
                >
                    <BookmarkIcon className="w-6 h-6" />
                </button>
                <button onClick={handleNext} className="flex-grow py-3 px-8 bg-primary-light text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-all">
                    {currentQuestionIndex < questions.length - 1 ? t.nextQuestion : t.finishInterview}
                </button>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
