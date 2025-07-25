
import React, { useState } from 'react';
import { UserInfo, InterviewPurpose, Language } from '../types';
import { translations, purposeOptions } from '../constants';
import Loader from './Loader';

interface UserInfoFormProps {
  onSubmit: (info: UserInfo) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit, language, onLanguageChange }) => {
  const t = translations[language];
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    companyName: '',
    position: '',
    companyWebsite: '',
    purpose: InterviewPurpose.JobInterview,
    language: language,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Please fill in your name, position, and company name.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate a small delay to show loading state before calling parent submit
    setTimeout(() => {
        onSubmit(userInfo);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-dark mb-2">{t.userInformation}</h2>
        <p className="text-muted mb-6">{t.fillFormPrompt}</p>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
             <Loader text={t.generateQuestions} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t.fullName}</label>
              <input type="text" name="fullName" id="fullName" value={userInfo.fullName} onChange={handleChange} placeholder={t.fullNamePlaceholder} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">{t.companyName}</label>
              <input type="text" name="companyName" id="companyName" value={userInfo.companyName} onChange={handleChange} placeholder={t.companyNamePlaceholder} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">{t.positionAppliedFor}</label>
              <input type="text" name="position" id="position" value={userInfo.position} onChange={handleChange} placeholder={t.positionAppliedForPlaceholder} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
            </div>
             <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">{t.companyWebsite}</label>
              <input type="url" name="companyWebsite" id="companyWebsite" value={userInfo.companyWebsite} onChange={handleChange} placeholder={t.companyWebsitePlaceholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">{t.selectPurpose}</label>
              <select name="purpose" id="purpose" value={userInfo.purpose} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm rounded-md">
                {purposeOptions.map(p => (
                  <option key={p} value={p}>{translations[language][p.replace(/\s/g, '').toLowerCase() as keyof typeof t]}</option>
                ))}
              </select>
            </div>
             <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t.selectLanguage}</label>
              <select name="language" id="language" value={userInfo.language} onChange={handleLanguageSelect} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm rounded-md">
                 <option value={Language.EN}>{t.uk}</option>
                 <option value={Language.RW}>{t.rwanda}</option>
              </select>
            </div>
            <button type="submit" className="w-full mt-6 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-primary-text bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all">
              {t.generateQuestions}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserInfoForm;
