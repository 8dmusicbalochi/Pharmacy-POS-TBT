import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, ReactNode, useRef } from 'react';
import { User, UserRole, Product, CartItem, Sale, AuditLog, AppSettings, Category, PaymentMethod, Supplier, InventoryItem, Task, PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from './types';
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
    purchaseOrder: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
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
    refresh: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10 8a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
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
type ProductWithStock = Product & { totalStock: number; batches: InventoryItem[] };

type StoreContextType = {
    users: Omit<User, 'password'>[];
    products: Product[];
    productsWithStock: ProductWithStock[];
    inventory: InventoryItem[];
    sales: Sale[];
    auditLogs: AuditLog[];
    tasks: Task[];
    settings: AppSettings;
    categories: Category[];
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    refreshData: () => void;
    saveUser: (user: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    saveProduct: (product: Product) => Promise<Product>;
    deleteProduct: (productId: string) => Promise<void>;
    saveInventoryItem: (item: InventoryItem) => Promise<void>;
    receiveStockAndUpdatePO: (item: InventoryItem) => Promise<void>;
    addSale: (sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'>) => Promise<Sale>;
    addAuditLog: (log: Omit<AuditLog, 'id'>) => Promise<void>;
    saveTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    saveSettings: (settings: AppSettings) => Promise<void>;
    saveCategory: (category: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    saveSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    savePurchaseOrder: (po: PurchaseOrder) => Promise<void>;
    deletePurchaseOrder: (poId: string) => Promise<void>;
    bulkAddProducts: (products: Omit<Product, 'id'>[]) => Promise<{ added: number; updated: number }>;
};

const StoreContext = createContext<StoreContextType | null>(null);

const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [settings, setSettings] = useState<AppSettings>({ appName: 'Pharmasist', currencySymbol: '$' });
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

    const refreshData = useCallback(() => {
        setUsers(mockApi.getUsers());
        setProducts(mockApi.getProducts());
        setInventory(mockApi.getInventory());
        setSales(mockApi.getSales());
        setAuditLogs(mockApi.getAuditLogs());
        setTasks(mockApi.getTasks());
        setSettings(mockApi.getSettings());
        setCategories(mockApi.getCategories());
        setSuppliers(mockApi.getSuppliers());
        setPurchaseOrders(mockApi.getPurchaseOrders());
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const productsWithStock = useMemo<ProductWithStock[]>(() => {
        const inventoryByProduct = new Map<string, { totalStock: number; batches: InventoryItem[] }>();
        inventory.forEach(item => {
            const existing = inventoryByProduct.get(item.productId) || { totalStock: 0, batches: [] };
            existing.totalStock += item.quantity;
            existing.batches.push(item);
            inventoryByProduct.set(item.productId, existing);
        });
        return products.map(p => ({
            ...p,
            totalStock: inventoryByProduct.get(p.id)?.totalStock || 0,
            batches: inventoryByProduct.get(p.id)?.batches || [],
        }));
    }, [products, inventory]);

    const saveUser = async (user: User) => { mockApi.saveUser(user); refreshData(); };
    const deleteUser = async (userId: string) => { mockApi.deleteUser(userId); refreshData(); };
    const saveProduct = async (product: Product) => { const saved = mockApi.saveProduct(product); refreshData(); return saved; };
    const deleteProduct = async (productId: string) => { mockApi.deleteProduct(productId); refreshData(); }
    const saveInventoryItem = async (item: InventoryItem) => { mockApi.saveInventoryItem(item); refreshData(); }
    const receiveStockAndUpdatePO = async (item: InventoryItem) => { mockApi.receiveStockAndUpdatePO(item); refreshData(); };
    const addSale = async (sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'>) => { const newSale = mockApi.addSale(sale); refreshData(); return newSale; }
    const addAuditLog = async (log: Omit<AuditLog, 'id'>) => { mockApi.addAuditLog(log); refreshData(); };
    const saveTask = async (task: Task) => { mockApi.saveTask(task); refreshData(); };
    const deleteTask = async (taskId: string) => { mockApi.deleteTask(taskId); refreshData(); };
    const saveSettings = async (newSettings: AppSettings) => { mockApi.saveSettings(newSettings); refreshData(); };
    const saveCategory = async (category: Category) => { mockApi.saveCategory(category); refreshData(); };
    const deleteCategory = async (categoryId: string) => { mockApi.deleteCategory(categoryId); refreshData(); };
    const saveSupplier = async (supplier: Supplier) => { mockApi.saveSupplier(supplier); refreshData(); };
    const deleteSupplier = async (supplierId: string) => { mockApi.deleteSupplier(supplierId); refreshData(); };
    const savePurchaseOrder = async (po: PurchaseOrder) => { mockApi.savePurchaseOrder(po); refreshData(); };
    const deletePurchaseOrder = async (poId: string) => { mockApi.deletePurchaseOrder(poId); refreshData(); };
    const bulkAddProducts = async (products: Omit<Product, 'id'>[]) => { const result = mockApi.bulkAddProducts(products); refreshData(); return result; };


    return (
        <StoreContext.Provider value={{ users, products, productsWithStock, inventory, sales, auditLogs, tasks, settings, categories, suppliers, purchaseOrders, refreshData, saveUser, deleteUser, saveProduct, deleteProduct, saveInventoryItem, receiveStockAndUpdatePO, addSale, addAuditLog, saveTask, deleteTask, saveSettings, saveCategory, deleteCategory, saveSupplier, deleteSupplier, savePurchaseOrder, deletePurchaseOrder, bulkAddProducts }}>
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

            const errorCallback = (error: any) => {};
            
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
    const { productsWithStock, sales, settings, inventory, tasks, saveTask } = useStore();
    const [salesOverviewDays, setSalesOverviewDays] = useState(30);

    const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
    const totalProfit = useMemo(() => sales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0), [sales]);
    const inventoryValueCost = useMemo(() => productsWithStock.reduce((sum, p) => sum + (p.cost || 0) * p.totalStock, 0), [productsWithStock]);
    const lowStockProducts = useMemo(() => productsWithStock.filter(p => p.totalStock <= p.lowStockThreshold), [productsWithStock]);

    const expiringProducts = useMemo(() => {
        return inventory
            .filter(item => item.expiryDate)
            .map(item => {
                const product = productsWithStock.find(p => p.id === item.productId);
                return { ...item, productName: product?.name || 'N/A', expiryStatus: getExpiryStatus(item.expiryDate) };
            })
            .filter(item => item.expiryStatus.days <= 30)
            .sort((a, b) => a.expiryStatus.days - b.expiryStatus.days);
    }, [inventory, productsWithStock]);
    
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

        const product = productsWithStock.find(p => p.id === bestSellerId);
        return product ? `${product.name} (${maxQty} sold)` : 'N/A';

    }, [sales, productsWithStock]);
    
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
    
    const upcomingTasks = useMemo(() => {
        return tasks
            .filter(t => !t.isCompleted)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5); // Show top 5
    }, [tasks]);

    const handleToggleTask = async (task: Task) => {
        await saveTask({ ...task, isCompleted: !task.isCompleted });
    };


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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 dark:text-light">Low Stock Items</h2>
                        {lowStockProducts.length > 0 ? (
                            <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {lowStockProducts.map(p => (
                                <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-dark dark:text-light">
                                    <span>{p.name} ({p.sku})</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">{p.totalStock} left</span>
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
                            {expiringProducts.map(item => {
                                const status = item.expiryStatus;
                                return (
                                    <li key={item.id} className={`flex justify-between items-center text-sm p-2 rounded-md border ${status.days < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30'} text-dark dark:text-light`}>
                                        <span>{item.productName} ({item.quantity} units)</span>
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
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 dark:text-light">Upcoming & Overdue Tasks</h2>
                    {upcomingTasks.length > 0 ? (
                        <ul className="space-y-3 max-h-[15rem] overflow-y-auto">
                            {upcomingTasks.map(task => {
                                const dueDate = new Date(task.dueDate);
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const diffTime = dueDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                let dateText, dateClass;
                                if (diffDays < 0) {
                                    dateText = `Overdue by ${Math.abs(diffDays)} day(s)`;
                                    dateClass = 'text-red-500';
                                } else if (diffDays === 0) {
                                    dateText = `Due today`;
                                    dateClass = 'text-amber-500';
                                } else {
                                    dateText = `Due in ${diffDays} day(s)`;
                                    dateClass = 'text-gray-500 dark:text-gray-400';
                                }

                                return (
                                    <li key={task.id} className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleTask(task)}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-medium text-dark dark:text-light">{task.title}</p>
                                            <p className={`text-sm ${dateClass}`}>{dateText}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No pending tasks.</p>
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
    const { productsWithStock, addSale, settings } = useStore();
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [receipt, setReceipt] = useState<Sale | null>(null);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState<string>('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return productsWithStock.filter(p => {
            const hasNonExpiredStock = p.batches.some(b => !b.expiryDate || new Date(b.expiryDate) >= new Date());
            return (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.sku.toLowerCase().includes(searchTerm.toLowerCase())) && p.totalStock > 0 && hasNonExpiredStock;
        });
    }, [productsWithStock, searchTerm]);

    const addToCart = (product: ProductWithStock) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if(existingItem.quantity < product.totalStock) {
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
        const product = productsWithStock.find(p => p.id === productId);
        if (!product) return;

        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            const newQuantity = Math.min(quantity, product.totalStock);
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

    const handlePrint = () => { window.print(); }

    const handleBarcodeScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        const product = productsWithStock.find(p => p.sku.toLowerCase() === decodedText.toLowerCase());
        if (product) {
            const hasNonExpiredStock = product.batches.some(b => !b.expiryDate || new Date(b.expiryDate) >= new Date());
            if (!hasNonExpiredStock) {
                alert(`Cannot add to cart: All stock for "${product.name}" is expired.`);
                return;
            }
            if (product.totalStock > 0) {
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
                                <button key={product.id} onClick={() => addToCart(product)} className="border dark:border-gray-700 rounded-lg p-3 text-left hover:border-primary hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:hover:border-primary" disabled={product.totalStock <= (cart.find(item => item.id === product.id)?.quantity ?? 0)}>
                                    <h3 className="font-bold truncate dark:text-light">{product.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-400">{product.sku}</p>
                                    <p className="font-semibold text-primary dark:text-accent mt-1">{settings.currencySymbol}{product.price.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{product.totalStock} in stock</p>
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
            <div className="flex justify-center gap-4 mt-6 no-print">
                <button onClick={onNewSale} className="px-6 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">
                    New Sale
                </button>
                <button onClick={onPrint} className="flex items-center gap-2 px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                    {icons.print} Print
                </button>
            </div>
        </div>
    );
};

// --- GENERIC MANAGEMENT PAGE LAYOUT --- //
const ManagementPage: React.FC<{
    title: string;
    addBtnLabel?: string;
    onAdd?: () => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    children: ReactNode;
    extraButtons?: ReactNode;
}> = ({ title, addBtnLabel, onAdd, searchTerm, onSearch, children, extraButtons }) => {
    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-3xl font-bold text-dark dark:text-light mb-4 sm:mb-0">{title}</h1>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-white"
                        />
                        <div className="absolute top-0 left-0 pl-3 pt-2.5">{icons.search}</div>
                    </div>
                    {extraButtons}
                    {onAdd && addBtnLabel && (
                        <button
                            onClick={onAdd}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm"
                        >
                            {icons.plus} {addBtnLabel}
                        </button>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
};

// --- Product Management --- //
const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    prefilledSku?: string;
}> = ({ isOpen, onClose, product, prefilledSku }) => {
    const { saveProduct, categories } = useStore();
    const [formData, setFormData] = useState<Partial<Product>>({});

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData(product);
            } else {
                 setFormData({ 
                    sku: prefilledSku || '',
                    name: '',
                    price: 0,
                    cost: 0,
                    category: categories[0]?.name || '',
                    lowStockThreshold: 10,
                    manufacturer: '',
                    description: ''
                });
            }
        }
    }, [isOpen, product, prefilledSku, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productToSave = {
            ...formData,
            id: formData.id || `prod-${Date.now()}`,
            price: parseFloat(String(formData.price || 0)),
            cost: parseFloat(String(formData.cost || 0)),
            lowStockThreshold: parseInt(String(formData.lowStockThreshold || 0)),
        } as Product;
        await saveProduct(productToSave);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">SKU / Barcode *</label>
                        <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Product Name *</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} rows={3}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Manufacturer</label>
                        <input type="text" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Category *</label>
                        <select name="category" value={formData.category || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required>
                           {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Price *</label>
                        <input type="number" name="price" step="0.01" value={formData.price || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Cost</label>
                        <input type="number" name="cost" step="0.01" value={formData.cost || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Low Stock Threshold *</label>
                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">{product ? 'Save Changes' : 'Add Product'}</button>
                </div>
            </form>
        </Modal>
    );
};

const ProductManagementPage: React.FC = () => {
    const { productsWithStock, deleteProduct } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [prefilledSku, setPrefilledSku] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return productsWithStock.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productsWithStock, searchTerm]);
    
    const { items: sortedProducts, requestSort, sortConfig } = useSort(filteredProducts, { key: 'name', direction: 'asc' });

    const openAddModal = () => {
        setSelectedProduct(null);
        setPrefilledSku(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setPrefilledSku(undefined);
        setIsModalOpen(true);
    };
    
    const openDeleteConfirm = (product: Product) => {
        setSelectedProduct(product);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (selectedProduct) {
            await deleteProduct(selectedProduct.id);
            setIsConfirmOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleBarcodeScanSuccessForAdd = (decodedText: string) => {
        const existingProduct = productsWithStock.find(p => p.sku.toLowerCase() === decodedText.toLowerCase());
        if (existingProduct) {
            openEditModal(existingProduct);
        } else {
            setSelectedProduct(null);
            setPrefilledSku(decodedText);
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <ManagementPage
                title="Products"
                addBtnLabel="Add Product"
                onAdd={openAddModal}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                extraButtons={
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm"
                    >
                        {icons.barcode} Scan to Add
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="SKU" sortKey="sku" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Category" sortKey="category" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Price" sortKey="price" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <SortableHeader label="Cost" sortKey="cost" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <SortableHeader label="Total Stock" sortKey="totalStock" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map(p => (
                                <tr key={p.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                                    <td className="px-4 py-3">{p.sku}</td>
                                    <td className="px-4 py-3">{p.category}</td>
                                    <td className="px-4 py-3 text-right">{p.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{p.cost?.toFixed(2) || 'N/A'}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${p.totalStock <= p.lowStockThreshold ? 'text-red-500' : ''}`}>{p.totalStock}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{icons.edit}</button>
                                        <button onClick={() => openDeleteConfirm(p)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">{icons.trash}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
            <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} prefilledSku={prefilledSku} />
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
            >
                Are you sure you want to delete the product "{selectedProduct?.name}"? This will also remove all its inventory records and cannot be undone.
            </ConfirmationModal>
            <BarcodeScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleBarcodeScanSuccessForAdd}
            />
        </>
    );
};

// --- Inventory Management --- //
const InventoryManagementPage: React.FC = () => {
    const { inventory, products } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const inventoryWithProductInfo = useMemo(() => {
        return inventory.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                productName: product?.name || 'N/A',
                productSku: product?.sku || 'N/A',
            }
        });
    }, [inventory, products]);

    const filteredInventory = useMemo(() => {
        return inventoryWithProductInfo.filter(item => 
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventoryWithProductInfo, searchTerm]);

    const { items: sortedInventory, requestSort, sortConfig } = useSort(filteredInventory, { key: 'addedDate', direction: 'desc' });
    
    return (
        <ManagementPage
            title="Inventory Batches"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            extraButtons={
                <a href="#/receive-stock" className="flex-shrink-0 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm">
                    {icons.plus} Receive Stock
                </a>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <SortableHeader label="Product" sortKey="productName" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Batch #" sortKey="batchNumber" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Quantity" sortKey="quantity" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Supplier" sortKey="supplierName" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Expiry Date" sortKey="expiryDate" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Date Added" sortKey="addedDate" sortConfig={sortConfig} requestSort={requestSort} />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedInventory.map(item => {
                            const expiryStatus = getExpiryStatus(item.expiryDate);
                            return (
                                <tr key={item.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {item.productName}
                                        <span className="block text-xs text-gray-400">{item.productSku}</span>
                                    </td>
                                    <td className="px-4 py-3">{item.batchNumber}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3">{item.supplierName || 'N/A'}</td>
                                    <td className={`px-4 py-3 ${expiryStatus.className}`}>{expiryStatus.text}</td>
                                    <td className="px-4 py-3">{new Date(item.addedDate).toLocaleDateString()}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </ManagementPage>
    );
};


// --- Receive Stock Page --- //
const ReceiveStockPage: React.FC = () => {
    const { products, suppliers, categories, saveProduct, addAuditLog, productsWithStock, purchaseOrders, receiveStockAndUpdatePO, inventory } = useStore();
    const { user } = useAuth();
    
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [selectedPOItem, setSelectedPOItem] = useState<PurchaseOrderItem | null>(null);

    const [skuSearch, setSkuSearch] = useState('');
    const [productFound, setProductFound] = useState<Product | null>(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [isProductLocked, setIsProductLocked] = useState(false);
    const [expiryWarning, setExpiryWarning] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const [productData, setProductData] = useState<Partial<Product>>({
        category: categories.length > 0 ? categories[0].name : 'General',
        lowStockThreshold: 10,
        price: 0,
        cost: 0,
    });
    const [inventoryData, setInventoryData] = useState({
        quantity: '',
        batchNumber: '',
        expiryDate: '',
        supplierId: '',
        purchaseOrderId: '',
    });

    const openPurchaseOrders = useMemo(() => {
        return purchaseOrders.filter(po => 
            po.status === PurchaseOrderStatus.SUBMITTED || 
            po.status === PurchaseOrderStatus.SHIPPED ||
            po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED
        );
    }, [purchaseOrders]);

    const handlePOSelect = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId);
        if (po) {
            setSelectedPO(po);
            handleReset(); // Clear the form
        } else {
            setSelectedPO(null);
        }
    };
    
    const handleReceivePOItem = (item: PurchaseOrderItem) => {
        const product = products.find(p => p.id === item.productId);
        if (product && selectedPO) {
            setSelectedPOItem(item);
            setProductFound(product);
            setProductData(product);
            setIsNewProduct(false);
            setIsProductLocked(true);
            
            const totalReceived = inventory.filter(i => i.purchaseOrderId === selectedPO.id && i.productId === item.productId).reduce((sum, i) => sum + i.quantity, 0);
            const remainingQty = item.quantityOrdered - totalReceived;

            setInventoryData(prev => ({
                ...prev,
                supplierId: selectedPO.supplierId,
                purchaseOrderId: selectedPO.id,
                quantity: String(remainingQty > 0 ? remainingQty : ''),
            }));
            setSkuSearch(product.sku);
        }
    };

    const handleFindProduct = () => {
        if (!skuSearch) return;
        const existing = products.find(p => p.sku.toLowerCase() === skuSearch.toLowerCase());
        if (existing) {
            setProductFound(existing);
            setProductData(existing);
            setIsNewProduct(false);
        } else {
            setProductFound(null);
            setProductData(prev => ({ ...prev, sku: skuSearch, name: '', price: 0, cost: 0, category: categories.length > 0 ? categories[0].name : 'General', lowStockThreshold: 10 }));
            setIsNewProduct(true);
        }
        setIsProductLocked(true);
    };
    
    const handleReset = () => {
        setSkuSearch('');
        setProductFound(null);
        setIsNewProduct(false);
        setIsProductLocked(false);
        setSelectedPOItem(null);
        setProductData({ category: categories.length > 0 ? categories[0].name : 'General', lowStockThreshold: 10, price: 0, cost: 0 });
        setInventoryData({ quantity: '', batchNumber: '', expiryDate: '', supplierId: selectedPO?.supplierId || '', purchaseOrderId: selectedPO?.id || '' });
    };

    const handleProductDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleInventoryDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInventoryData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        handleInventoryDataChange(e);

        if(!dateStr) {
            setExpiryWarning(false);
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        const date = new Date(dateStr);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        setExpiryWarning(date < sixMonthsFromNow && date >= today);
    };

    const handleBarcodeScanSuccess = (decodedText: string) => {
        setSkuSearch(decodedText);
        // We need to defer find product to allow state to update
        setTimeout(() => handleFindProduct(), 0);
    };

    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let savedProduct = productFound;
        if (isNewProduct) {
            const productToSave: Product = {
                id: `prod-${Date.now()}-${Math.random()}`,
                sku: productData.sku!,
                name: productData.name!,
                price: Number(productData.price!),
                cost: Number(productData.cost) || undefined,
                category: productData.category!,
                lowStockThreshold: Number(productData.lowStockThreshold!),
                manufacturer: productData.manufacturer || undefined,
                description: productData.description || undefined,
            };
            savedProduct = await saveProduct(productToSave);
        }

        if (!savedProduct) {
            alert("Error: Product could not be found or created.");
            return;
        }
        
        const supplier = suppliers.find(s => s.id === inventoryData.supplierId);
        
        const item: InventoryItem = {
            id: `inv-${Date.now()}`,
            productId: savedProduct.id,
            quantity: Number(inventoryData.quantity),
            batchNumber: inventoryData.batchNumber,
            expiryDate: inventoryData.expiryDate || undefined,
            addedDate: new Date().toISOString(),
            supplierId: supplier?.id,
            supplierName: supplier?.name,
            purchaseOrderId: inventoryData.purchaseOrderId || undefined,
        };
        await receiveStockAndUpdatePO(item);

        const productWithStock = productsWithStock.find(p => p.id === savedProduct!.id);
        const oldStock = productWithStock?.totalStock || 0;
        
        await addAuditLog({
            timestamp: new Date().toISOString(),
            userId: user!.id,
            userName: user!.name,
            productId: savedProduct.id,
            productName: savedProduct.name,
            quantityChange: item.quantity,
            newTotalStock: oldStock + item.quantity,
            reason: `Stock received (Batch: ${item.batchNumber})` + (selectedPO ? ` for PO: ${selectedPO.poNumber}` : ''),
        });

        alert("Stock added successfully!");
        handleReset();
        // Do not redirect, allow receiving more items from the same PO
    };

    return (
        <>
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <a href="#/inventory" className="flex items-center gap-2 text-primary hover:underline">
                    {icons.arrowLeft} Back to Inventory
                </a>
                <h1 className="text-3xl font-bold text-dark dark:text-light">Receive Stock</h1>
            </div>

            <div className="mb-6">
                <label htmlFor="poSelect" className="block text-sm font-medium">Select Purchase Order (Optional)</label>
                <select id="poSelect" onChange={(e) => handlePOSelect(e.target.value)} value={selectedPO?.id || ''} className={INPUT_FIELD_CLASSES}>
                    <option value="">Receive without a PO</option>
                    {openPurchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber} - {po.supplierName}</option>)}
                </select>
            </div>

            {selectedPO && (
                <div className="mb-6 border dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Items for PO: {selectedPO.poNumber}</h3>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-sm">
                            <tbody>
                                {selectedPO.items.map(item => {
                                     const totalReceived = inventory.filter(i => i.purchaseOrderId === selectedPO.id && i.productId === item.productId).reduce((sum, i) => sum + i.quantity, 0);
                                     const isFullyReceived = totalReceived >= item.quantityOrdered;
                                    return (
                                        <tr key={item.productId} className={selectedPOItem?.productId === item.productId ? 'bg-primary/10' : ''}>
                                            <td className="p-2">{item.productName} ({item.productSku})</td>
                                            <td className="p-2 text-center">Ordered: {item.quantityOrdered}</td>
                                            <td className="p-2 text-center">Received: {totalReceived}</td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => handleReceivePOItem(item)} disabled={isFullyReceived} className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">
                                                    {isFullyReceived ? 'Received' : 'Receive'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Find Product */}
                <fieldset disabled={isProductLocked} className="space-y-2">
                    <label htmlFor="skuSearch" className="block text-sm font-medium">Product SKU / Barcode *</label>
                    <div className="flex gap-2">
                        <input
                            id="skuSearch"
                            type="text"
                            value={skuSearch}
                            onChange={e => setSkuSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFindProduct()}
                            className={INPUT_FIELD_CLASSES + " flex-grow"}
                            placeholder="Enter or scan SKU"
                            required
                            disabled={!!selectedPO}
                        />
                         <button type="button" onClick={() => setIsScannerOpen(true)} className="p-2.5 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" disabled={!!selectedPO}>{icons.barcode}</button>
                        <button type="button" onClick={handleFindProduct} className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-opacity-90" disabled={!!selectedPO}>Find Product</button>
                    </div>
                     {selectedPO && <p className="text-xs text-gray-500 mt-1">Product is selected from the PO above. To receive a different product, clear the PO selection.</p>}
                </fieldset>

                {isProductLocked && (
                    <>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                            <div>
                                {isNewProduct ? (
                                    <p className="font-semibold text-amber-600 dark:text-amber-400">New Product: Please fill in the details below.</p>
                                ) : (
                                    <p className="font-semibold text-green-600 dark:text-green-400">Selected Product: {productFound?.name}</p>
                                )}
                            </div>
                            <button type="button" onClick={handleReset} className="flex items-center gap-1 text-sm text-blue-500 hover:underline">{icons.refresh} Clear Form</button>
                        </div>

                        {/* Step 2: Product and Batch Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Product Details Group */}
                            <fieldset disabled={!isNewProduct} className="space-y-4 border dark:border-gray-700 p-4 rounded-lg">
                                <legend className="text-lg font-semibold px-2">Product Details</legend>
                                <div>
                                    <label className="block text-sm font-medium">Product Name *</label>
                                    <input type="text" name="name" value={productData.name || ''} onChange={handleProductDataChange} className={INPUT_FIELD_CLASSES} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Unit Price (Retail) *</label>
                                        <input type="number" step="0.01" min="0" name="price" value={productData.price || ''} onChange={handleProductDataChange} className={INPUT_FIELD_CLASSES} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Category *</label>
                                        <select name="category" value={productData.category || ''} onChange={handleProductDataChange} className={INPUT_FIELD_CLASSES} required>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Compliance Details Group */}
                            <fieldset className="space-y-4 border dark:border-gray-700 p-4 rounded-lg">
                                <legend className="text-lg font-semibold px-2">Compliance & Batch Details</legend>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium">Batch/Lot Number *</label>
                                        <input type="text" name="batchNumber" value={inventoryData.batchNumber} onChange={handleInventoryDataChange} className={INPUT_FIELD_CLASSES} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Quantity Received *</label>
                                        <input type="number" min="1" name="quantity" value={inventoryData.quantity} onChange={handleInventoryDataChange} className={INPUT_FIELD_CLASSES} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Expiry Date</label>
                                    <input type="date" name="expiryDate" value={inventoryData.expiryDate} onChange={handleExpiryDateChange} min={today} className={`${INPUT_FIELD_CLASSES} ${expiryWarning ? 'border-amber-500 ring-amber-500' : ''}`} />
                                    {expiryWarning && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Warning: This batch expires in less than 6 months.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Supplier *</label>
                                    <select name="supplierId" value={inventoryData.supplierId} onChange={handleInventoryDataChange} className={INPUT_FIELD_CLASSES} required disabled={!!selectedPO}>
                                        <option value="" disabled>Select a supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </fieldset>
                        </div>
                        <div className="flex justify-end pt-4">
                             <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-opacity-90">
                                {isNewProduct ? 'Create Product & Add Stock' : 'Add Stock to Inventory'}
                             </button>
                        </div>
                    </>
                )}
            </form>
        </div>
        <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleBarcodeScanSuccess} />
        </>
    );
};


// --- Task Management --- //
const TaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}> = ({ isOpen, onClose, task }) => {
    const { users, saveTask } = useStore();
    const [formData, setFormData] = useState<Partial<Task>>({});

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setFormData(task);
            } else {
                 setFormData({ 
                    title: '',
                    description: '',
                    dueDate: new Date().toISOString().split('T')[0],
                    isCompleted: false,
                    assignedToId: '',
                });
            }
        }
    }, [isOpen, task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const assignedUser = users.find(u => u.id === formData.assignedToId);
        const taskToSave: Task = {
            id: formData.id || `task-${Date.now()}`,
            title: formData.title || 'Untitled Task',
            description: formData.description,
            dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
            isCompleted: formData.isCompleted || false,
            assignedToId: formData.assignedToId,
            assignedToName: assignedUser?.name,
            createdAt: formData.createdAt || new Date().toISOString(),
        };
        await saveTask(taskToSave);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'} maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title *</label>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} rows={3}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Due Date *</label>
                        <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Assign To</label>
                        <select name="assignedToId" value={formData.assignedToId || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES}>
                            <option value="">None</option>
                           {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                 {task && (
                    <div className="flex items-center">
                        <input type="checkbox" id="isCompleted" name="isCompleted" checked={formData.isCompleted || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="isCompleted" className="ml-2 block text-sm font-medium">Mark as completed</label>
                    </div>
                 )}
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">{task ? 'Save Changes' : 'Add Task'}</button>
                </div>
            </form>
        </Modal>
    );
};

const TasksManagementPage: React.FC = () => {
    const { tasks, saveTask, deleteTask } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);
    
    const { items: sortedTasks, requestSort, sortConfig } = useSort(filteredTasks, { key: 'dueDate', direction: 'asc' });

    const openAddModal = () => { setSelectedTask(null); setIsModalOpen(true); };
    const openEditModal = (task: Task) => { setSelectedTask(task); setIsModalOpen(true); };
    const openDeleteConfirm = (task: Task) => { setSelectedTask(task); setIsConfirmOpen(true); };

    const handleDelete = async () => {
        if (selectedTask) {
            await deleteTask(selectedTask.id);
            setIsConfirmOpen(false);
            setSelectedTask(null);
        }
    };
    
    const handleToggleComplete = async (task: Task) => {
        await saveTask({ ...task, isCompleted: !task.isCompleted });
    };

    return (
        <>
            <ManagementPage
                title="Tasks"
                addBtnLabel="Add Task"
                onAdd={openAddModal}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 w-12">Status</th>
                                <SortableHeader label="Title" sortKey="title" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Assigned To" sortKey="assignedToName" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Due Date" sortKey="dueDate" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTasks.map(t => {
                                const isOverdue = !t.isCompleted && new Date(t.dueDate) < new Date();
                                return (
                                <tr key={t.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${t.isCompleted ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-white dark:bg-dark-card'}`}>
                                    <td className="px-4 py-3 text-center">
                                        <input type="checkbox" checked={t.isCompleted} onChange={() => handleToggleComplete(t)} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                    </td>
                                    <td className={`px-4 py-3 font-medium ${t.isCompleted ? 'line-through' : 'text-gray-900 dark:text-white'}`}>{t.title}</td>
                                    <td className="px-4 py-3">{t.assignedToName || 'N/A'}</td>
                                    <td className={`px-4 py-3 font-medium ${isOverdue ? 'text-red-500' : ''}`}>{new Date(t.dueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEditModal(t)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{icons.edit}</button>
                                        <button onClick={() => openDeleteConfirm(t)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">{icons.trash}</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={selectedTask} />
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Task"
            >
                Are you sure you want to delete the task "{selectedTask?.title}"? This cannot be undone.
            </ConfirmationModal>
        </>
    );
};


// --- Sales and Reports --- //
const SalesHistoryPage: React.FC = () => { 
    const { sales, settings } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSales = useMemo(() => {
        return sales.filter(s =>
            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [sales, searchTerm]);

    const { items: sortedSales, requestSort, sortConfig } = useSort(filteredSales, { key: 'timestamp', direction: 'desc' });
    
    return (
        <ManagementPage
            title="Sales History"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
        >
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <SortableHeader label="Sale ID" sortKey="id" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Date" sortKey="timestamp" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Cashier" sortKey="cashierName" sortConfig={sortConfig} requestSort={requestSort} />
                            <th className="px-4 py-3">Items</th>
                            <SortableHeader label="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} className="text-right"/>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSales.map(sale => (
                            <tr key={sale.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-3 font-mono text-xs">{sale.id}</td>
                                <td className="px-4 py-3">{new Date(sale.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3">{sale.cashierName}</td>
                                <td className="px-4 py-3">{sale.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                                <td className="px-4 py-3 font-bold text-right">{settings.currencySymbol}{sale.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ManagementPage>
    );
};

const DateRangePicker: React.FC<{
    onDateChange: (start: Date, end: Date) => void;
}> = ({ onDateChange }) => {
    const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const calculateDates = useCallback((p: typeof preset) => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();

        switch (p) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'custom':
                if (customStart && customEnd) {
                    start = new Date(customStart);
                    start.setHours(0, 0, 0, 0);
                    end.setTime(new Date(customEnd).getTime());
                    end.setHours(23, 59, 59, 999);
                } else {
                    return; // Don't call onDateChange if custom dates are not set
                }
                break;
        }
        onDateChange(start, end);
    }, [onDateChange, customStart, customEnd]);

    useEffect(() => {
        if (preset !== 'custom') {
            calculateDates(preset);
        }
    }, [preset, calculateDates]);
    
    useEffect(() => {
        if (preset === 'custom' && customStart && customEnd) {
            calculateDates('custom');
        }
    }, [preset, customStart, customEnd, calculateDates])

    const handlePresetChange = (p: typeof preset) => {
        setPreset(p);
        if (p !== 'custom') {
            setCustomStart('');
            setCustomEnd('');
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                {(['today', 'week', 'month'] as const).map(p => (
                    <button key={p} onClick={() => handlePresetChange(p)} className={`px-3 py-1 text-sm rounded-md capitalize transition-all ${preset === p ? 'bg-white dark:bg-dark-card shadow font-semibold text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{p}</button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); handlePresetChange('custom')}} className="px-2 py-1.5 border rounded-md text-sm bg-transparent dark:border-gray-600" />
                <span>to</span>
                <input type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); handlePresetChange('custom')}} className="px-2 py-1.5 border rounded-md text-sm bg-transparent dark:border-gray-600" />
            </div>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const { sales, products, productsWithStock, settings, users, inventory, suppliers, categories } = useStore();
    
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const saleDate = new Date(s.timestamp);
            return saleDate >= startDate && saleDate <= endDate;
        });
    }, [sales, startDate, endDate]);

    // Financial Reports Data
    const salesSummary = useMemo(() => {
        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
        const totalCogs = filteredSales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
        const grossProfit = totalRevenue - totalCogs;
        const totalTransactions = filteredSales.length;
        const totalDiscounts = filteredSales.reduce((sum, s) => sum + (s.discountAmount || 0), 0);
        return { totalRevenue, totalCogs, grossProfit, totalTransactions, totalDiscounts };
    }, [filteredSales]);

    const topProducts = useMemo(() => {
        const map = new Map<string, { name: string; quantity: number, revenue: number, profit: number }>();
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const current = map.get(item.id) || { name: item.name, quantity: 0, revenue: 0, profit: 0 };
                const itemProfit = (item.price - (item.cost || 0)) * item.quantity;
                current.quantity += item.quantity;
                current.revenue += item.price * item.quantity;
                current.profit += itemProfit;
                map.set(item.id, current);
            });
        });
        return Array.from(map.values());
    }, [filteredSales]);

    const { items: sortedTopProducts, requestSort: requestSortTopProducts, sortConfig: sortConfigTopProducts } = useSort(topProducts, { key: 'revenue', direction: 'desc' });
    
    // Inventory Reports Data (not date-filtered)
    const stockValuation = useMemo(() => {
        const totalStockQuantity = productsWithStock.reduce((sum, p) => sum + p.totalStock, 0);
        const totalRetailValue = productsWithStock.reduce((sum, p) => sum + p.totalStock * p.price, 0);
        const totalCostValue = productsWithStock.reduce((sum, p) => sum + p.totalStock * (p.cost || 0), 0);
        return { totalStockQuantity, totalRetailValue, totalCostValue };
    }, [productsWithStock]);
    
    const [expiryCategoryFilter, setExpiryCategoryFilter] = useState('all');
    const [expirySupplierFilter, setExpirySupplierFilter] = useState('all');

    const expiryAnalysis = useMemo(() => {
        const inventoryWithDetails = inventory
            .filter(item => item.expiryDate)
            .map(item => ({...item, product: products.find(p => p.id === item.productId) }))
            .filter(item => {
                if (!item.product) return false;
                if (expiryCategoryFilter !== 'all' && item.product.category !== expiryCategoryFilter) return false;
                if (expirySupplierFilter !== 'all' && item.supplierId !== expirySupplierFilter) return false;
                return true;
            });
            
        const groups = {
            expired: [],
            in30days: [],
            in60_180days: [],
        } as Record<string, typeof inventoryWithDetails>;

        inventoryWithDetails.forEach(item => {
            const { days } = getExpiryStatus(item.expiryDate);
            if (days < 0) groups.expired.push(item);
            else if (days <= 30) groups.in30days.push(item);
            else if (days <= 180) groups.in60_180days.push(item);
        });
        
        return groups;

    }, [inventory, products, expiryCategoryFilter, expirySupplierFilter]);

    // User Activity Report
    const userActivity = useMemo(() => {
        const map = new Map<string, { name: string; transactions: number, totalSales: number }>();
        filteredSales.forEach(sale => {
            const current = map.get(sale.cashierId) || { name: sale.cashierName, transactions: 0, totalSales: 0 };
            current.transactions += 1;
            current.totalSales += sale.total;
            map.set(sale.cashierId, current);
        });
        return Array.from(map.values()).sort((a,b) => b.totalSales - a.totalSales);
    }, [filteredSales]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Reports</h1>
                <DateRangePicker onDateChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
            </div>

            {/* Financial Reports */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold border-b dark:border-gray-700 pb-2 text-dark dark:text-light">Financial Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard title="Total Revenue" value={`${settings.currencySymbol}${salesSummary.totalRevenue.toFixed(2)}`} icon={icons.dollar} />
                    <StatCard title="Cost of Goods Sold" value={`${settings.currencySymbol}${salesSummary.totalCogs.toFixed(2)}`} icon={icons.inventory} />
                    <StatCard title="Gross Profit" value={`${settings.currencySymbol}${salesSummary.grossProfit.toFixed(2)}`} icon={icons.trendingUp} />
                    <StatCard title="Total Transactions" value={salesSummary.totalTransactions} icon={icons.sales} />
                    <StatCard title="Total Discounts" value={`${settings.currencySymbol}${salesSummary.totalDiscounts.toFixed(2)}`} icon={icons.tag} />
                </div>
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-semibold mb-4">Top Products</h3>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <SortableHeader label="Qty Sold" sortKey="quantity" sortConfig={sortConfigTopProducts} requestSort={requestSortTopProducts} className="text-right" />
                                    <SortableHeader label="Revenue" sortKey="revenue" sortConfig={sortConfigTopProducts} requestSort={requestSortTopProducts} className="text-right" />
                                    <SortableHeader label="Profit" sortKey="profit" sortConfig={sortConfigTopProducts} requestSort={requestSortTopProducts} className="text-right" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTopProducts.map(item => (
                                    <tr key={item.name} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">{settings.currencySymbol}{item.revenue.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{settings.currencySymbol}{item.profit.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

             {/* Inventory Reports */}
            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold border-b dark:border-gray-700 pb-2 text-dark dark:text-light">Inventory Reports</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <StatCard title="Total Stock Quantity" value={stockValuation.totalStockQuantity.toLocaleString()} icon={icons.inventory} />
                     <StatCard title="Total Retail Value" value={`${settings.currencySymbol}${stockValuation.totalRetailValue.toFixed(2)}`} icon={icons.dollar} />
                     <StatCard title="Total Cost Value" value={`${settings.currencySymbol}${stockValuation.totalCostValue.toFixed(2)}`} icon={icons.pos} />
                </div>
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-xl font-semibold">Expiry Analysis Report</h3>
                        <div className="flex gap-2">
                             <select value={expiryCategoryFilter} onChange={e => setExpiryCategoryFilter(e.target.value)} className={INPUT_FIELD_CLASSES + ' mt-0 text-sm'}>
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                             <select value={expirySupplierFilter} onChange={e => setExpirySupplierFilter(e.target.value)} className={INPUT_FIELD_CLASSES + ' mt-0 text-sm'}>
                                <option value="all">All Suppliers</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                     </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {(['expired', 'in30days', 'in60_180days'] as const).map(key => (
                            expiryAnalysis[key].length > 0 && (
                                <div key={key}>
                                    <h4 className="font-bold text-md mb-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                        { { expired: 'Expired', in30days: 'Expiring in 30 Days', in60_180days: 'Expiring in 60-180 Days' }[key] }
                                        ({expiryAnalysis[key].length} batches)
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {expiryAnalysis[key].map(item => (
                                                    <tr key={item.id} className="border-b dark:border-gray-700">
                                                        <td className="p-2 font-medium">{item.product?.name}</td>
                                                        <td className="p-2">Batch: {item.batchNumber}</td>
                                                        <td className="p-2">Qty: {item.quantity}</td>
                                                        <td className={`p-2 font-semibold ${getExpiryStatus(item.expiryDate).className}`}>{new Date(item.expiryDate!).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
            
             {/* User Activity Report */}
            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold border-b dark:border-gray-700 pb-2 text-dark dark:text-light">User Activity Report</h2>
                 <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-semibold mb-4">Sales by Employee</h3>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Employee Name</th>
                                    <th className="px-4 py-3 text-right">Transactions Handled</th>
                                    <th className="px-4 py-3 text-right">Total Sales Processed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userActivity.map(user => (
                                    <tr key={user.name} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                        <td className="px-4 py-3 text-right">{user.transactions}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{settings.currencySymbol}{user.totalSales.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- User and Settings Management --- //

const UserModal: React.FC<{isOpen: boolean; onClose: () => void; user: Omit<User, 'password'> | null}> = ({ isOpen, onClose, user }) => {
    const { saveUser } = useStore();
    const [formData, setFormData] = useState<Partial<User>>({});
    
    useEffect(() => {
        if(isOpen) {
            setFormData(user || { username: '', name: '', role: UserRole.CASHIER });
        }
    }, [isOpen, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userToSave = {
            ...formData,
            id: formData.id || `user-${Date.now()}`,
        } as User;
        await saveUser(userToSave);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Add User"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Full Name *</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Username *</label>
                    <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className={INPUT_FIELD_CLASSES} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password {user ? '(leave blank to keep unchanged)' : '*'}</label>
                    <input type="password" name="password" onChange={handleChange} className={INPUT_FIELD_CLASSES} required={!user} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Role *</label>
                    <select name="role" value={formData.role} onChange={handleChange} className={INPUT_FIELD_CLASSES}>
                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">{user ? 'Save Changes' : 'Add User'}</button>
                </div>
            </form>
        </Modal>
    );
};


const UserManagementPage: React.FC = () => { 
    const { users, deleteUser } = useStore();
    const { user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Omit<User, 'password'> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    const { items: sortedUsers, requestSort, sortConfig } = useSort(filteredUsers, { key: 'name', direction: 'asc'});

    const openAddModal = () => { setSelectedUser(null); setIsModalOpen(true); };
    const openEditModal = (user: Omit<User, 'password'>) => { setSelectedUser(user); setIsModalOpen(true); };
    const openDeleteConfirm = (user: Omit<User, 'password'>) => { setSelectedUser(user); setIsConfirmOpen(true); };
    
    const handleDelete = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser.id);
            setIsConfirmOpen(false);
            setSelectedUser(null);
        }
    };
    
    return (
        <>
            <ManagementPage
                title="Users"
                addBtnLabel="Add User"
                onAdd={openAddModal}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
            >
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Username" sortKey="username" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Role" sortKey="role" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(u => (
                                <tr key={u.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                                    <td className="px-4 py-3">{u.username}</td>
                                    <td className="px-4 py-3">{u.role}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => openEditModal(u)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{icons.edit}</button>
                                        {currentUser?.id !== u.id && (
                                            <button onClick={() => openDeleteConfirm(u)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">{icons.trash}</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
            >
                Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

// --- Category & Supplier Management Pages (Simplified) --- //
const CategoryManagementPage: React.FC = () => {
    const { categories, saveCategory, deleteCategory } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const { items: sorted, requestSort, sortConfig } = useSort(filtered, {key: 'name', direction: 'asc'});

    const handleSave = async (name: string) => {
        await saveCategory({ id: selectedCategory?.id || `cat-${Date.now()}`, name });
        setIsModalOpen(false);
    };
    const handleDelete = async () => {
        if(selectedCategory) await deleteCategory(selectedCategory.id);
        setIsConfirmOpen(false);
    };

    return (
        <>
            <ManagementPage title="Categories" addBtnLabel="Add Category" onAdd={() => { setSelectedCategory(null); setIsModalOpen(true); }} searchTerm={searchTerm} onSearch={setSearchTerm}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} /><th className="px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            {sorted.map(c => (
                                <tr key={c.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => { setSelectedCategory(c); setIsModalOpen(true);}} className="text-blue-600">{icons.edit}</button>
                                        {c.name !== "General" && <button onClick={() => {setSelectedCategory(c); setIsConfirmOpen(true);}} className="text-red-600">{icons.trash}</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? "Edit Category" : "Add Category"}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave((e.target as any).name.value); }}>
                    <label>Name *</label><input type="text" name="name" defaultValue={selectedCategory?.name} className={INPUT_FIELD_CLASSES} required />
                    <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save</button></div>
                </form>
            </Modal>
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete Category">Are you sure? Products in this category will be moved to "General".</ConfirmationModal>
        </>
    );
};

const SupplierManagementPage: React.FC = () => {
    const { suppliers, saveSupplier, deleteSupplier } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const { items: sorted, requestSort, sortConfig } = useSort(filtered, {key: 'name', direction: 'asc'});

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const supplierData = Object.fromEntries(formData.entries()) as Omit<Supplier, 'id'>;
        await saveSupplier({ id: selected?.id || `sup-${Date.now()}`, ...supplierData });
        setIsModalOpen(false);
    };
    const handleDelete = async () => { if(selected) await deleteSupplier(selected.id); setIsConfirmOpen(false); };

    return (
        <>
            <ManagementPage title="Suppliers" addBtnLabel="Add Supplier" onAdd={() => { setSelected(null); setIsModalOpen(true); }} searchTerm={searchTerm} onSearch={setSearchTerm}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} /><SortableHeader label="Contact Person" sortKey="contactPerson" sortConfig={sortConfig} requestSort={requestSort} /><SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} requestSort={requestSort} /><th className="px-4 py-3">Actions</th></tr></thead>
                        <tbody>
                            {sorted.map(s => (
                                <tr key={s.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                    <td className="px-4 py-3">{s.contactPerson}</td>
                                    <td className="px-4 py-3">{s.email}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button onClick={() => { setSelected(s); setIsModalOpen(true);}} className="text-blue-600">{icons.edit}</button>
                                        <button onClick={() => {setSelected(s); setIsConfirmOpen(true);}} className="text-red-600">{icons.trash}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? "Edit Supplier" : "Add Supplier"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" name="name" defaultValue={selected?.name} placeholder="Name" className={INPUT_FIELD_CLASSES} required />
                    <input type="text" name="contactPerson" defaultValue={selected?.contactPerson} placeholder="Contact Person" className={INPUT_FIELD_CLASSES} />
                    <input type="email" name="email" defaultValue={selected?.email} placeholder="Email" className={INPUT_FIELD_CLASSES} />
                    <input type="tel" name="phone" defaultValue={selected?.phone} placeholder="Phone" className={INPUT_FIELD_CLASSES} />
                    <textarea name="address" defaultValue={selected?.address} placeholder="Address" className={INPUT_FIELD_CLASSES}></textarea>
                    <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save</button></div>
                </form>
            </Modal>
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete Supplier">Are you sure? Products from this supplier will be unlinked.</ConfirmationModal>
        </>
    );
};


const SettingsPage: React.FC = () => {
    const { settings, saveSettings } = useStore();
    const [formData, setFormData] = useState<AppSettings>(settings);
    const restoreInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'appLogo' | 'appIcon') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, [field]: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveSettings(formData);
        alert("Settings saved!");
    };
    
    const handleBackup = () => {
        const data: { [key: string]: any } = {};
        const keys = ['pharmacy_users', 'pharmacy_products', 'pharmacy_inventory', 'pharmacy_sales', 'pharmacy_audit_logs', 'pharmacy_settings', 'pharmacy_categories', 'pharmacy_suppliers', 'pharmacy_tasks'];
        keys.forEach(key => {
            data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        });

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Are you sure you want to restore? This will overwrite all current data and cannot be undone.")) {
            if (restoreInputRef.current) restoreInputRef.current.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });
                alert("Restore successful! The application will now reload.");
                window.location.reload();
            } catch (error) {
                alert("Failed to read or parse the backup file. Please ensure it's a valid backup.");
                console.error("Restore error:", error);
            } finally {
                 if (restoreInputRef.current) restoreInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-dark dark:text-light">Settings</h1>
            
            <form onSubmit={handleSave} className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md space-y-6">
                 <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-3">App Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium">Application Name</label>
                        <input type="text" name="appName" value={formData.appName} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Currency Symbol</label>
                        <input type="text" name="currencySymbol" value={formData.currencySymbol} onChange={handleChange} className={INPUT_FIELD_CLASSES} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Application Logo</label>
                    <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'appLogo')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {formData.appLogo && <img src={formData.appLogo} alt="Logo Preview" className="h-12 mt-2 bg-gray-200 p-1 rounded"/>}
                </div>
                 <div>
                    <label className="block text-sm font-medium">Application Icon (Favicon)</label>
                    <input type="file" accept="image/x-icon,image/png,image/svg+xml" onChange={e => handleImageChange(e, 'appIcon')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {formData.appIcon && <img src={formData.appIcon} alt="Icon Preview" className="h-8 w-8 mt-2 bg-gray-200 p-1 rounded"/>}
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-6 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">Save Settings</button>
                </div>
            </form>

            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md space-y-4">
                 <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-3">Backup & Restore</h2>
                 <p className="text-sm text-gray-600 dark:text-gray-400">Backup all your application data to a local file. You can use this file to restore your data on this or another device.</p>
                 <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <button onClick={handleBackup} className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                        {icons.download} Backup Now
                    </button>
                    <div>
                        <label htmlFor="restore-file" className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                            {icons.upload} Restore from File
                        </label>
                         <input ref={restoreInputRef} id="restore-file" type="file" accept=".json" onChange={handleRestore} className="hidden" />
                    </div>
                 </div>
                 <p className="text-xs text-amber-600 dark:text-amber-400">Warning: Restoring from a file will overwrite all existing data. This action cannot be undone.</p>
            </div>
        </div>
    );
};

// --- PURCHASE ORDER COMPONENTS --- //

const getPOStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
        case PurchaseOrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        case PurchaseOrderStatus.SUBMITTED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        case PurchaseOrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
        case PurchaseOrderStatus.PARTIALLY_RECEIVED: return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
        case PurchaseOrderStatus.RECEIVED: return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        case PurchaseOrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const POStatusBadge: React.FC<{ status: PurchaseOrderStatus }> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPOStatusColor(status)}`}>
        {status}
    </span>
);

const PurchaseOrdersManagementPage: React.FC = () => {
    const { purchaseOrders, deletePurchaseOrder, settings } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    const filteredPOs = useMemo(() => {
        return purchaseOrders.filter(po =>
            po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchaseOrders, searchTerm]);

    const { items: sortedPOs, requestSort, sortConfig } = useSort(filteredPOs, { key: 'createdAt', direction: 'desc' });
    
    const openDeleteConfirm = (po: PurchaseOrder) => {
        if (po.status !== PurchaseOrderStatus.PENDING) {
            alert("Only 'Pending' purchase orders can be deleted.");
            return;
        }
        setSelectedPO(po);
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (selectedPO) {
            await deletePurchaseOrder(selectedPO.id);
            setIsConfirmOpen(false);
            setSelectedPO(null);
        }
    };

    return (
        <>
            <ManagementPage
                title="Purchase Orders"
                addBtnLabel="Create PO"
                onAdd={() => window.location.hash = '#/purchase-order/new'}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <SortableHeader label="PO Number" sortKey="poNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Supplier" sortKey="supplierName" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Created At" sortKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPOs.map(po => (
                                <tr key={po.id} className="bg-white border-b dark:bg-dark-card dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white"><a href={`#/purchase-order/${po.id}`} className="text-primary hover:underline">{po.poNumber}</a></td>
                                    <td className="px-4 py-3">{po.supplierName}</td>
                                    <td className="px-4 py-3"><POStatusBadge status={po.status} /></td>
                                    <td className="px-4 py-3">{new Date(po.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{settings.currencySymbol}{po.total.toFixed(2)}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <a href={`#/purchase-order/${po.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">{icons.edit}</a>
                                        {po.status === PurchaseOrderStatus.PENDING && (
                                            <button onClick={() => openDeleteConfirm(po)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">{icons.trash}</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ManagementPage>
             <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Purchase Order"
            >
                Are you sure you want to delete PO "{selectedPO?.poNumber}"? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

const PurchaseOrderFormPage: React.FC<{ poId: string }> = ({ poId }) => {
    const { purchaseOrders, suppliers, products, savePurchaseOrder, settings } = useStore();
    const isNew = poId === 'new';
    
    const [po, setPo] = useState<Partial<PurchaseOrder>>({});
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (!isNew) {
            const existingPO = purchaseOrders.find(p => p.id === poId);
            if (existingPO) {
                setPo(existingPO);
            }
        } else {
            setPo({
                status: PurchaseOrderStatus.PENDING,
                items: [],
                createdAt: new Date().toISOString(),
                poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
            });
        }
    }, [poId, purchaseOrders, isNew]);

    const handleAddItem = (product: Product) => {
        const newItem: PurchaseOrderItem = {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantityOrdered: 1,
            cost: product.cost || 0,
        };
        setPo(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
        setIsProductModalOpen(false);
    };

    const handleItemChange = (productId: string, field: 'quantityOrdered' | 'cost', value: number) => {
        setPo(prev => ({
            ...prev,
            items: (prev.items || []).map(item => item.productId === productId ? { ...item, [field]: value } : item)
        }));
    };

    const handleRemoveItem = (productId: string) => {
        setPo(prev => ({...prev, items: (prev.items || []).filter(item => item.productId !== productId)}));
    };

    const handleSupplierChange = (supplierId: string) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        if(supplier) {
            setPo(prev => ({ ...prev, supplierId: supplier.id, supplierName: supplier.name }));
        }
    }

    const totals = useMemo(() => {
        const subtotal = (po.items || []).reduce((sum, item) => sum + item.cost * item.quantityOrdered, 0);
        return { subtotal, total: subtotal };
    }, [po.items]);

    const handleSave = async (status: PurchaseOrderStatus) => {
        if (!po.supplierId) {
            alert("Please select a supplier.");
            return;
        }
        if (!po.items || po.items.length === 0) {
            alert("Please add at least one item to the order.");
            return;
        }

        const finalPO: PurchaseOrder = {
            ...po,
            id: po.id || `po-${Date.now()}`,
            status,
            subtotal: totals.subtotal,
            total: totals.total,
            submittedAt: status === PurchaseOrderStatus.SUBMITTED ? new Date().toISOString() : po.submittedAt,
        } as PurchaseOrder;

        await savePurchaseOrder(finalPO);
        window.location.hash = '#/purchase-orders';
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    
    const canEdit = po.status === PurchaseOrderStatus.PENDING;

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6 border-b dark:border-gray-700 pb-4">
                <div>
                    <a href="#/purchase-orders" className="flex items-center gap-2 text-primary hover:underline mb-2">
                        {icons.arrowLeft} Back to Purchase Orders
                    </a>
                    <h1 className="text-3xl font-bold text-dark dark:text-light">{isNew ? 'Create Purchase Order' : `Edit PO: ${po.poNumber}`}</h1>
                </div>
                {po.status && <POStatusBadge status={po.status} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium">Supplier *</label>
                    <select value={po.supplierId || ''} onChange={e => handleSupplierChange(e.target.value)} className={INPUT_FIELD_CLASSES} disabled={!canEdit}>
                        <option value="" disabled>Select a supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Expected Delivery Date</label>
                    <input type="date" value={po.expectedDeliveryDate?.split('T')[0] || ''} onChange={e => setPo(p => ({...p, expectedDeliveryDate: e.target.value}))} className={INPUT_FIELD_CLASSES} disabled={!canEdit} />
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Items</h3>
                <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800"><tr>
                            <th className="px-4 py-2 text-left">Product</th>
                            <th className="px-4 py-2 text-right w-32">Quantity</th>
                            <th className="px-4 py-2 text-right w-32">Cost/Item</th>
                            <th className="px-4 py-2 text-right w-40">Line Total</th>
                            {canEdit && <th className="px-4 py-2 w-12"></th>}
                        </tr></thead>
                        <tbody>
                        {(po.items || []).map(item => (
                            <tr key={item.productId} className="border-t dark:border-gray-700">
                                <td className="px-4 py-2">{item.productName} <span className="text-gray-400">({item.productSku})</span></td>
                                <td className="px-4 py-2"><input type="number" min="1" value={item.quantityOrdered} onChange={e => handleItemChange(item.productId, 'quantityOrdered', parseInt(e.target.value))} className="w-full text-right bg-transparent dark:text-white" disabled={!canEdit}/></td>
                                <td className="px-4 py-2"><input type="number" step="0.01" value={item.cost} onChange={e => handleItemChange(item.productId, 'cost', parseFloat(e.target.value))} className="w-full text-right bg-transparent dark:text-white" disabled={!canEdit}/></td>
                                <td className="px-4 py-2 text-right font-medium">{settings.currencySymbol}{(item.quantityOrdered * item.cost).toFixed(2)}</td>
                                {canEdit && <td className="px-4 py-2 text-center"><button onClick={() => handleRemoveItem(item.productId)} className="text-red-500">{icons.trash}</button></td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                 {canEdit && <button onClick={() => setIsProductModalOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-secondary text-white hover:bg-opacity-90">{icons.plus} Add Item</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-sm font-medium">Notes</label>
                     <textarea value={po.notes || ''} onChange={e => setPo(p => ({...p, notes: e.target.value}))} className={INPUT_FIELD_CLASSES + ' h-24'} disabled={!canEdit}></textarea>
                </div>
                <div className="space-y-2 text-right">
                    <div className="flex justify-between text-lg"><span className="text-gray-500">Subtotal:</span> <span className="font-semibold">{settings.currencySymbol}{totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xl font-bold border-t dark:border-gray-700 pt-2"><span className="">Total:</span> <span>{settings.currencySymbol}{totals.total.toFixed(2)}</span></div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t dark:border-gray-700">
                <a href="#/purchase-orders" className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</a>
                {canEdit && (
                    <>
                        <button onClick={() => handleSave(PurchaseOrderStatus.PENDING)} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save as Draft</button>
                        <button onClick={() => handleSave(PurchaseOrderStatus.SUBMITTED)} className="px-6 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">Submit Order</button>
                    </>
                )}
            </div>

            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Add Product to Order">
                <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className={INPUT_FIELD_CLASSES + " mb-4"} />
                <ul className="space-y-1 max-h-80 overflow-y-auto">
                    {filteredProducts.map(p => (
                        <li key={p.id}>
                            <button onClick={() => handleAddItem(p)} disabled={(po.items || []).some(i => i.productId === p.id)} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                                {p.name} <span className="text-gray-400">({p.sku})</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </Modal>
        </div>
    );
};


// --- App Layout & Router --- //
const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const { settings, productsWithStock } = useStore();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    
    const lowStockProducts = useMemo(() => productsWithStock.filter(p => p.totalStock <= p.lowStockThreshold), [productsWithStock]);
    
    // Update dynamic document title and favicon
    useEffect(() => {
        document.title = settings.appName || 'Pharmacy POS';
        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (favicon) {
            favicon.href = settings.appIcon || 'about:blank';
        } else if (settings.appIcon) {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = settings.appIcon;
            document.head.appendChild(newFavicon);
        }
    }, [settings]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Dashboard', icon: icons.dashboard, href: '#/', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'POS', icon: icons.pos, href: '#/pos', roles: [UserRole.SUPER_ADMIN, UserRole.CASHIER] },
        { name: 'Products', icon: icons.products, href: '#/products', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Inventory', icon: icons.inventory, href: '#/inventory', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Purchase Orders', icon: icons.purchaseOrder, href: '#/purchase-orders', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Tasks', icon: icons.clipboard, href: '#/tasks', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Sales', icon: icons.sales, href: '#/sales', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Reports', icon: icons.reports, href: '#/reports', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Suppliers', icon: icons.suppliers, href: '#/suppliers', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Categories', icon: icons.category, href: '#/categories', roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Users', icon: icons.users, href: '#/users', roles: [UserRole.SUPER_ADMIN] },
        { name: 'Settings', icon: icons.settings, href: '#/settings', roles: [UserRole.SUPER_ADMIN] },
    ].filter(link => user && link.roles.includes(user.role));

    const currentPath = window.location.hash || '#/';
    
    return (
        <div className="flex h-screen bg-light dark:bg-dark-bg text-dark dark:text-light">
            {/* Sidebar */}
            <aside className={`bg-white dark:bg-dark-card w-64 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="flex items-center justify-center p-4 h-20 border-b dark:border-gray-700">
                   {settings.appLogo ? (
                       <img src={settings.appLogo} alt="Logo" className="h-10 object-contain" />
                   ) : (
                       <h1 className="text-2xl font-bold text-primary">{settings.appName}</h1>
                   )}
                </div>
                <nav className="p-4">
                    <ul>
                        {navLinks.map(link => (
                            <li key={link.name}>
                                <a href={link.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg my-1 transition-colors ${currentPath === link.href ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    {link.icon}
                                    <span>{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-dark-card shadow-md z-30">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-500 dark:text-gray-400">
                        {icons.hamburger}
                    </button>
                    <div className="flex-grow"></div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent">
                            {theme === 'light' ? icons.moon : icons.sun}
                        </button>

                         <div ref={notificationRef} className="relative">
                            <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent relative">
                                {icons.bell}
                                {lowStockProducts.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{lowStockProducts.length}</span>}
                            </button>
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-card border dark:border-gray-700 rounded-lg shadow-lg z-20">
                                    <div className="p-3 border-b dark:border-gray-700">
                                        <h4 className="font-semibold text-sm">Low Stock Alerts</h4>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                    {lowStockProducts.length > 0 ? (
                                        lowStockProducts.map(p => (
                                            <a key={p.id} href="#/products" onClick={() => setIsNotificationsOpen(false)} className="flex justify-between p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <span>{p.name}</span>
                                                <span className="font-bold text-red-500">{p.totalStock} left</span>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-gray-500">No low stock items.</p>
                                    )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div ref={profileRef} className="relative">
                            <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-2">
                                <span className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">{user?.name[0]}</span>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border dark:border-gray-700 rounded-lg shadow-lg z-20">
                                    <div className="p-3 border-b dark:border-gray-700">
                                        <p className="font-semibold truncate">{user?.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</p>
                                    </div>
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                                        {icons.logout} Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setPage(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    // Simple router
    const renderPage = () => {
        const path = page.split('?')[0]; // Ignore query params for routing
        
        // Non-protected routes
        if (!user) return <LoginPage />;

        if (path.startsWith('#/purchase-order/')) {
            const poId = path.substring('#/purchase-order/'.length); // 'new' or an actual id
            return <PurchaseOrderFormPage poId={poId} />;
        }

        switch (path) {
            case '#/':
                if (user.role === UserRole.CASHIER) return <POSPage />;
                return <DashboardPage />;
            case '#/pos':
                return <POSPage />;
            case '#/products':
                return <ProductManagementPage />;
            case '#/inventory':
                return <InventoryManagementPage />;
            case '#/purchase-orders':
                return <PurchaseOrdersManagementPage />;
            case '#/receive-stock':
                return <ReceiveStockPage />;
            case '#/tasks':
                return <TasksManagementPage />;
            case '#/sales':
                return <SalesHistoryPage />;
            case '#/reports': 
                return <ReportsPage />;
            case '#/suppliers': 
                return <SupplierManagementPage />;
            case '#/categories': 
                return <CategoryManagementPage />;
            case '#/users': 
                return <UserManagementPage />;
            case '#/settings': 
                return <SettingsPage />;
            default:
                return <div className="text-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>;
        }
    };
    
    if(!user) return <LoginPage />;

    return (
        <AppLayout>
            {renderPage()}
        </AppLayout>
    );
};

// Root component with all providers
const Root = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <StoreProvider>
                    <App />
                </StoreProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default Root;
