import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, SpeechRecognition } from '../types';
import { translations } from '../constants';
import { MicIcon, UserIcon, BotIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';

interface IntroductionScreenProps {
  onComplete: (text: string) => void;
  language: Language;
  onBack: () => void;
}

const IntroductionScreen: React.FC<IntroductionScreenProps> = ({ onComplete, language, onBack }) => {
  const t = translations[language];
  const { settings } = useSettings();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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
  
  useEffect(() => {
    speak(t.introductionGreeting);
  }, [speak, t.introductionGreeting]);

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
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
           setTranscript(prev => prev + event.results[i][0].transcript);
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`${t.errorOccurred}: ${event.error}. ${t.checkMicPermissions}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      // The onend event can fire unexpectedly, so we only want to stop listening if the user intended to.
      // It's managed by the button clicks instead.
    };
    
    recognitionRef.current = recognition;
  }, [language, t]);

  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, [setupSpeechRecognition]);

  const handleStartRecording = () => {
    setTranscript('');
    setIsComplete(false);
    setError('');
    setIsListening(true);
    recognitionRef.current?.start();
  };
  
  const handleStopRecording = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    if (transcript.trim().length > 10) { // A small check for a meaningful intro
      setIsComplete(true);
    }
  };

  const renderButtons = () => {
    if (isListening) {
      return (
        <button onClick={handleStopRecording} className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-all animate-pulse">
            <MicIcon className="w-6 h-6 mr-2" />
            {t.stopRecording}
        </button>
      );
    }

    if (isComplete) {
      return (
        <div className="flex flex-col items-center justify-center gap-3">
            <button onClick={() => onComplete(transcript)} className="w-full sm:w-auto py-3 px-8 bg-primary-light text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-all">
                {t.continueToInterview}
            </button>
            <button onClick={handleStartRecording} className="font-semibold text-muted dark:text-gray-400 hover:text-primary-light transition-colors">
                {t.reRecord}
            </button>
        </div>
      );
    }

    return (
        <button onClick={handleStartRecording} className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-all">
            <MicIcon className="w-6 h-6 mr-2" />
            {t.startIntroduction}
        </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl bg-surface dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 text-center">{t.introductionTitle}</h2>
        
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <div className="bg-gray-100 dark:bg-gray-700/60 text-text dark:text-gray-200 p-6 rounded-xl mb-6 shadow-sm">
            <div className="flex items-start space-x-4">
                <BotIcon className="w-8 h-8 flex-shrink-0 mt-1 text-primary-light" />
                <p className="text-lg">{t.introductionGreeting}</p>
            </div>
        </div>

        <div className="min-h-[150px] bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-muted dark:text-gray-300 flex items-center mb-2"><UserIcon className="w-5 h-5 mr-2"/> {t.yourIntroduction}</h3>
            <p className="text-gray-800 dark:text-gray-200">{transcript || <span className="text-gray-400 italic">{isListening ? t.speakNow : 'Your recorded introduction will appear here...'}</span>}</p>
            {isListening && <div className="flex items-center space-x-2 text-primary-light mt-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span>{t.processing}</span></div>}
        </div>

        <div className="mt-8">
            <div className="flex items-center justify-center">
                {renderButtons()}
            </div>
            {!isListening && (
                <div className="text-center mt-4">
                    <button onClick={onBack} className="font-semibold text-sm text-muted dark:text-gray-400 hover:text-primary-light transition-colors">
                        {t.back}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionScreen;