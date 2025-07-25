
import React, { useState } from 'react';
import { UserInfo, InterviewPurpose, Language } from '../types';
import { translations, purposeOptions, purposeDetails } from '../constants';
import Loader from './Loader';

interface UserInfoFormProps {
  onSubmit: (info: UserInfo) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, language, onLanguageChange, onBack, isLoading, error }) => {
  const t = translations[language];
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    companyName: '',
    position: '',
    companyWebsite: '',
    purpose: InterviewPurpose.JobInterview,
    language: language,
  });
  
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setUserInfo(prev => ({ ...prev, language: newLang }));
    onLanguageChange(newLang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.fullName || !userInfo.position || !userInfo.companyName) {
      setValidationError('Please fill in your name, position, and company name.');
      return;
    }
    setValidationError('');
    onSubmit(userInfo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg bg-surface dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">{t.userInformation}</h2>
        <p className="text-muted dark:text-gray-400 mb-6">{t.fillFormPrompt}</p>

        {(error || validationError) && <p className="text-red-500 bg-red-100 dark:bg-red-900/40 dark:text-red-300 p-3 rounded-lg mb-4">{error || validationError}</p>}

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
             <Loader text={t.generateQuestions} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.fullName}</label>
              <input type="text" name="fullName" id="fullName" value={userInfo.fullName} onChange={handleChange} placeholder={t.fullNamePlaceholder} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light text-text dark:text-gray-200" />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.companyName}</label>
              <input type="text" name="companyName" id="companyName" value={userInfo.companyName} onChange={handleChange} placeholder={t.companyNamePlaceholder} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light text-text dark:text-gray-200" />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.positionAppliedFor}</label>
              <input type="text" name="position" id="position" value={userInfo.position} onChange={handleChange} placeholder={t.positionAppliedForPlaceholder} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light text-text dark:text-gray-200" />
            </div>
             <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.companyWebsite}</label>
              <input type="url" name="companyWebsite" id="companyWebsite" value={userInfo.companyWebsite} onChange={handleChange} placeholder={t.companyWebsitePlaceholder} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light text-text dark:text-gray-200" />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.selectPurpose}</label>
              <select name="purpose" id="purpose" value={userInfo.purpose} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm rounded-md text-text dark:text-gray-200">
                {purposeOptions.map(p => {
                    const detail = purposeDetails[p];
                    return <option key={p} value={p}>{t[detail.key as keyof typeof t]}</option>
                })}
              </select>
               {userInfo.purpose && (
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-muted dark:text-gray-400">
                        {t[purposeDetails[userInfo.purpose].descriptionKey as keyof typeof t]}
                    </p>
                </div>
              )}
            </div>
             <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.selectLanguage}</label>
              <select name="language" id="language" value={userInfo.language} onChange={handleLanguageSelect} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm rounded-md text-text dark:text-gray-200">
                 <option value={Language.EN}>{t.uk}</option>
                 <option value={Language.RW}>{t.rwanda}</option>
              </select>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
                <button type="button" onClick={onBack} className="w-full sm:w-auto py-2.5 px-6 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all">
                    {t.back}
                </button>
                <button type="submit" className="w-full sm:w-auto py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-primary-text bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all">
                    {t.generateQuestions}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserInfoForm;
