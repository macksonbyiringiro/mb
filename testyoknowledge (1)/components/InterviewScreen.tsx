
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewQuestion, InterviewAnswer, Language, SpeechRecognition } from '../types';
import { translations } from '../constants';
import { MicIcon, BotIcon, UserIcon } from './icons';

interface InterviewScreenProps {
  questions: InterviewQuestion[];
  onComplete: (answers: InterviewAnswer[]) => void;
  language: Language;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ questions, onComplete, language }) => {
  const t = translations[language];
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
    window.speechSynthesis.speak(utterance);
  }, [language]);

  useEffect(() => {
    if (questions.length > 0) {
      speak(questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, questions, speak]);
  
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
        // Restart if it stops prematurely
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

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const handleNext = () => {
    stopListening();
    const newAnswer: InterviewAnswer = {
      questionId: questions[currentQuestionIndex].id,
      question: questions[currentQuestionIndex].question,
      answer: transcript || "No answer provided.",
    };
    setAnswers(prev => [...prev, newAnswer]);
    setTranscript('');
    setIsAnswering(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete([...answers, newAnswer]);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-3xl bg-surface p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-primary-dark mb-4 text-center">{t.interviewScreenTitle}</h2>
        <div className="text-center mb-4 text-muted">{`${t.question} ${currentQuestionIndex + 1} / ${questions.length}`}</div>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <div className="bg-primary-dark text-white p-6 rounded-xl mb-6 shadow-md">
            <div className="flex items-start space-x-4">
                <BotIcon className="w-8 h-8 flex-shrink-0 mt-1 text-primary-light" />
                <p className="text-xl font-semibold">{currentQuestion?.question}</p>
            </div>
        </div>

        <div className="min-h-[150px] bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-muted flex items-center mb-2"><UserIcon className="w-5 h-5 mr-2"/> {t.yourAnswer}</h3>
            <p className="text-gray-800">{isListening ? (transcript ? transcript : <span className="text-gray-400 italic">{t.speakNow}</span>) : transcript}</p>
            {isListening && <div className="flex items-center space-x-2 text-primary-light mt-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span>{t.processing}</span></div>}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {!isAnswering ? (
            <button onClick={handleStartAnswering} className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-all">
                <MicIcon className="w-6 h-6 mr-2" />
                {t.startAnswering}
            </button>
          ) : (
            <button onClick={handleNext} className="w-full sm:w-auto py-3 px-8 bg-primary-light text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-all">
                {currentQuestionIndex < questions.length - 1 ? t.nextQuestion : t.finishInterview}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
