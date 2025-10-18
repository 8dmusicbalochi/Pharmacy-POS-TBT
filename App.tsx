import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, ReactNode, useRef } from 'react';
import { User, UserRole, Product, CartItem, Sale, AuditLog, AppSettings, Category, PaymentMethod, Supplier } from './types';
import mockApi from './services/mockApi';

// Declare the html5-qrcode library which is loaded from a script tag
declare var Html5Qrcode: any;
// Declare the qrcode library
declare var QRCode: any;

// --- ICONS --- //
const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    pos: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    inventory: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    products: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v-3c0-1.1.9-2 2-2z" /></svg>,
    suppliers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1" /></svg>,
    sales: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    minus: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
    print: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>,
    close: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    key: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
    clipboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    cash: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2H4z" clipRule="evenodd" /></svg>,
    card: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v6a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    arrowLeft: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
    tag: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A1 1 0 012 10V5a1 1 0 011-1h5a1 1 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    category: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>,
    dollar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    trendingUp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    download: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 12a1 1 0 011 1v2a1 1 0 001 1h8a1 1 0 001-1v-2a1 1 0 112 0v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a1 1 0 011-1z" /><path d="M10 2a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 2z" /></svg>,
    hamburger: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    barcode: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
    trophy: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 1.046C11.527 1.012 12.473 1.012 13 1.046m-2 0a8.952 8.952 0 00-2.831.621m2.831-.621a8.952 8.952 0 012.831.621m0 0A8.953 8.953 0 0116 3.469m-2.831-.622a8.953 8.953 0 00-2.831-.622m0 0l-.333 1.181m.333-1.181l.333 1.181m0 0A8.953 8.953 0 0116 3.469m-2.831-.622a8.953 8.953 0 00-2.831-.622m7.429 2.122a8.953 8.953 0 012.831.621M16 3.469a8.953 8.953 0 012.831.621m0 0l.333 1.181m-.333-1.181l-.333 1.181m0 0a8.953 8.953 0 01-2.831.621m2.831-.621a8.953 8.953 0 002.831.621m0 0l-.333 1.181m.333-1.181l.333 1.181M4 9h16M4 9a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-2 2H4zm0 0v10a2 2 0 002 2h12a2 2 0 002-2V9" /></svg>,
    sort: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>,
    sortAsc: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
    sortDesc: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
};


// --- HELPERS --- //
const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { text: 'N/A', className: '', days: Infinity };
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Expired`, className: 'text-red-700 dark:text-red-400 font-bold', days: diffDays };
    }
    if (diffDays <= 30) {
        return { text: `Expires in ${diffDays} day(s)`, className: 'text-amber-600 dark:text-amber-400', days: diffDays };
    }
    return { text: expiry.toLocaleDateString(), className: '', days: diffDays };
};

const INPUT_FIELD_CLASSES = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-transparent focus:outline-none focus:ring-primary focus:border-primary dark:border-gray-600 dark:text-white";

// --- THEME CONTEXT --- //
type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextType | null>(null);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

// --- AUTH CONTEXT --- //
type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('currentUser');
        return null;
    }
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = mockApi.getUsersForAuth();
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const userToSave = { ...foundUser };
      delete userToSave.password;
      setUser(userToSave);
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


// --- DATA STORE CONTEXT --- //
type StoreContextType = {
    users: Omit<User, 'password'>[];
    products: Product[];
    sales: Sale[];
    auditLogs: AuditLog[];
    settings: AppSettings;
    categories: Category[];
    suppliers: Supplier[];
    refreshData: () => void;
    saveUser: (user: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    saveProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    addSale: (sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'>) => Promise<Sale>;
    addAuditLog: (log: Omit<AuditLog, 'id'>) => Promise<void>;
    saveSettings: (settings: AppSettings) => Promise<void>;
    saveCategory: (category: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    saveSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    bulkAddProducts: (products: Omit<Product, 'id'>[]) => Promise<{ added: number; updated: number }>;
};

const StoreContext = createContext<StoreContextType | null>(null);

const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [settings, setSettings] = useState<AppSettings>({ appName: 'Pharmasist', currencySymbol: '$' });
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const refreshData = useCallback(() => {
        setUsers(mockApi.getUsers());
        setProducts(mockApi.getProducts());
        setSales(mockApi.getSales());
        setAuditLogs(mockApi.getAuditLogs());
        setSettings(mockApi.getSettings());
        setCategories(mockApi.getCategories());
        setSuppliers(mockApi.getSuppliers());
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const saveUser = async (user: User) => {
        mockApi.saveUser(user);
        refreshData();
    };

    const deleteUser = async (userId: string) => {
        mockApi.deleteUser(userId);
        refreshData();
    };

    const saveProduct = async (product: Product) => {
        mockApi.saveProduct(product);
        refreshData();
    };

    const deleteProduct = async (productId: string) => {
        mockApi.deleteProduct(productId);
        refreshData();
    }

    const addSale = async (sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'>) => {
        const newSale = mockApi.addSale(sale);
        refreshData();
        return newSale;
    }

    const addAuditLog = async (log: Omit<AuditLog, 'id'>) => {
        mockApi.addAuditLog(log);
        refreshData();
    };

    const saveSettings = async (newSettings: AppSettings) => {
        mockApi.saveSettings(newSettings);
        refreshData();
    };

    const saveCategory = async (category: Category) => {
        mockApi.saveCategory(category);
        refreshData();
    };

    const deleteCategory = async (categoryId: string) => {
        mockApi.deleteCategory(categoryId);
        refreshData();
    };

    const saveSupplier = async (supplier: Supplier) => {
        mockApi.saveSupplier(supplier);
        refreshData();
    };

    const deleteSupplier = async (supplierId: string) => {
        mockApi.deleteSupplier(supplierId);
        refreshData();
    };

    const bulkAddProducts = async (products: Omit<Product, 'id'>[]) => {
        const result = mockApi.bulkAddProducts(products);
        refreshData();
        return result;
    };


    return (
        <StoreContext.Provider value={{ users, products, sales, auditLogs, settings, categories, suppliers, refreshData, saveUser, deleteUser, saveProduct, deleteProduct, addSale, addAuditLog, saveSettings, saveCategory, deleteCategory, saveSupplier, deleteSupplier, bulkAddProducts }}>
            {children}
        </StoreContext.Provider>
    );
};

const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};

// --- REUSABLE HOOKS --- //
type SortDirection = 'asc' | 'desc';
type SortConfig<T> = {
    key: keyof T;
    direction: SortDirection;
} | null;

const useSort = <T,>(items: T[], initialConfig: SortConfig<T> = null) => {
    const [sortConfig, setSortConfig] = useState(initialConfig);

    const sortedItems = useMemo(() => {
        if (!sortConfig) {
            return items;
        }

        return [...items].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                 if (aValue.toLowerCase() < bValue.toLowerCase()) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue.toLowerCase() > bValue.toLowerCase()) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
            } else {
                 if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }, [items, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};


// --- REUSABLE COMPONENTS --- //
const SortableHeader: React.FC<{
    label: string;
    sortKey: any;
    sortConfig: SortConfig<any>;
    requestSort: (key: any) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className="" }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig?.direction === 'asc' ? icons.sortAsc : icons.sortDesc) : icons.sort;
    return (
        <th className={`px-4 py-3 cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
            {label} {directionIcon}
        </th>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md flex items-center justify-between">
        <div className="overflow-hidden">
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{title}</p>
            <p className="text-2xl font-bold text-dark dark:text-light break-words">{value}</p>
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-full ml-4 flex-shrink-0">{icon}</div>
    </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string; }> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className={`bg-white dark:bg-dark-card rounded-lg shadow-xl w-full ${maxWidth}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-dark dark:text-light">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">{icons.close}</button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-dark dark:text-light">{title}</h3>
                </div>
                <div className="p-6 text-gray-600 dark:text-gray-300">{children}</div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const BarcodeScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<any>(null);

    const handleStop = useCallback(() => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop()
                .then(() => {
                    if (scannerRef.current) {
                        scannerRef.current.clear();
                        scannerRef.current = null;
                    }
                })
                .catch((err: any) => {
                    console.error("Failed to stop scanner.", err);
                });
        }
    }, []);

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            const html5QrCode = new Html5Qrcode("barcode-reader");
            scannerRef.current = html5QrCode;
            
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            const successCallback = (decodedText: string, decodedResult: any) => {
                onScanSuccess(decodedText);
                handleStop();
                onClose();
            };

            const errorCallback = (error: any) => {
                // This callback is called frequently, so it's best to keep it quiet
                // console.warn(`Code scan error = ${error}`);
            };
            
            html5QrCode.start({ facingMode: "environment" }, config, successCallback, errorCallback)
                .catch((err: any) => {
                    console.error("Unable to start scanning.", err);
                    alert("Error starting scanner. Please ensure camera permissions are enabled.");
                    handleStop();
                    onClose();
                });

        }
        
        return () => {
             if (isOpen) { // This will trigger on unmount of modal if it was open
                handleStop();
            }
        };

    }, [isOpen, onScanSuccess, onClose, handleStop]);

    return (
        <Modal isOpen={isOpen} onClose={() => { handleStop(); onClose(); }} title="Scan Barcode">
            <div id="barcode-reader" style={{ width: '100%' }}></div>
        </Modal>
    );
};

// --- PAGES / VIEWS --- //

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { settings } = useStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (!success) {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="min-h-screen bg-light dark:bg-dark-bg flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary">{settings.appName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back! Please sign in.</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300" htmlFor="username">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 bg-transparent text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="e.g. admin"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 bg-transparent text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="e.g. password"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                </div>
                 <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                    <h4 className="font-semibold mb-2 text-center text-gray-600 dark:text-gray-300">Demo Credentials</h4>
                    <ul className="space-y-1">
                        <li><b>Admin:</b> admin / password</li>
                        <li><b>Manager:</b> manager / password</li>
                        <li><b>Cashier:</b> cashier / password</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { products, sales, settings } = useStore();
    const [salesOverviewDays, setSalesOverviewDays] = useState(30);

    const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
    const totalProfit = useMemo(() => sales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0), [sales]);
    const inventoryValueCost = useMemo(() => products.reduce((sum, p) => sum + (p.cost || 0) * p.stock, 0), [products]);
    const lowStockProducts = useMemo(() => products.filter(p => p.stock <= p.lowStockThreshold), [products]);

    const expiringProducts = useMemo(() => {
        return products
            .filter(p => p.expiryDate)
            .map(p => ({...p, expiryStatus: getExpiryStatus(p.expiryDate) }))
            .filter(p => p.expiryStatus.days <= 30)
            .sort((a, b) => a.expiryStatus.days - b.expiryStatus.days);
    }, [products]);
    
    const todayStats = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaysSales = sales.filter(s => new Date(s.timestamp) >= todayStart);
        const revenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
        const transactions = todaysSales.length;

        return { revenue, transactions };
    }, [sales]);

    const bestSellingProduct = useMemo(() => {
        if (sales.length === 0) return 'N/A';
        const productQuantities = new Map<string, number>();
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const currentQty = productQuantities.get(item.id) || 0;
                productQuantities.set(item.id, currentQty + item.quantity);
            });
        });

        if (productQuantities.size === 0) return 'N/A';
        
        let bestSellerId = '';
        let maxQty = 0;
        productQuantities.forEach((qty, id) => {
            if (qty > maxQty) {
                maxQty = qty;
                bestSellerId = id;
            }
        });

        const product = products.find(p => p.id === bestSellerId);
        return product ? `${product.name} (${maxQty} sold)` : 'N/A';

    }, [sales, products]);
    
    const salesOverviewData = useMemo(() => {
        const data = [];
        const today = new Date();
        
        for (let i = 0; i < salesOverviewDays; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const dailyTotal = sales
                .filter(s => {
                    const saleDate = new Date(s.timestamp);
                    return saleDate >= startOfDay && saleDate <= endOfDay;
                })
                .reduce((sum, s) => sum + s.total, 0);
            
            data.push({
                date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                total: dailyTotal
            });
        }
        
        const reversedData = data.reverse();
        const maxSale = Math.max(...reversedData.map(d => d.total));
        
        return {
            chartData: reversedData,
            maxSale: maxSale > 0 ? maxSale : 1 // Avoid division by zero for height calculation
        };
    }, [sales, salesOverviewDays]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-dark dark:text-light mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Today's Revenue" value={`${settings.currencySymbol}${todayStats.revenue.toFixed(2)}`} icon={icons.trendingUp} />
                <StatCard title="Today's Transactions" value={todayStats.transactions} icon={icons.sales} />
                <StatCard title="Total Profit (All-time)" value={`${settings.currencySymbol}${totalProfit.toFixed(2)}`} icon={icons.dollar} />
                <StatCard title="Low Stock Alerts" value={lowStockProducts.length} icon={icons.bell} />
                <div className="md:col-span-2">
                    <StatCard title="Best Selling Product" value={bestSellingProduct} icon={icons.trophy} />
                </div>
                <StatCard title="Inventory Value (Cost)" value={`${settings.currencySymbol}${inventoryValueCost.toFixed(2)}`} icon={icons.inventory} />
                <StatCard title="Total Revenue (All-time)" value={`${settings.currencySymbol}${totalRevenue.toFixed(2)}`} icon={icons.dollar} />
            </div>
            
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-light mb-2 sm:mb-0">Sales Overview</h2>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button onClick={() => setSalesOverviewDays(7)} className={`px-3 py-1 text-sm rounded-md transition-all ${salesOverviewDays === 7 ? 'bg-white dark:bg-dark-card shadow font-semibold text-primary' : 'text-gray-600 dark:text-gray-300'}`}>7 Days</button>
                        <button onClick={() => setSalesOverviewDays(30)} className={`px-3 py-1 text-sm rounded-md transition-all ${salesOverviewDays === 30 ? 'bg-white dark:bg-dark-card shadow font-semibold text-primary' : 'text-gray-600 dark:text-gray-300'}`}>30 Days</button>
                    </div>
                </div>
                <div className="h-64 flex items-end justify-around gap-1 sm:gap-2 border-b border-l border-gray-200 dark:border-gray-700 p-2">
                    {salesOverviewData.chartData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                            <div 
                                className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-md transition-colors"
                                style={{ height: `${(day.total / salesOverviewData.maxSale) * 100}%` }}
                            >
                                <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-dark text-light text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    {settings.currencySymbol}{day.total.toFixed(2)}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 whitespace-nowrap">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 dark:text-light">Low Stock Items</h2>
                    {lowStockProducts.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {lowStockProducts.map(p => (
                            <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-dark dark:text-light">
                                <span>{p.name} ({p.sku})</span>
                                <span className="font-bold text-red-600 dark:text-red-400">{p.stock} left</span>
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No items are low on stock.</p>
                    )}
                </div>
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 dark:text-light">Expiring Soon & Expired Items ({expiringProducts.length})</h2>
                     {expiringProducts.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {expiringProducts.map(p => {
                            const status = getExpiryStatus(p.expiryDate);
                            return (
                                <li key={p.id} className={`flex justify-between items-center text-sm p-2 rounded-md border ${status.days < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30'} text-dark dark:text-light`}>
                                    <span>{p.name} ({p.sku})</span>
                                    <span className={`font-bold ${status.className}`}>{status.text}</span>
                                </li>
                            )
                        })}
                    </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No items are expiring soon.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod) => void;
    total: number;
    currencySymbol: string;
}> = ({ isOpen, onClose, onConfirm, total, currencySymbol }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [amountTendered, setAmountTendered] = useState<string>('');
    
    useEffect(() => {
        if (isOpen) {
            setAmountTendered('');
            setPaymentMethod(PaymentMethod.CASH);
        }
    }, [isOpen]);

    const tendered = parseFloat(amountTendered) || 0;
    const changeDue = tendered > total ? tendered - total : 0;
    const canConfirm = paymentMethod === PaymentMethod.CARD || (paymentMethod === PaymentMethod.CASH && tendered >= total);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payment">
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Total Amount Due</p>
                    <p className="text-4xl font-bold text-dark dark:text-light">{currencySymbol}{total.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${paymentMethod === PaymentMethod.CASH ? 'border-primary bg-primary/10 text-primary' : 'dark:border-gray-600'}`}>
                        {icons.cash} Cash
                    </button>
                    <button 
                        onClick={() => setPaymentMethod(PaymentMethod.CARD)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${paymentMethod === PaymentMethod.CARD ? 'border-primary bg-primary/10 text-primary' : 'dark:border-gray-600'}`}>
                        {icons.card} Card
                    </button>
                </div>

                {paymentMethod === PaymentMethod.CASH && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Tendered</label>
                        <input
                            type="number"
                            value={amountTendered}
                            onChange={e => setAmountTendered(e.target.value)}
                            placeholder="0.00"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                        {tendered > 0 && (
                            <div className="mt-2 text-right">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Change Due: </span>
                                <span className="font-bold text-green-600 dark:text-green-400">{currencySymbol}{changeDue.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="pt-4">
                    <button
                        onClick={() => onConfirm(paymentMethod)}
                        disabled={!canConfirm}
                        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </Modal>
    );
};


const POSPage: React.FC = () => {
    const { products, addSale, settings } = useStore();
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [receipt, setReceipt] = useState<Sale | null>(null);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState<string>('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const isExpired = p.expiryDate ? new Date(p.expiryDate) < new Date() : false;
            return (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.sku.toLowerCase().includes(searchTerm.toLowerCase())) && p.stock > 0 && !isExpired
        });
    }, [products, searchTerm]);

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if(existingItem.quantity < product.stock) {
                   return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                }
                return prevCart;
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
    
    const updateQuantity = (productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            const newQuantity = Math.min(quantity, product.stock);
            setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };
    
    const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

    const { discountAmount, finalTotal } = useMemo(() => {
        const numericDiscountValue = parseFloat(discountValue) || 0;
        let calculatedDiscount = 0;

        if (numericDiscountValue > 0 && subtotal > 0) {
            if (discountType === 'percentage') {
                calculatedDiscount = subtotal * (numericDiscountValue / 100);
            } else { // fixed
                calculatedDiscount = numericDiscountValue;
            }
        }

        calculatedDiscount = Math.min(calculatedDiscount, subtotal);
        const total = subtotal - calculatedDiscount;

        return { discountAmount: calculatedDiscount, finalTotal: total };
    }, [subtotal, discountType, discountValue]);


    const handleProceedToPayment = () => {
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = async (paymentMethod: PaymentMethod) => {
        if (cart.length === 0 || !user) return;
        const numericDiscountValue = parseFloat(discountValue) || 0;
        
        const newSale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'> = {
            items: cart,
            subtotal: subtotal,
            ...(numericDiscountValue > 0 && {
                discountType: discountType,
                discountValue: numericDiscountValue,
                discountAmount: discountAmount,
            }),
            total: finalTotal,
            timestamp: new Date().toISOString(),
            cashierId: user.id,
            cashierName: user.name,
            paymentMethod: paymentMethod,
        };
        const savedSale = await addSale(newSale);
        
        setIsPaymentModalOpen(false);
        setReceipt(savedSale);
        setCart([]);
        setDiscountValue('');
    };

    const handlePrint = () => {
        window.print();
    }

    const handleBarcodeScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        const product = products.find(p => p.sku.toLowerCase() === decodedText.toLowerCase());
        if (product) {
            const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
            if (isExpired) {
                alert(`Cannot add to cart: The product "${product.name}" is expired.`);
                return;
            }
            if (product.stock > 0) {
                addToCart(product);
            } else {
                alert(`Cannot add to cart: The product "${product.name}" is out of stock.`);
            }
        } else {
            alert(`Product with barcode/SKU "${decodedText}" not found.`);
        }
    };
    
    if (receipt) {
        return <Receipt receipt={receipt} onNewSale={() => setReceipt(null)} onPrint={handlePrint} settings={settings} />
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-100px)]">
                {/* Product List */}
                <div className="lg:w-2/3 bg-white dark:bg-dark-card rounded-xl shadow-md p-4 flex flex-col">
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="relative flex-grow">
                            <input 
                                type="text" 
                                placeholder="Search products by name or SKU..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-white"
                            />
                            <div className="absolute top-0 left-0 pl-3 pt-2.5">{icons.search}</div>
                        </div>
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90 text-sm"
                        >
                            {icons.barcode}
                            Scan
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <button key={product.id} onClick={() => addToCart(product)} className="border dark:border-gray-700 rounded-lg p-3 text-left hover:border-primary hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:hover:border-primary" disabled={product.stock <= (cart.find(item => item.id === product.id)?.quantity ?? 0)}>
                                    <h3 className="font-bold truncate dark:text-light">{product.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400">{product.sku}</p>
                                    <p className="font-semibold text-primary dark:text-accent mt-1">{settings.currencySymbol}{product.price.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{product.stock} in stock</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart/Checkout Panel */}
                <div className="lg:w-1/3 bg-white dark:bg-dark-card rounded-xl shadow-md p-4 flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 dark:text-light">Cart</h2>
                    <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                       {cart.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                {icons.pos}
                                <p className="mt-2">Cart is empty</p>
                           </div>
                       ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="flex-grow">
                                        <p className="font-semibold dark:text-light truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{icons.minus}</button>
                                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} className="w-12 text-center border-none bg-transparent dark:text-white" />
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{icons.plus}</button>
                                    </div>
                                    <p className="font-bold w-20 text-right dark:text-light">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">{icons.trash}</button>
                                </div>
                            ))}
                        </div>
                       )}
                    </div>
                    <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-3">
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-bold dark:text-light">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm h-10">
                                <option value="percentage">%</option>
                                <option value="fixed">{settings.currencySymbol}</option>
                            </select>
                            <input type="number" placeholder="Discount" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg h-10 px-3 dark:text-white" />
                        </div>
                        {discountAmount > 0 && (
                             <div className="flex justify-between text-md">
                                <span className="text-gray-600 dark:text-gray-300">Discount</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">-{settings.currencySymbol}{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-2xl font-bold border-t dark:border-gray-700 pt-3 mt-3">
                            <span className="dark:text-light">Total</span>
                            <span className="text-primary dark:text-accent">{settings.currencySymbol}{finalTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={handleProceedToPayment} disabled={cart.length === 0} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600">
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handleConfirmPayment} total={finalTotal} currencySymbol={settings.currencySymbol} />
            <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleBarcodeScanSuccess} />
        </>
    );
};

const Receipt: React.FC<{ receipt: Sale; onNewSale: () => void; onPrint: () => void; settings: AppSettings; }> = ({ receipt, onNewSale, onPrint, settings }) => {
    const qrCodeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(qrCodeRef.current) {
            qrCodeRef.current.innerHTML = '';
            QRCode.toCanvas(qrCodeRef.current, `Sale ID: ${receipt.id}, Total: ${settings.currencySymbol}${receipt.total.toFixed(2)}`, { width: 80 }, (error: any) => {
                if (error) console.error(error)
            })
        }
    }, [receipt, settings]);

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #receipt-section, #receipt-section * { visibility: visible; }
                    #receipt-section { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>
            <div id="receipt-section">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold dark:text-light">{settings.appName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Sale Receipt</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span>Sale ID: {receipt.id}</span>
                    <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                     <span>Cashier: {receipt.cashierName}</span>
                </div>
                <div className="border-t border-b border-dashed border-gray-300 dark:border-gray-600 py-2 my-2 space-y-2">
                    {receipt.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <div className="flex-grow pr-2">
                                <p className="dark:text-light">{item.name}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">{item.quantity} x {settings.currencySymbol}{item.price.toFixed(2)}</p>
                            </div>
                            <span className="dark:text-light">{settings.currencySymbol}{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-1 text-sm mt-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Subtotal</span>
                        <span>{settings.currencySymbol}{receipt.subtotal.toFixed(2)}</span>
                    </div>
                    {receipt.discountAmount && receipt.discountAmount > 0 && (
                         <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Discount ({receipt.discountType === 'percentage' ? `${receipt.discountValue}%` : `${settings.currencySymbol}${receipt.discountValue}`})</span>
                            <span>-{settings.currencySymbol}{receipt.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 dark:text-light">
                        <span>Total</span>
                        <span>{settings.currencySymbol}{receipt.total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Payment Method</span>
                        <span>{receipt.paymentMethod}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center mt-6 text-center">
                    <div ref={qrCodeRef} className="mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Thank you for your purchase!</p>
                </div>
            </div>
            <div className="flex justify-center gap-4 mt-8 no-print">
                <button onClick={onNewSale} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">New Sale</button>
                <button onClick={onPrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">{icons.print} Print</button>
            </div>
        </div>
    );
};

const ManagementPage: React.FC<{
    title: string;
    children: (searchTerm: string, activeFilters: Record<string, string>) => ReactNode;
    onAddItem?: () => void;
    addBtnText?: string;
    extraActions?: ReactNode;
    filters?: { id: string; label: string; options: { value: string; label: string }[] }[];
}> = ({ title, children, onAddItem, addBtnText, extraActions, filters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (filterId: string, value: string) => {
        setActiveFilters(prev => ({...prev, [filterId]: value}));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark dark:text-light">{title}</h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    {onAddItem && addBtnText && (
                        <button onClick={onAddItem} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                           {icons.plus} {addBtnText}
                        </button>
                    )}
                    {extraActions}
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-white"
                        />
                        <div className="absolute top-0 left-0 pl-3 pt-2.5">{icons.search}</div>
                    </div>
                    {filters && filters.map(filter => (
                        <select
                            key={filter.id}
                            value={activeFilters[filter.id] || ''}
                            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                            className="bg-transparent border dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:bg-dark-card"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ))}
                </div>
                <div className="overflow-x-auto">{children(searchTerm, activeFilters)}</div>
            </div>
        </div>
    );
};

const InventoryPage: React.FC = () => {
    const { products, saveProduct, deleteProduct, addAuditLog, categories, suppliers } = useStore();
    const { user } = useAuth();
    
    // Form state
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');
    
    // Modal state for edit/delete
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        // Clear other form fields when a new product is selected to avoid confusion
        setExpiryDate('');
        setLowStockThreshold('');
    };
    
    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    const handleAddStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !quantity) return;

        const oldStock = selectedProduct.stock;
        const quantityAdded = parseInt(quantity, 10);
        if (isNaN(quantityAdded) || quantityAdded <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }
        const newStock = oldStock + quantityAdded;
        
        const updatedProduct: Product = {
            ...selectedProduct,
            stock: newStock,
            expiryDate: expiryDate || selectedProduct.expiryDate,
            lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : selectedProduct.lowStockThreshold,
        };
        
        await saveProduct(updatedProduct);
        await addAuditLog({
            timestamp: new Date().toISOString(),
            userId: user!.id,
            userName: user!.name,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            oldStock,
            newStock,
            reason: 'Stock Added via Inventory Page',
        });
        
        // Reset form
        setSelectedProductId('');
        setQuantity('');
        setExpiryDate('');
        setLowStockThreshold('');
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (product: Product) => {
        await saveProduct(product);
        setIsEditModalOpen(false);
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            await deleteProduct(productToDelete.id);
            setProductToDelete(null);
        }
    };
    
    // For the table
    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);
    const { items: sortedProducts, requestSort, sortConfig } = useSort(filteredProducts, { key: 'name', direction: 'asc' });

    return (
        <>
        <div>
            <h1 className="text-3xl font-bold text-dark dark:text-light mb-6">Inventory</h1>

            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold dark:text-light mb-4">Add Stock</h2>
                <form onSubmit={handleAddStockSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => handleProductSelect(e.target.value)}
                            className={INPUT_FIELD_CLASSES}
                            required
                        >
                            <option value="">Select a product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className={INPUT_FIELD_CLASSES} required min="1" />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={INPUT_FIELD_CLASSES} />
                        {selectedProduct && <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">Current: {selectedProduct.expiryDate || 'N/A'}</small>}
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Alert</label>
                        <input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} className={INPUT_FIELD_CLASSES} min="0" />
                        {selectedProduct && <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">Current: {selectedProduct.lowStockThreshold}</small>}
                    </div>
                    <button type="submit" disabled={!selectedProductId || !quantity} className="bg-primary text-white px-4 py-2 rounded-lg h-10 disabled:bg-gray-400 dark:disabled:bg-gray-600 self-center mt-1">Add Stock</button>
                </form>
            </div>

            <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                 <div className="flex justify-end mb-4">
                     <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-white"
                        />
                        <div className="absolute top-0 left-0 pl-3 pt-2.5">{icons.search}</div>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <SortableHeader label="Product Name" sortKey="name" {...{sortConfig, requestSort}} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Quantity" sortKey="stock" {...{sortConfig, requestSort}} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry Date</th>
                                <SortableHeader label="Stock Alert" sortKey="lowStockThreshold" {...{sortConfig, requestSort}} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedProducts.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">{p.stock}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${getExpiryStatus(p.expiryDate).className}`}>{getExpiryStatus(p.expiryDate).text}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.lowStockThreshold}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(p)} className="text-primary hover:text-opacity-80">{icons.edit}</button>
                                            <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800">{icons.trash}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
        
        <ProductModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleSaveEdit} 
            product={productToEdit} 
            categories={categories} 
            suppliers={suppliers} 
        />
        <ConfirmationModal 
            isOpen={!!productToDelete} 
            onClose={() => setProductToDelete(null)} 
            onConfirm={handleConfirmDelete} 
            title="Delete Product"
        >
            Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone and will remove it from inventory entirely.
        </ConfirmationModal>
        </>
    );
};


const ProductDetailPage: React.FC<{ product: Product, onBack: () => void }> = ({ product, onBack }) => {
    const { settings } = useStore();
    const qrCodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(qrCodeRef.current) {
            qrCodeRef.current.innerHTML = '';
            QRCode.toCanvas(qrCodeRef.current, product.sku, { width: 128 }, (error: any) => {
                if (error) console.error(error)
            })
        }
    }, [product.sku]);
    
    const profitMargin = (product.cost && product.price > product.cost) 
        ? ((product.price - product.cost) / product.price) * 100
        : 0;

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-primary mb-4">{icons.arrowLeft} Back to list</button>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-2/3">
                    <h1 className="text-3xl font-bold dark:text-light mb-1">{product.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{product.sku}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Price</p>
                            <p className="font-semibold text-lg dark:text-light">{settings.currencySymbol}{product.price.toFixed(2)}</p>
                        </div>
                         <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Cost</p>
                            <p className="font-semibold text-lg dark:text-light">{product.cost ? `${settings.currencySymbol}${product.cost.toFixed(2)}` : 'N/A'}</p>
                        </div>
                         <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Profit Margin</p>
                            <p className="font-semibold text-lg dark:text-light">{profitMargin > 0 ? `${profitMargin.toFixed(2)}%` : 'N/A'}</p>
                        </div>
                         <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Stock</p>
                            <p className={`font-semibold text-lg ${product.stock <= product.lowStockThreshold ? 'text-red-500' : 'dark:text-light'}`}>{product.stock}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Low Stock Threshold</p>
                            <p className="font-semibold text-lg dark:text-light">{product.lowStockThreshold}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Category</p>
                            <p className="font-semibold text-lg dark:text-light">{product.category}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Supplier</p>
                            <p className="font-semibold text-lg dark:text-light">{product.supplierName || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                            <p className={`font-semibold text-lg ${getExpiryStatus(product.expiryDate).className}`}>{getExpiryStatus(product.expiryDate).text}</p>
                        </div>
                    </div>
                </div>
                <div className="md:w-1/3 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <p className="font-semibold mb-2 dark:text-light">Product SKU</p>
                    <div ref={qrCodeRef} className="bg-white p-2 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

const ProductManagementPage: React.FC = () => {
    const { products, saveProduct, deleteProduct, categories, suppliers, bulkAddProducts } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [productToView, setProductToView] = useState<Product | null>(null);

    const handleAdd = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            await deleteProduct(productToDelete.id);
            setProductToDelete(null);
        }
    };

    const handleSave = async (product: Product) => {
        await saveProduct(product);
        setIsModalOpen(false);
    };

    const handleBulkSave = async (newProducts: Omit<Product, 'id'>[]) => {
        const result = await bulkAddProducts(newProducts);
        alert(`${result.added} products added, ${result.updated} products updated.`);
        setIsBulkModalOpen(false);
    };

    if (productToView) {
        return <ProductDetailPage product={productToView} onBack={() => setProductToView(null)} />;
    }

    return (
        <>
            <ManagementPage
                title="Products"
                addBtnText="Add Product"
                onAddItem={handleAdd}
                extraActions={
                    <button onClick={() => setIsBulkModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                        {icons.upload} Bulk Import
                    </button>
                }
                filters={[
                    { id: 'category', label: 'Categories', options: categories.map(c => ({ value: c.name, label: c.name })) },
                    { id: 'stockStatus', label: 'Stock Status', options: [
                        { value: 'inStock', label: 'In Stock' },
                        { value: 'lowStock', label: 'Low Stock' },
                        { value: 'outOfStock', label: 'Out of Stock' }
                    ]}
                ]}
            >
                {(searchTerm, activeFilters) => {
                    const filtered = products.filter(p => {
                        const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
                        const categoryMatch = !activeFilters.category || p.category === activeFilters.category;
                        const stockStatusMatch = !activeFilters.stockStatus ||
                            (activeFilters.stockStatus === 'inStock' && p.stock > p.lowStockThreshold) ||
                            (activeFilters.stockStatus === 'lowStock' && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
                            (activeFilters.stockStatus === 'outOfStock' && p.stock === 0);
                        return searchMatch && categoryMatch && stockStatusMatch;
                    });
                    const { items: sortedProducts, requestSort, sortConfig } = useSort(filtered, { key: 'name', direction: 'asc' });

                    return (
                        <>
                            {/* Desktop View */}
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden md:table">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Price" sortKey="price" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Stock" sortKey="stock" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Category" sortKey="category" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {sortedProducts.map(p => {
                                        const expiryStatus = getExpiryStatus(p.expiryDate);
                                        const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
                                        const isOutOfStock = p.stock === 0;
                                        const rowClass = isOutOfStock ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : isLowStock ? 'bg-amber-50 dark:bg-amber-900/20' : '';
                                        return (
                                            <tr key={p.id} className={`${rowClass}`}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => setProductToView(p)}>{p.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.sku}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${p.price.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>{p.stock}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.category}</td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm ${expiryStatus.className}`}>{expiryStatus.text}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.supplierName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEdit(p)} className="text-primary hover:text-opacity-80">{icons.edit}</button>
                                                        <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800">{icons.trash}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {/* Mobile View */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {sortedProducts.map(p => {
                                    const expiryStatus = getExpiryStatus(p.expiryDate);
                                    const isLowStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
                                    const isOutOfStock = p.stock === 0;
                                    const cardClass = isOutOfStock ? 'bg-red-50 dark:bg-red-900/20' : isLowStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-800/50';
                                    return (
                                        <div key={p.id} className={`p-4 rounded-lg border dark:border-gray-700 ${cardClass}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow" onClick={() => setProductToView(p)}>
                                                    <p className="font-bold dark:text-light">{p.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.sku}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.supplierName || 'N/A'}</p>
                                                </div>
                                                <div className="flex gap-2 ml-2">
                                                    <button onClick={() => handleEdit(p)} className="text-primary">{icons.edit}</button>
                                                    <button onClick={() => handleDelete(p)} className="text-red-500">{icons.trash}</button>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-semibold text-primary dark:text-accent">${p.price.toFixed(2)}</p>
                                                    <p><span className="text-gray-500 dark:text-gray-400">Stock: </span><span className={`font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'dark:text-white'}`}>{p.stock}</span></p>
                                                </div>
                                                <div className="text-right">
                                                     <p className={`font-semibold ${expiryStatus.className}`}>{expiryStatus.text}</p>
                                                     <p className="text-gray-500 dark:text-gray-400">{p.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    );
                }}
            </ManagementPage>
            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} product={productToEdit} categories={categories} suppliers={suppliers} />
            <ConfirmationModal 
                isOpen={!!productToDelete} 
                onClose={() => setProductToDelete(null)} 
                onConfirm={handleConfirmDelete} 
                title="Delete Product"
            >
                Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
            </ConfirmationModal>
            <BulkAddModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onSave={handleBulkSave} />
        </>
    );
};

const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
    categories: Category[];
    suppliers: Supplier[];
}> = ({ isOpen, onClose, onSave, product, categories, suppliers }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(product || {
                sku: '',
                name: '',
                price: 0,
                cost: 0,
                stock: 0,
                category: categories.length > 0 ? categories[0].name : '',
                lowStockThreshold: 10,
                supplierId: '',
                expiryDate: ''
            });
        }
    }, [product, isOpen, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'supplierId') {
            const supplier = suppliers.find(s => s.id === value);
            setFormData(prev => ({ ...prev, supplierId: value, supplierName: supplier?.name }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productToSave: Product = {
            id: product?.id || `prod-${Date.now()}`,
            sku: formData.sku!,
            name: formData.name!,
            price: parseFloat(String(formData.price)) || 0,
            cost: parseFloat(String(formData.cost)) || undefined,
            stock: parseInt(String(formData.stock)) || 0,
            category: formData.category!,
            lowStockThreshold: parseInt(String(formData.lowStockThreshold)) || 0,
            expiryDate: formData.expiryDate || undefined,
            supplierId: formData.supplierId || undefined,
            supplierName: formData.supplierName || undefined,
        };
        onSave(productToSave);
    };

    const isFormValid = formData.name && formData.sku && formData.price! > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                    <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={INPUT_FIELD_CLASSES} required>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                    <input type="number" name="price" value={formData.price || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required step="0.01" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost (Optional)</label>
                    <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} step="0.01" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                    <input type="number" name="stock" value={formData.stock || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required min="0" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier (Optional)</label>
                    <select name="supplierId" value={formData.supplierId || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES}>
                        <option value="">None</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (Optional)</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={!isFormValid} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">Save</button>
                </div>
            </form>
        </Modal>
    );
};

const BulkAddModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (products: Omit<Product, 'id'>[]) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [csvText, setCsvText] = useState('');

    const handleSave = () => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const products: Omit<Product, 'id'>[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const productData: any = {};
            headers.forEach((header, index) => {
                productData[header] = values[index]?.trim();
            });

            products.push({
                sku: productData.sku,
                name: productData.name,
                price: parseFloat(productData.price) || 0,
                cost: parseFloat(productData.cost) || 0,
                stock: parseInt(productData.stock) || 0,
                category: productData.category,
                lowStockThreshold: parseInt(productData.lowStockThreshold) || 10,
                expiryDate: productData.expiryDate || undefined,
                supplierName: productData.supplierName || undefined,
            });
        }
        onSave(products);
    };
    
    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "name,sku,price,cost,stock,category,lowStockThreshold,expiryDate,supplierName\n"
            + "Sample Medicine,MED-101,10.99,5.50,100,Medicine,20,2025-12-31,PharmaCore Inc.";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Add Products" maxWidth="max-w-2xl">
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Paste CSV content here. The first line must be a header. Required headers: <strong>name, sku, price, stock, category</strong>. Optional: <strong>cost, lowStockThreshold, expiryDate, supplierName</strong>.</p>
                    <button onClick={downloadTemplate} className="text-sm text-primary hover:underline mt-1">Download CSV Template</button>
                </div>
                <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={10}
                    className="w-full input-field"
                    placeholder="name,sku,price,stock,category..."
                />
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} disabled={!csvText} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">Import Products</button>
                </div>
            </div>
        </Modal>
    );
};

const SalesHistoryPage: React.FC = () => {
    const { sales, settings } = useStore();
    const [saleToView, setSaleToView] = useState<Sale | null>(null);

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Sale ID,Timestamp,Cashier,Total,Profit,Payment Method,Items\n";

        sales.forEach(sale => {
            const items = sale.items.map(item => `${item.name} (x${item.quantity})`).join('; ');
            csvContent += `${sale.id},${new Date(sale.timestamp).toLocaleString()},${sale.cashierName},${sale.total.toFixed(2)},${(sale.totalProfit || 0).toFixed(2)},${sale.paymentMethod},"${items}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <ManagementPage
                title="Sales History"
                extraActions={
                    <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        {icons.download} Export CSV
                    </button>
                }
            >
                {(searchTerm) => {
                    const filtered = sales.filter(s =>
                        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    const { items: sortedSales, requestSort, sortConfig } = useSort(filtered, { key: 'timestamp', direction: 'desc' });

                    return (
                        <>
                            {/* Desktop View */}
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden md:table">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <SortableHeader label="Sale ID" sortKey="id" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Date" sortKey="timestamp" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Cashier" sortKey="cashierName" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <SortableHeader label="Profit" sortKey="totalProfit" sortConfig={sortConfig} requestSort={requestSort} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {sortedSales.map(sale => (
                                        <tr key={sale.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale.id}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sale.timestamp).toLocaleString()}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.cashierName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{settings.currencySymbol}{sale.total.toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{settings.currencySymbol}{(sale.totalProfit || 0).toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => setSaleToView(sale)} className="text-primary hover:underline">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {/* Mobile View */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {sortedSales.map(sale => (
                                    <div key={sale.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold dark:text-light break-all">{sale.id}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(sale.timestamp).toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => setSaleToView(sale)} className="text-primary text-sm whitespace-nowrap ml-2">View</button>
                                        </div>
                                        <div className="mt-4 flex justify-between items-end text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Cashier: <span className="dark:text-light">{sale.cashierName}</span></p>
                                                 <p className="text-gray-500 dark:text-gray-400">Profit: <span className="text-green-600 dark:text-green-400 font-semibold">{settings.currencySymbol}{(sale.totalProfit || 0).toFixed(2)}</span></p>
                                            </div>
                                            <p className="font-bold text-lg text-primary dark:text-accent">{settings.currencySymbol}{sale.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    );
                }}
            </ManagementPage>
            {saleToView && (
                <Modal isOpen={!!saleToView} onClose={() => setSaleToView(null)} title={`Sale Details: ${saleToView.id}`} maxWidth="max-w-lg">
                    <Receipt receipt={saleToView} onNewSale={() => setSaleToView(null)} onPrint={() => {}} settings={settings} />
                </Modal>
            )}
        </>
    );
};

const UserManagementPage: React.FC = () => {
    const { users, saveUser, deleteUser } = useStore();
    const { user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<Omit<User, 'password'> | null>(null);

    const handleAdd = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };
    const handleEdit = (user: Omit<User, 'password'>) => {
        setUserToEdit(user as User);
        setIsModalOpen(true);
    };
    const handleDelete = (user: Omit<User, 'password'>) => {
        if(user.id === currentUser?.id) {
            alert("You cannot delete your own account.");
            return;
        }
        setUserToDelete(user);
    };
    const handleConfirmDelete = async () => {
        if(userToDelete) {
            await deleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };
    const handleSave = async (user: User) => {
        await saveUser(user);
        setIsModalOpen(false);
    };

    return (
        <>
            <ManagementPage title="User Management" addBtnText="Add User" onAddItem={handleAdd}>
                {(searchTerm) => {
                    const filtered = users.filter(u =>
                        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.role.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    const { items: sortedUsers, requestSort, sortConfig } = useSort(filtered, { key: 'name', direction: 'asc' });

                    return (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <SortableHeader label="Name" sortKey="name" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <SortableHeader label="Username" sortKey="username" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <SortableHeader label="Role" sortKey="role" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedUsers.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.username}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.role}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(u)} className="text-primary hover:text-opacity-80">{icons.edit}</button>
                                                <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800" disabled={u.id === currentUser?.id}>{icons.trash}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                }}
            </ManagementPage>
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} user={userToEdit} />
            <ConfirmationModal 
                isOpen={!!userToDelete} 
                onClose={() => setUserToDelete(null)} 
                onConfirm={handleConfirmDelete} 
                title="Delete User"
            >
                Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

const UserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
}> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if(isOpen) {
            setFormData(user || { role: UserRole.CASHIER });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave: User = {
            id: user?.id || `user-${Date.now()}`,
            name: formData.name!,
            username: formData.username!,
            password: formData.password,
            role: formData.role!,
        };
        onSave(userToSave);
    };
    
    const isFormValid = formData.name && formData.username && (user || formData.password);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Add User"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} placeholder={user ? "Leave blank to keep unchanged" : ""} required={!user} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className={INPUT_FIELD_CLASSES} required>
                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={!isFormValid} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">Save</button>
                </div>
            </form>
        </Modal>
    );
};

const CategoryManagementPage: React.FC<{}> = () => {
    const { categories, saveCategory, deleteCategory } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleAdd = () => { setCategoryToEdit(null); setIsModalOpen(true); };
    const handleEdit = (category: Category) => { setCategoryToEdit(category); setIsModalOpen(true); };
    const handleDelete = (category: Category) => { 
        if(category.name === 'General') {
            alert("The 'General' category cannot be deleted.");
            return;
        }
        setCategoryToDelete(category); 
    };
    const handleConfirmDelete = async () => { if(categoryToDelete) { await deleteCategory(categoryToDelete.id); setCategoryToDelete(null); } };
    const handleSave = async (category: Category) => { await saveCategory(category); setIsModalOpen(false); };

    return (
        <>
            <ManagementPage title="Categories" addBtnText="Add Category" onAddItem={handleAdd}>
                {(searchTerm) => {
                    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
                    const { items: sorted, requestSort, sortConfig } = useSort(filtered, { key: 'name', direction: 'asc' });

                    return (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <SortableHeader label="Category Name" sortKey="name" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {sorted.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(c)} className="text-primary hover:text-opacity-80">{icons.edit}</button>
                                                <button onClick={() => handleDelete(c)} disabled={c.name === 'General'} className="text-red-600 hover:text-red-800 disabled:opacity-50">{icons.trash}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                }}
            </ManagementPage>
            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} category={categoryToEdit} />
            <ConfirmationModal isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} onConfirm={handleConfirmDelete} title="Delete Category">
                Products in "{categoryToDelete?.name}" will be moved to "General". Are you sure you want to delete this category?
            </ConfirmationModal>
        </>
    );
};

const CategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (cat: Category) => void; category: Category | null; }> = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState('');
    useEffect(() => { if (isOpen) setName(category?.name || ''); }, [category, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id: category?.id || `cat-${Date.now()}`, name }); };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_FIELD_CLASSES} required />
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={!name} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">Save</button>
                </div>
            </form>
        </Modal>
    );
};


const SupplierManagementPage: React.FC<{}> = () => {
    const { suppliers, saveSupplier, deleteSupplier } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const handleAdd = () => { setSupplierToEdit(null); setIsModalOpen(true); };
    const handleEdit = (supplier: Supplier) => { setSupplierToEdit(supplier); setIsModalOpen(true); };
    const handleDelete = (supplier: Supplier) => setSupplierToDelete(supplier);
    const handleConfirmDelete = async () => { if(supplierToDelete) { await deleteSupplier(supplierToDelete.id); setSupplierToDelete(null); } };
    const handleSave = async (supplier: Supplier) => { await saveSupplier(supplier); setIsModalOpen(false); };

    return (
        <>
            <ManagementPage title="Suppliers" addBtnText="Add Supplier" onAddItem={handleAdd}>
                {(searchTerm) => {
                    const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
                    const { items: sorted, requestSort, sortConfig } = useSort(filtered, { key: 'name', direction: 'asc' });

                    return (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <SortableHeader label="Supplier Name" sortKey="name" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <SortableHeader label="Contact" sortKey="contactPerson" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <SortableHeader label="Email" sortKey="email" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {sorted.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.contactPerson || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.email || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(s)} className="text-primary hover:text-opacity-80">{icons.edit}</button>
                                                <button onClick={() => handleDelete(s)} className="text-red-600 hover:text-red-800">{icons.trash}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                }}
            </ManagementPage>
            <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} supplier={supplierToEdit} />
            <ConfirmationModal isOpen={!!supplierToDelete} onClose={() => setSupplierToDelete(null)} onConfirm={handleConfirmDelete} title="Delete Supplier">
                Are you sure you want to delete supplier "{supplierToDelete?.name}"? Associated products will be unlinked.
            </ConfirmationModal>
        </>
    );
};

const SupplierModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (sup: Supplier) => void; supplier: Supplier | null; }> = ({ isOpen, onClose, onSave, supplier }) => {
    const [formData, setFormData] = useState<Partial<Supplier>>({});
    useEffect(() => { if (isOpen) setFormData(supplier || {}); }, [supplier, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id: supplier?.id || `sup-${Date.now()}`, ...formData, name: formData.name! }); };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={supplier ? 'Edit Supplier' : 'Add Supplier'} maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                </div>
                 <div className="md:col-span-2 flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={!formData.name} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">Save</button>
                </div>
            </form>
        </Modal>
    );
};

const AuditLogPage: React.FC = () => {
    const { auditLogs } = useStore();

    return (
        <ManagementPage title="Audit Logs">
            {(searchTerm) => {
                const filtered = auditLogs.filter(log =>
                    log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.reason.toLowerCase().includes(searchTerm.toLowerCase())
                );
                const { items: sorted, requestSort, sortConfig } = useSort(filtered, { key: 'timestamp', direction: 'desc' });

                return (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <SortableHeader label="Date" sortKey="timestamp" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Product" sortKey="productName" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
                                <SortableHeader label="Reason" sortKey="reason" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="User" sortKey="userName" {...{ sortConfig, requestSort }} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {sorted.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{log.productName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.oldStock} &rarr; <span className="font-bold dark:text-light">{log.newStock}</span> ({log.newStock - log.oldStock > 0 ? '+' : ''}{log.newStock - log.oldStock})
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.reason}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.userName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            }}
        </ManagementPage>
    );
};


const SettingsPage: React.FC = () => {
    const { settings, saveSettings } = useStore();
    const [formData, setFormData] = useState<AppSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData(prev => ({ ...prev, [name]: event.target!.result as string }));
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const removeImage = (name: 'appLogo' | 'appIcon') => {
        setFormData(prev => {
            const newSettings = { ...prev };
            delete newSettings[name];
            return newSettings;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark dark:text-light mb-6">Settings</h1>
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Name</label>
                            <input type="text" name="appName" value={formData.appName} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency Symbol</label>
                            <input type="text" name="currencySymbol" value={formData.currencySymbol} onChange={handleChange} className={INPUT_FIELD_CLASSES} required maxLength={2} />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Logo</label>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recommended: transparent PNG, max height 48px.</p>
                           <div className="mt-1 flex items-center gap-4">
                               {formData.appLogo ? <img src={formData.appLogo} alt="Logo Preview" className="h-12 w-auto bg-gray-200 dark:bg-gray-700 p-1 rounded-md" /> : <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">No Logo</div>}
                               <input type="file" name="appLogo" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                               {formData.appLogo && <button type="button" onClick={() => removeImage('appLogo')} className="text-red-500 hover:text-red-700">{icons.trash}</button>}
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Icon (Favicon)</label>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recommended: square PNG or ICO, e.g., 32x32px.</p>
                           <div className="mt-1 flex items-center gap-4">
                               {formData.appIcon ? <img src={formData.appIcon} alt="Icon Preview" className="h-8 w-8 rounded-md" /> : <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">?</div>}
                               <input type="file" name="appIcon" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                               {formData.appIcon && <button type="button" onClick={() => removeImage('appIcon')} className="text-red-500 hover:text-red-700">{icons.trash}</button>}
                           </div>
                        </div>

                        <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                             {isSaved && <p className="text-green-600 text-sm">Settings saved!</p>}
                            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">Save Settings</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// FIX: Moved ProgressBar component outside of ReportsPage to fix a TypeScript error
// related to component props inference when defined inside another component.
// FIX: Explicitly defined ProgressBarProps and used React.FC to correctly type the component.
// This resolves an error where React's 'key' prop was being incorrectly passed, causing a type mismatch.
type ProgressBarProps = {
    name: string;
    value: number;
    total: number;
    currencySymbol: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ name, value, total, currencySymbol }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                <span className="text-gray-500 dark:text-gray-400">{currencySymbol}{value.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
};

const ReportsPage: React.FC = () => {
    const { sales, products, settings } = useStore();
    
    // Sales Summary Calculations
    const salesSummary = useMemo(() => {
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
        const totalProfit = sales.reduce((acc, sale) => acc + (sale.totalProfit || 0), 0);
        const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;
        return { totalRevenue, totalProfit, averageSale };
    }, [sales]);

    // Sales by Category & Supplier
    const performanceData = useMemo(() => {
        const categorySales: { [key: string]: number } = {};
        const supplierSales: { [key: string]: number } = {};

        for (const sale of sales) {
            for (const item of sale.items) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const saleValue = item.price * item.quantity;
                    categorySales[product.category] = (categorySales[product.category] || 0) + saleValue;
                    if (product.supplierName) {
                         supplierSales[product.supplierName] = (supplierSales[product.supplierName] || 0) + saleValue;
                    }
                }
            }
        }
        
        const formatAndSort = (data: { [key: string]: number }) => Object.entries(data)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        return {
            byCategory: formatAndSort(categorySales),
            bySupplier: formatAndSort(supplierSales)
        };
    }, [sales, products]);

    // Item Sales Report Data
    const itemSalesReportData = useMemo(() => {
        const itemData: { [key: string]: { name: string, sku: string, unitsSold: number, revenue: number, profit: number } } = {};
        
        for (const p of products) {
            itemData[p.id] = { name: p.name, sku: p.sku, unitsSold: 0, revenue: 0, profit: 0 };
        }

        for (const sale of sales) {
            for (const item of sale.items) {
                if(itemData[item.id]) {
                    itemData[item.id].unitsSold += item.quantity;
                    const revenue = item.price * item.quantity;
                    const cost = (item.cost || 0) * item.quantity;
                    itemData[item.id].revenue += revenue;
                    itemData[item.id].profit += revenue - cost;
                }
            }
        }

        return Object.values(itemData);
    }, [sales, products]);

    const { items: sortedItemSales, requestSort: requestSortItemSales, sortConfig: sortConfigItemSales } = useSort(itemSalesReportData, { key: 'revenue', direction: 'desc' });
    
    // Current Stock Report Data
    const currentStockData = useMemo(() => {
        return products.map(p => ({
            ...p,
            stockValueCost: (p.cost || 0) * p.stock,
            stockValuePrice: p.price * p.stock,
        }));
    }, [products]);
     const { items: sortedStock, requestSort: requestSortStock, sortConfig: sortConfigStock } = useSort(currentStockData, { key: 'name', direction: 'asc' });


    const totalStockValueCost = useMemo(() => currentStockData.reduce((acc, p) => acc + p.stockValueCost, 0), [currentStockData]);
    const totalStockValuePrice = useMemo(() => currentStockData.reduce((acc, p) => acc + p.stockValuePrice, 0), [currentStockData]);

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            csvContent += values.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div>
             <h1 className="text-3xl font-bold text-dark dark:text-light mb-6">Reports</h1>
             
             {/* Sales Summary */}
             <div className="mb-8">
                <h2 className="text-xl font-semibold dark:text-light mb-4">Sales Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Revenue" value={`${settings.currencySymbol}${salesSummary.totalRevenue.toFixed(2)}`} icon={icons.dollar} />
                    <StatCard title="Total Profit" value={`${settings.currencySymbol}${salesSummary.totalProfit.toFixed(2)}`} icon={icons.trendingUp} />
                    <StatCard title="Average Sale Value" value={`${settings.currencySymbol}${salesSummary.averageSale.toFixed(2)}`} icon={icons.pos} />
                </div>
             </div>

            {/* Performance Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold dark:text-light mb-4">Sales by Category</h2>
                    <div className="space-y-4">
                        {performanceData.byCategory.map(cat => (
                            <ProgressBar key={cat.name} name={cat.name} value={cat.total} total={salesSummary.totalRevenue} currencySymbol={settings.currencySymbol} />
                        ))}
                    </div>
                </div>
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold dark:text-light mb-4">Sales by Supplier</h2>
                    <div className="space-y-4">
                        {performanceData.bySupplier.length > 0 ? performanceData.bySupplier.map(sup => (
                            <ProgressBar key={sup.name} name={sup.name} value={sup.total} total={salesSummary.totalRevenue} currencySymbol={settings.currencySymbol} />
                        )) : <p className="text-gray-500 dark:text-gray-400">No supplier sales data.</p>}
                    </div>
                </div>
            </div>

            {/* Item Sales Report */}
            <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-light">Item Sales Report</h2>
                    <button onClick={() => exportToCSV(sortedItemSales, 'item_sales_report.csv')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                        {icons.download} Export CSV
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <SortableHeader label="Product" sortKey="name" sortConfig={sortConfigItemSales} requestSort={requestSortItemSales} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfigItemSales} requestSort={requestSortItemSales} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Units Sold" sortKey="unitsSold" sortConfig={sortConfigItemSales} requestSort={requestSortItemSales} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Revenue" sortKey="revenue" sortConfig={sortConfigItemSales} requestSort={requestSortItemSales} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Profit" sortKey="profit" sortConfig={sortConfigItemSales} requestSort={requestSortItemSales} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedItemSales.map(item => (
                                <tr key={item.sku}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.sku}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.unitsSold}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.revenue.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{settings.currencySymbol}{item.profit.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Current Stock Report */}
            <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold dark:text-light">Current Stock Report</h2>
                    <button onClick={() => exportToCSV(sortedStock.map(p => ({
                        name: p.name, sku: p.sku, category: p.category, supplier: p.supplierName || 'N/A',
                        stock: p.stock, stock_value_cost: p.stockValueCost.toFixed(2), stock_value_price: p.stockValuePrice.toFixed(2)
                    })), 'current_stock_report.csv')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                        {icons.download} Export CSV
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <SortableHeader label="Product" sortKey="name" sortConfig={sortConfigStock} requestSort={requestSortStock} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfigStock} requestSort={requestSortStock} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Stock" sortKey="stock" sortConfig={sortConfigStock} requestSort={requestSortStock} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Stock Value (Cost)" sortKey="stockValueCost" sortConfig={sortConfigStock} requestSort={requestSortStock} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                                <SortableHeader label="Stock Value (Price)" sortKey="stockValuePrice" sortConfig={sortConfigStock} requestSort={requestSortStock} className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" />
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedStock.map(item => (
                                <tr key={item.sku}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.sku}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{item.stock}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.stockValueCost.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{settings.currencySymbol}{item.stockValuePrice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                         <tfoot className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">Totals:</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{settings.currencySymbol}{totalStockValueCost.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{settings.currencySymbol}{totalStockValuePrice.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP LAYOUT --- //
type Page = 'dashboard' | 'pos' | 'inventory' | 'products' | 'suppliers' | 'sales' | 'reports' | 'users' | 'categories' | 'audit' | 'settings';

const App: React.FC = () => {
    const { user, logout } = useAuth();
    const { products, settings } = useStore();
    const { theme, toggleTheme } = useTheme();
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);

    const lowStockProducts = useMemo(() => products.filter(p => p.stock <= p.lowStockThreshold), [products]);

    const navLinks: { id: Page; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'pos', label: 'POS', icon: icons.pos, roles: [UserRole.SUPER_ADMIN, UserRole.CASHIER] },
        { id: 'inventory', label: 'Inventory', icon: icons.inventory, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'products', label: 'Products', icon: icons.products, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'categories', label: 'Categories', icon: icons.category, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'suppliers', label: 'Suppliers', icon: icons.suppliers, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'sales', label: 'Sales History', icon: icons.sales, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'reports', label: 'Reports', icon: icons.reports, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { id: 'users', label: 'User Management', icon: icons.users, roles: [UserRole.SUPER_ADMIN] },
        { id: 'audit', label: 'Audit Logs', icon: icons.clipboard, roles: [UserRole.SUPER_ADMIN] },
        { id: 'settings', label: 'Settings', icon: icons.settings, roles: [UserRole.SUPER_ADMIN] },
    ];

    const accessibleLinks = navLinks.filter(link => user && link.roles.includes(user.role));
    
    // Set default page based on role
    useEffect(() => {
        if (user) {
            if (user.role === UserRole.CASHIER) setActivePage('pos');
            else setActivePage('dashboard');
        }
    }, [user]);

    const pageComponents: Record<Page, React.ReactNode> = {
        dashboard: <DashboardPage />,
        pos: <POSPage />,
        inventory: <InventoryPage />,
        products: <ProductManagementPage />,
        suppliers: <SupplierManagementPage />,
        sales: <SalesHistoryPage />,
        reports: <ReportsPage />,
        users: <UserManagementPage />,
        categories: <CategoryManagementPage />,
        audit: <AuditLogPage />,
        settings: <SettingsPage />
    };
    
    const pageTitle = accessibleLinks.find(l => l.id === activePage)?.label || 'Dashboard';

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !(profileRef.current as any).contains(event.target)) {
                setIsProfileOpen(false);
            }
             if (notificationsRef.current && !(notificationsRef.current as any).contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (!user) return <LoginPage />;

    return (
        <div className="flex h-screen bg-light dark:bg-dark-bg text-dark dark:text-gray-200">
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-dark-card shadow-lg z-30 w-64 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
                <div className="h-16 flex items-center justify-center px-4 shrink-0">
                    {settings.appLogo ? (
                        <img src={settings.appLogo} alt={settings.appName} className="max-h-12 w-auto" />
                    ) : (
                        <span className="text-2xl font-bold text-primary">{settings.appName}</span>
                    )}
                </div>
                <nav className="flex-grow px-4 overflow-y-auto">
                    {accessibleLinks.map(link => (
                        <button key={link.id} onClick={() => { setActivePage(link.id); setIsSidebarOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 my-1 rounded-lg text-left transition-colors ${activePage === link.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}>
                            {link.icon}
                            <span>{link.label}</span>
                        </button>
                    ))}
                </nav>
                 <div className="p-4 shrink-0">
                    <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300">
                        {icons.logout}
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                 <header className="h-16 bg-white dark:bg-dark-card shadow-md flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-500 dark:text-gray-400">{icons.hamburger}</button>
                        <h1 className="text-xl font-semibold text-dark dark:text-light hidden sm:block">{pageTitle}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent">
                            {theme === 'light' ? icons.moon : icons.sun}
                        </button>
                        
                        {/* Notifications */}
                         <div className="relative" ref={notificationsRef}>
                            <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent relative">
                                {icons.bell}
                                {lowStockProducts.length > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-card"></span>}
                            </button>
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-card rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden">
                                    <div className="p-3 font-semibold text-sm border-b dark:border-gray-700">Low Stock Alerts</div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {lowStockProducts.length > 0 ? (
                                            lowStockProducts.map(p => (
                                                <div key={p.id} onClick={() => { setActivePage('products'); setIsNotificationsOpen(false); }} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer text-sm">
                                                    <p className="font-semibold dark:text-light">{p.name}</p>
                                                    <p className="text-red-500">{p.stock} units left</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-4 text-sm text-gray-500">No new notifications.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden">
                                    <div className="p-3 border-b dark:border-gray-700">
                                        <p className="font-semibold text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.role}</p>
                                    </div>
                                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 flex items-center gap-2">
                                        {icons.logout} Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {pageComponents[activePage]}
                </main>
            </div>
        </div>
    );
};

// --- ROOT COMPONENT --- //
const Root: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <StoreProvider>
                    <ThemedApp />
                </StoreProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

const ThemedApp: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useStore();

    useEffect(() => {
        document.title = `${settings.appName} | POS & Inventory`;
        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]');
        if (settings.appIcon) {
            if (favicon) {
                favicon.href = settings.appIcon;
            } else {
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.href = settings.appIcon;
                document.head.appendChild(newFavicon);
            }
        }
    }, [settings.appName, settings.appIcon]);
    
    if (!user) {
        return <LoginPage />;
    }
    return <App />;
}

export default Root;