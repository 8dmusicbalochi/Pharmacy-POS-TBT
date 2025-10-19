import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, ReactNode, useRef } from 'react';
import { User, UserRole, Product, CartItem, Sale, AuditLog, AppSettings, Category, PaymentMethod, Supplier, InventoryItem, Task, PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus, Refund, Notification, NotificationType } from './types';
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
    refresh: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>,
};

// --- DATA STORE / CONTEXT --- //
interface StoreContextType {
    currentUser: User | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    users: Omit<User, 'password'>[];
    products: Product[];
    inventory: InventoryItem[];
    sales: Sale[];
    auditLogs: AuditLog[];
    settings: AppSettings;
    categories: Category[];
    suppliers: Supplier[];
    tasks: Task[];
    purchaseOrders: PurchaseOrder[];
    refunds: Refund[];
    notifications: Notification[];
    fetchData: (dataType: keyof Omit<StoreContextType, 'currentUser' | 'login' | 'logout' | 'fetchData' | 'getters' | 'actions' | 'settings'>) => void;
    getters: {
        getProductById: (id: string) => Product | undefined;
        getInventoryForProduct: (productId: string) => InventoryItem[];
        getTotalStock: (productId: string) => number;
        getSupplierById: (id: string) => Supplier | undefined;
        getUserById: (id: string) => Omit<User, 'password'> | undefined;
        getSaleById: (id: string) => Sale | undefined;
        getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
    };
    actions: {
        saveUser: (user: User) => Promise<void>;
        deleteUser: (userId: string) => Promise<void>;
        saveProduct: (product: Product) => Promise<void>;
        deleteProduct: (productId: string) => Promise<void>;
        bulkAddProducts: (products: Omit<Product, 'id'>[]) => Promise<{ added: number, updated: number }>;
        receiveStock: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => Promise<void>;
        addSale: (sale: Omit<Sale, 'id'| 'totalCost'| 'totalProfit'>) => Promise<Sale>;
        addAuditLog: (log: Omit<AuditLog, 'id'>) => Promise<void>;
        saveSettings: (settings: AppSettings) => Promise<void>;
        saveCategory: (category: Category) => Promise<void>;
        deleteCategory: (categoryId: string) => Promise<void>;
        saveSupplier: (supplier: Supplier) => Promise<void>;
        deleteSupplier: (supplierId: string) => Promise<void>;
        saveTask: (task: Task) => Promise<void>;
        deleteTask: (taskId: string) => Promise<void>;
        savePurchaseOrder: (po: PurchaseOrder) => Promise<PurchaseOrder>;
        deletePurchaseOrder: (poId: string) => Promise<void>;
        addRefund: (refund: Omit<Refund, 'id'>) => Promise<void>;
        markNotificationsAsRead: (ids: string[]) => Promise<void>;
    };
}

const StoreContext = createContext<StoreContextType | null>(null);

const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [settings, setSettings] = useState<AppSettings>(mockApi.getSettings());
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const fetchData = useCallback((dataType: keyof Omit<StoreContextType, 'currentUser' | 'login' | 'logout' | 'fetchData' | 'getters' | 'actions' | 'settings'>) => {
        try {
            switch (dataType) {
                case 'users': setUsers(mockApi.getUsers()); break;
                case 'products': setProducts(mockApi.getProducts()); break;
                case 'inventory': setInventory(mockApi.getInventory()); break;
                case 'sales': setSales(mockApi.getSales()); break;
                case 'auditLogs': setAuditLogs(mockApi.getAuditLogs()); break;
                case 'categories': setCategories(mockApi.getCategories()); break;
                case 'suppliers': setSuppliers(mockApi.getSuppliers()); break;
                case 'tasks': setTasks(mockApi.getTasks()); break;
                case 'purchaseOrders': setPurchaseOrders(mockApi.getPurchaseOrders()); break;
                case 'refunds': setRefunds(mockApi.getRefunds()); break;
                case 'notifications': setNotifications(mockApi.getNotifications()); break;
            }
        } catch (error) {
            console.error(`Error fetching ${dataType}:`, error);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            // Fetch all data on login
            const dataTypes: (keyof Omit<StoreContextType, 'currentUser' | 'login' | 'logout' | 'fetchData' | 'getters' | 'actions' | 'settings'>)[] = ['users', 'products', 'inventory', 'sales', 'auditLogs', 'categories', 'suppliers', 'tasks', 'purchaseOrders', 'refunds', 'notifications'];
            dataTypes.forEach(type => fetchData(type));
            // Check for overdue POs on load
            if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.STOCK_MANAGER) {
                mockApi.checkForOverduePurchaseOrders();
                fetchData('notifications');
            }
        }
    }, [currentUser, fetchData]);

    const login = (username: string, pass: string): boolean => {
        const usersWithPasswords = mockApi.getUsersForAuth();
        const user = usersWithPasswords.find(u => u.username === username && u.password === pass);
        if (user) {
            const { password, ...userToStore } = user;
            setCurrentUser(userToStore);
            sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };
    
    const getters = useMemo(() => ({
        getProductById: (id: string) => products.find(p => p.id === id),
        getInventoryForProduct: (productId: string) => inventory.filter(i => i.productId === productId),
        getTotalStock: (productId: string) => inventory.filter(i => i.productId === productId).reduce((sum, item) => sum + item.quantity, 0),
        getSupplierById: (id: string) => suppliers.find(s => s.id === id),
        getUserById: (id: string) => users.find(u => u.id === id),
        getSaleById: (id: string) => sales.find(s => s.id === id),
        getPurchaseOrderById: (id: string) => purchaseOrders.find(p => p.id === id),
    }), [products, inventory, suppliers, users, sales, purchaseOrders]);

    const actions = useMemo(() => ({
        saveUser: async (user: User) => {
            mockApi.saveUser(user);
            fetchData('users');
        },
        deleteUser: async (userId: string) => {
            mockApi.deleteUser(userId);
            fetchData('users');
        },
        saveProduct: async (product: Product) => {
            mockApi.saveProduct(product);
            fetchData('products');
        },
        deleteProduct: async (productId: string) => {
            mockApi.deleteProduct(productId);
            fetchData('products');
            fetchData('inventory');
        },
        bulkAddProducts: async (newProducts: Omit<Product, 'id'>[]) => {
            const result = mockApi.bulkAddProducts(newProducts);
            fetchData('products');
            return result;
        },
        receiveStock: async (item: Omit<InventoryItem, 'id'|'addedDate'>) => {
            const fullItem: InventoryItem = {
                ...item,
                id: `inv-${Date.now()}`,
                addedDate: new Date().toISOString()
            };
            mockApi.receiveStockAndUpdatePO(fullItem);
            fetchData('inventory');
            if(fullItem.purchaseOrderId) fetchData('purchaseOrders');
        },
        addSale: async (sale: Omit<Sale, 'id'| 'totalCost'| 'totalProfit'>) => {
            const newSale = mockApi.addSale(sale);
            fetchData('sales');
            fetchData('inventory'); // Inventory is updated
            return newSale;
        },
        addAuditLog: async (log: Omit<AuditLog, 'id'>) => {
            mockApi.addAuditLog(log);
            fetchData('auditLogs');
        },
        saveSettings: async (newSettings: AppSettings) => {
            mockApi.saveSettings(newSettings);
            setSettings(newSettings);
        },
        saveCategory: async (category: Category) => {
            mockApi.saveCategory(category);
            fetchData('categories');
            fetchData('products');
        },
        deleteCategory: async (categoryId: string) => {
            mockApi.deleteCategory(categoryId);
            fetchData('categories');
            fetchData('products');
        },
        saveSupplier: async (supplier: Supplier) => {
            mockApi.saveSupplier(supplier);
            fetchData('suppliers');
        },
        deleteSupplier: async (supplierId: string) => {
            mockApi.deleteSupplier(supplierId);
            fetchData('suppliers');
        },
        saveTask: async (task: Task) => {
            mockApi.saveTask(task);
            fetchData('tasks');
        },
        deleteTask: async (taskId: string) => {
            mockApi.deleteTask(taskId);
            fetchData('tasks');
        },
        savePurchaseOrder: async (po: PurchaseOrder): Promise<PurchaseOrder> => {
            const savedPo = mockApi.savePurchaseOrder(po);
            fetchData('purchaseOrders');
            fetchData('notifications'); // Status changes might create notifications
            return savedPo;
        },
        deletePurchaseOrder: async (poId: string) => {
            mockApi.deletePurchaseOrder(poId);
            fetchData('purchaseOrders');
        },
        addRefund: async (refund: Omit<Refund, 'id'>) => {
            mockApi.addRefund(refund);
            fetchData('refunds');
            fetchData('sales');
            fetchData('inventory');
            fetchData('auditLogs');
        },
        markNotificationsAsRead: async (ids: string[]) => {
            mockApi.markNotificationsAsRead(ids);
            fetchData('notifications');
        }
    }), [fetchData]);

    const value = {
        currentUser,
        login,
        logout,
        users,
        products,
        inventory,
        sales,
        auditLogs,
        settings,
        categories,
        suppliers,
        tasks,
        purchaseOrders,
        refunds,
        notifications,
        fetchData,
        getters,
        actions,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// --- HOOKS --- //
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
};

const useDarkMode = () => {
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    return [theme, setTheme] as const;
};

const useRouter = () => {
    const [hash, setHash] = useState(window.location.hash);

    const handleHashChange = useCallback(() => {
        setHash(window.location.hash);
    }, []);

    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [handleHashChange]);

    const navigate = (path: string) => {
        window.location.hash = path;
    };
    
    const { page, param } = useMemo(() => {
        const pathParts = hash.replace('#/', '').split('/');
        const page = pathParts[0] || 'dashboard';
        const param = pathParts[1];
        return { page, param };
    }, [hash]);

    return { page, param, navigate };
};

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const useSort = <T,>(data: T[], initialSortKey: keyof T, initialSortOrder: 'asc' | 'desc' = 'asc') => {
    const [sortKey, setSortKey] = useState<keyof T>(initialSortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Fallback for dates as strings
            const aDate = new Date(aValue as any).getTime();
            const bDate = new Date(bValue as any).getTime();
            if (!isNaN(aDate) && !isNaN(bDate)) {
                 return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
            }

            return 0;
        });
    }, [data, sortKey, sortOrder]);
    
    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    
    const renderSortArrow = (key: keyof T) => {
        if (sortKey !== key) {
            return icons.sort;
        }
        return sortOrder === 'asc' ? icons.sortAsc : icons.sortDesc;
    };
    
    return { sortedData, handleSort, renderSortArrow, sortKey, sortOrder };
};


// --- UTILITY COMPONENTS --- //

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className={`inline-block align-bottom bg-white dark:bg-dark-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
                    <div className="bg-white dark:bg-dark-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-4">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tooltip: React.FC<{ text: string; children: ReactNode }> = ({ text, children }) => {
    return (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-max">
                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2">
                    {text}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const SearchBar: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icons.search}
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-dark-card dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
        </div>
    );
};

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700 dark:text-gray-400">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-dark-card text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                    Previous
                </button>
                {/* Simplified pagination for now */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-dark-card text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

// --- AUTH COMPONENTS --- //
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, settings } = useStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (login(username, password)) {
            // Login successful, the StoreProvider will handle the redirect
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
            <div className="max-w-md w-full bg-white dark:bg-dark-card shadow-md rounded-lg p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{settings.appName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Please sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: ReactNode; allowedRoles: UserRole[] }> = ({ children, allowedRoles }) => {
    const { currentUser } = useStore();
    const router = useRouter();

    if (!currentUser) {
        router.navigate('login');
        return null;
    }

    if (!allowedRoles.includes(currentUser.role)) {
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return <>{children}</>;
};

// --- LAYOUT COMPONENTS --- //

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { currentUser, logout, settings } = useStore();
    const [theme, setTheme] = useDarkMode();

    return (
        <header className="bg-white dark:bg-dark-card shadow-sm p-4 flex justify-between items-center">
             <div className="flex items-center">
                 <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 mr-4 lg:hidden">
                    {icons.hamburger}
                </button>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{settings.appName}</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="text-gray-600 dark:text-gray-300">
                    {theme === 'light' ? icons.moon : icons.sun}
                </button>
                
                <NotificationPopover />

                <div className="relative">
                    <span className="text-gray-800 dark:text-white">{currentUser?.name}</span>
                </div>
                 <button onClick={logout} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary">
                   {icons.logout}
                </button>
            </div>
        </header>
    );
};

const NotificationPopover: React.FC = () => {
    const { notifications, actions } = useStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    const handleToggle = () => setIsOpen(prev => !prev);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            actions.markNotificationsAsRead([notification.id]);
        }
        router.navigate(notification.link.replace('#', ''));
        setIsOpen(false);
    };
    
    const markAllAsRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
            actions.markNotificationsAsRead(unreadIds);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getNotificationIcon = (type: NotificationType) => {
        switch(type) {
            case NotificationType.PO_SHIPPED: return <span className="text-blue-500">{icons.purchaseOrder}</span>;
            case NotificationType.PO_RECEIVED: return <span className="text-green-500">{icons.inventory}</span>;
            case NotificationType.PO_OVERDUE: return <span className="text-red-500">{icons.calendar}</span>;
            default: return <span className="text-gray-500">{icons.bell}</span>;
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button onClick={handleToggle} className="relative text-gray-600 dark:text-gray-300">
                {icons.bell}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-md shadow-lg z-20">
                    <div className="py-2 px-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div key={notification.id} onClick={() => handleNotificationClick(notification)}
                                    className={`flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className="flex-shrink-0 mr-3">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                                    </div>
                                    {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full self-center ml-2"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">No new notifications</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<{ isOpen: boolean; onLinkClick: () => void }> = ({ isOpen, onLinkClick }) => {
    const { currentUser } = useStore();
    const router = useRouter();
    
    const navLinks = [
        { name: 'Dashboard', path: '#dashboard', icon: icons.dashboard, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'POS', path: '#pos', icon: icons.pos, roles: [UserRole.SUPER_ADMIN, UserRole.CASHIER] },
        { name: 'Sales History', path: '#sales', icon: icons.sales, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Inventory', path: '#inventory', icon: icons.inventory, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Receive Stock', path: '#receive-stock', icon: icons.plus, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Products', path: '#products', icon: icons.products, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Categories', path: '#categories', icon: icons.category, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Suppliers', path: '#suppliers', icon: icons.suppliers, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Purchase Orders', path: '#purchase-orders', icon: icons.purchaseOrder, roles: [UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER] },
        { name: 'Users', path: '#users', icon: icons.users, roles: [UserRole.SUPER_ADMIN] },
        { name: 'Settings', path: '#settings', icon: icons.settings, roles: [UserRole.SUPER_ADMIN] },
    ];

    return (
        <aside className={`bg-primary dark:bg-dark-card text-white w-64 space-y-2 py-4 flex flex-col fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
           <div className="px-4 mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">{icons.dashboard} <span className="ml-2">Pharmacy POS</span></h2>
            </div>
            <nav className="flex-1 px-2 space-y-1">
                {navLinks.filter(link => link.roles.includes(currentUser!.role)).map(link => (
                    <a
                        key={link.name}
                        href={link.path}
                        onClick={onLinkClick}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${router.page === link.path.substring(1).split('/')[0] ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
};

// --- PAGE COMPONENTS --- //
const DashboardPage: React.FC = () => {
    const { sales, products, inventory, tasks, actions, getters, currentUser } = useStore();
    const [filter, setFilter] = useState('today');

    const filteredSales = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return sales.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            if (filter === 'today') return saleDate >= today;
            if (filter === 'week') return saleDate >= thisWeekStart;
            if (filter === 'month') return saleDate >= thisMonthStart;
            return true;
        });
    }, [sales, filter]);

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0);
    const totalSales = filteredSales.length;

    const lowStockProducts = useMemo(() => {
        return products.filter(p => getters.getTotalStock(p.id) < p.lowStockThreshold);
    }, [products, getters]);
    
    const expiredProductsCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return inventory.filter(i => i.expiryDate && i.expiryDate < today).length;
    }, [inventory]);

    const topSellingProducts = useMemo(() => {
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = productSales.get(item.id);
                if (existing) {
                    productSales.set(item.id, {
                        ...existing,
                        quantity: existing.quantity + item.quantity,
                        revenue: existing.revenue + item.price * item.quantity
                    });
                } else {
                    productSales.set(item.id, {
                        name: item.name,
                        quantity: item.quantity,
                        revenue: item.price * item.quantity
                    });
                }
            });
        });
        return Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [filteredSales]);
    
    const salesChartData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const now = new Date();

        if (filter === 'today') {
            for (let i = 0; i < 24; i++) { data[String(i).padStart(2, '0') + ':00'] = 0; }
            filteredSales.forEach(sale => {
                const hour = new Date(sale.timestamp).getHours();
                const key = String(hour).padStart(2, '0') + ':00';
                data[key] = (data[key] || 0) + sale.total;
            });
        } else if (filter === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(day => data[day] = 0);
            filteredSales.forEach(sale => {
                const day = days[new Date(sale.timestamp).getDay()];
                data[day] = (data[day] || 0) + sale.total;
            });
        } else if (filter === 'month') {
             const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
             for (let i = 1; i <= daysInMonth; i++) { data[`Day ${i}`] = 0; }
             filteredSales.forEach(sale => {
                const day = `Day ${new Date(sale.timestamp).getDate()}`;
                data[day] = (data[day] || 0) + sale.total;
             });
        }
        
        return {
            labels: Object.keys(data),
            datasets: [{
                label: 'Revenue',
                data: Object.values(data),
                backgroundColor: 'rgba(0, 122, 122, 0.2)',
                borderColor: 'rgba(0, 122, 122, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            }]
        };
    }, [filteredSales, filter]);

    const StatCard: React.FC<{ title: string; value: string | number; icon: ReactNode; color: string }> = ({ title, value, icon, color }) => (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    );

    const SalesChart: React.FC<{ data: any }> = ({ data }) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        // Chart.js would be imported and used here. For now, a placeholder:
        useEffect(() => {
            // A real implementation would use a library like Chart.js
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Simple bar chart drawing
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const barWidth = canvas.width / (data.labels.length * 2);
                    const maxVal = Math.max(...data.datasets[0].data, 1);
                    ctx.fillStyle = '#007A7A';
                    data.datasets[0].data.forEach((val: number, i: number) => {
                        const barHeight = (val / maxVal) * (canvas.height - 20);
                        ctx.fillRect(i * barWidth * 1.5 + barWidth / 2, canvas.height - barHeight - 10, barWidth, barHeight);
                        ctx.fillStyle = '#333';
                        ctx.textAlign = 'center';
                        ctx.fillText(data.labels[i], i * barWidth * 1.5 + barWidth, canvas.height, barWidth);
                    });
                }
            }
        }, [data]);
        
        return (
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sales Overview</h3>
                <canvas ref={canvasRef} height="200"></canvas>
            </div>
        );
    };

    const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
        const handleToggle = () => {
            actions.saveTask({ ...task, isCompleted: !task.isCompleted });
        };
        const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();

        return (
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                <div className="flex items-center">
                    <input type="checkbox" checked={task.isCompleted} onChange={handleToggle} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <div className="ml-3">
                        <p className={`text-sm font-medium text-gray-900 dark:text-white ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                            {task.title}
                        </p>
                        {task.assignedToName && <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to: {task.assignedToName}</p>}
                    </div>
                </div>
                <div className={`text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                <div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={icons.dollar} color="bg-green-100 text-green-600" />
                <StatCard title="Total Profit" value={`$${totalProfit.toFixed(2)}`} icon={icons.trendingUp} color="bg-blue-100 text-blue-600" />
                <StatCard title="Total Sales" value={totalSales} icon={icons.pos} color="bg-yellow-100 text-yellow-600" />
                <StatCard title="Low Stock Items" value={lowStockProducts.length} icon={icons.inventory} color="bg-red-100 text-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={salesChartData} />
                </div>
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Quick Summary</h3>
                    <div className="space-y-4">
                       <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Top Selling Products</h4>
                            <ul className="mt-2 space-y-2">
                                {topSellingProducts.map(p => (
                                    <li key={p.name} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>{p.name}</span>
                                        <span className="font-medium text-gray-800 dark:text-white">${p.revenue.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Inventory Alerts</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{lowStockProducts.length} items running low on stock.</p>
                            <p className="text-sm text-red-500">{expiredProductsCount} items have expired.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">My Tasks</h3>
                <div className="space-y-2">
                    {tasks.filter(t => !t.isCompleted && (t.assignedToId === currentUser?.id || !t.assignedToId)).slice(0, 5).map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                    {tasks.filter(t => !t.isCompleted).length === 0 && <p className="text-gray-500 dark:text-gray-400">No pending tasks. Great job!</p>}
                </div>
            </div>
        </div>
    );
};

const POSPage: React.FC = () => {
    const { products, getters, actions, currentUser, settings } = useStore();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);

    const filteredProducts = useMemo(() => {
        if (!debouncedSearchTerm) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ).slice(0, 10);
    }, [products, debouncedSearchTerm]);

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id);
        const stock = getters.getTotalStock(product.id);

        if (existingItem) {
            if (existingItem.quantity < stock) {
                setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            } else {
                alert(`Cannot add more ${product.name}. Only ${stock} available in stock.`);
            }
        } else {
            if (stock > 0) {
                setCart([...cart, { ...product, quantity: 1 }]);
            } else {
                alert(`${product.name} is out of stock.`);
            }
        }
    };
    
    const updateQuantity = (productId: string, quantity: number) => {
        const stock = getters.getTotalStock(productId);
        if (quantity > stock) {
            alert(`Cannot set quantity to ${quantity}. Only ${stock} available.`);
            quantity = stock;
        }
        if (quantity <= 0) {
            setCart(cart.filter(item => item.id !== productId));
        } else {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'> = {
            items: cart,
            subtotal,
            total: subtotal,
            timestamp: new Date().toISOString(),
            cashierId: currentUser!.id,
            cashierName: currentUser!.name,
            paymentMethod,
        };
        const newSale = await actions.addSale(sale);
        setLastSale(newSale);
        setShowReceipt(true);
    };

    const handleNewSale = () => {
        setCart([]);
        setShowReceipt(false);
        setLastSale(null);
        setSearchTerm('');
    };
    
    const startScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            const html5QrCode = new Html5Qrcode("barcode-scanner");
            const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
                const product = products.find(p => p.sku === decodedText);
                if (product) {
                    addToCart(product);
                    setSearchTerm('');
                } else {
                    alert(`Product with SKU ${decodedText} not found.`);
                }
                html5QrCode.stop().then(() => setIsScanning(false)).catch((err:any) => console.log('stop err', err));
            };
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined).catch((err: any) => {
                console.error("Unable to start scanning.", err);
                setIsScanning(false);
            });
            scannerRef.current = html5QrCode;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            (scannerRef.current as any).stop().then(() => setIsScanning(false)).catch((err: any) => console.error("Scanner stop failed", err));
        } else {
            setIsScanning(false);
        }
    };
    
    if (showReceipt && lastSale) {
        return <SaleReceipt sale={lastSale} onNewSale={handleNewSale} settings={settings} />;
    }
    
    return (
        <div className="flex h-[calc(100vh-65px)]">
            <div className="w-2/3 p-4 flex flex-col">
                <div className="relative mb-4">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or SKU..." />
                    <button onClick={startScanner} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-600 rounded">
                        {icons.barcode}
                    </button>
                    {filteredProducts.length > 0 && searchTerm && (
                        <div className="absolute z-10 w-full bg-white dark:bg-dark-card shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                            <ul>
                                {filteredProducts.map(product => (
                                    <li key={product.id} onClick={() => { addToCart(product); setSearchTerm(''); }}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{product.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku} | Stock: {getters.getTotalStock(product.id)}</p>
                                        </div>
                                        <p className="font-semibold text-primary">{settings.currencySymbol}{product.price.toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                 {isScanning && (
                    <Modal isOpen={isScanning} onClose={stopScanner} title="Scan Barcode">
                        <div id="barcode-scanner" className="w-full"></div>
                    </Modal>
                )}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-dark-card p-4 rounded-lg shadow-inner">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Current Sale</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Cart is empty. Add products to get started.</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                                    <th className="text-center py-2 font-semibold text-gray-600 dark:text-gray-300">Quantity</th>
                                    <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                                    <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                                    <th className="py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id} className="border-b dark:border-gray-700">
                                        <td className="py-3 text-gray-800 dark:text-white">{item.name}</td>
                                        <td className="py-3">
                                            <div className="flex items-center justify-center">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600">{icons.minus}</button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    className="w-12 text-center mx-2 bg-transparent dark:text-white"
                                                />
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600">{icons.plus}</button>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-gray-600 dark:text-gray-400">{settings.currencySymbol}{item.price.toFixed(2)}</td>
                                        <td className="py-3 text-right font-semibold text-gray-800 dark:text-white">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</td>
                                        <td className="py-3 text-right">
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">{icons.trash}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <div className="w-1/3 bg-gray-50 dark:bg-dark-card p-6 flex flex-col shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Checkout</h2>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between text-lg">
                        <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-lg">
                        <span className="text-gray-600 dark:text-gray-300">Tax (0%)</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{settings.currencySymbol}0.00</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                    <div className="flex justify-between text-2xl font-bold">
                        <span className="text-gray-800 dark:text-white">Total</span>
                        <span className="text-primary">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Payment Method</h3>
                    <div className="flex space-x-4">
                        <button onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${paymentMethod === PaymentMethod.CASH ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                            {icons.cash} <span className="dark:text-white">Cash</span>
                        </button>
                        <button onClick={() => setPaymentMethod(PaymentMethod.CARD)} className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center space-x-2 ${paymentMethod === PaymentMethod.CARD ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                           {icons.card} <span className="dark:text-white">Card</span>
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-primary text-white font-bold py-4 rounded-lg mt-8 text-lg hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Complete Payment
                </button>
            </div>
        </div>
    );
};

const SaleReceipt: React.FC<{ sale: Sale; onNewSale: () => void; settings: AppSettings; }> = ({ sale, onNewSale, settings }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = document.getElementById('qrcode') as HTMLCanvasElement;
        if (canvas && QRCode) {
            QRCode.toCanvas(canvas, sale.id, function (error: any) {
                if (error) console.error(error);
            });
        }
    }, [sale.id]);

    const handlePrint = () => {
        const printContent = receiptRef.current?.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Receipt</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent || '');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="p-8 flex flex-col items-center bg-gray-100 dark:bg-dark-bg">
            <div ref={receiptRef} className="bg-white dark:bg-dark-card shadow-lg rounded-lg p-8 w-full max-w-sm text-gray-800 dark:text-white">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">{settings.appName}</h1>
                    <p className="text-sm">Sale Receipt</p>
                </div>
                <div className="text-sm space-y-1 mb-4">
                    <p><strong>Sale ID:</strong> {sale.id}</p>
                    <p><strong>Date:</strong> {new Date(sale.timestamp).toLocaleString()}</p>
                    <p><strong>Cashier:</strong> {sale.cashierName}</p>
                </div>
                <div className="border-t border-b border-dashed border-gray-300 dark:border-gray-600 py-4">
                    {sale.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm mb-2">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-gray-500 dark:text-gray-400">{item.quantity} x {settings.currencySymbol}{item.price.toFixed(2)}</p>
                            </div>
                            <p>{settings.currencySymbol}{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                 <div className="py-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span>{settings.currencySymbol}{sale.subtotal.toFixed(2)}</span>
                    </div>
                    {sale.discountAmount && (
                         <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                            <span>-{settings.currencySymbol}{sale.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-base">
                        <span>Total:</span>
                        <span>{settings.currencySymbol}{sale.total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                        <span>{sale.paymentMethod}</span>
                    </div>
                </div>
                <div className="text-center mt-6">
                    <canvas id="qrcode" className="mx-auto"></canvas>
                    <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Thank you for your purchase!</p>
                </div>
            </div>
            <div className="mt-8 flex space-x-4">
                <button onClick={onNewSale} className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90">
                    New Sale
                </button>
                 <button onClick={handlePrint} className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 flex items-center space-x-2">
                    {icons.print} <span>Print</span>
                </button>
            </div>
        </div>
    );
};

const SalesHistoryPage: React.FC = () => {
    const { sales, settings, getters, refunds } = useStore();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const filteredSales = useMemo(() => {
        return sales.filter(sale =>
            sale.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            sale.cashierName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            sale.items.some(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );
    }, [sales, debouncedSearch]);

    const { sortedData: sortedSales, handleSort, renderSortArrow } = useSort(filteredSales, 'timestamp', 'desc');
    
    const getSaleStatus = (sale: Sale) => {
        if (!sale.refundedAmount || sale.refundedAmount === 0) {
            return <span className="text-green-500">Completed</span>;
        }
        if (sale.refundedAmount >= sale.total) {
            return <span className="text-red-500">Refunded</span>;
        }
        return <span className="text-yellow-500">Part. Refunded</span>;
    };


    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Sales History</h1>
            <div className="mb-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by Sale ID, Cashier, or Product..." />
            </div>
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('timestamp')}>Date {renderSortArrow('timestamp')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('id')}>Sale ID {renderSortArrow('id')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('cashierName')}>Cashier {renderSortArrow('cashierName')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('total')}>Total {renderSortArrow('total')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('totalProfit')}>Profit {renderSortArrow('totalProfit')}</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSales.map(sale => (
                            <tr key={sale.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">{new Date(sale.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.id}</td>
                                <td className="px-6 py-4">{sale.cashierName}</td>
                                <td className="px-6 py-4">{settings.currencySymbol}{sale.total.toFixed(2)}</td>
                                <td className="px-6 py-4">{settings.currencySymbol}{(sale.totalProfit || 0).toFixed(2)}</td>
                                <td className="px-6 py-4">{getSaleStatus(sale)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedSale(sale)} className="text-primary hover:underline mr-4">View</button>
                                    <button onClick={() => router.navigate(`/refund/${sale.id}`)} className="text-accent hover:underline">Refund</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedSale && (
                <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title={`Sale Details: ${selectedSale.id}`} size="lg">
                    <SaleReceipt sale={selectedSale} onNewSale={() => setSelectedSale(null)} settings={settings} />
                </Modal>
            )}
        </div>
    );
};

const InventoryManagementPage: React.FC = () => {
    const { inventory, products, actions, currentUser, getters, fetchData } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [view, setView] = useState<'summary' | 'batches'>('summary');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [logReason, setLogReason] = useState('');
    const [adjustment, setAdjustment] = useState(0);

    const inventorySummary = useMemo(() => {
        const summary = products.map(product => {
            const batches = getters.getInventoryForProduct(product.id);
            const totalStock = batches.reduce((sum, item) => sum + item.quantity, 0);
            const expiringSoon = batches.some(item => item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
            const expired = batches.some(item => item.expiryDate && new Date(item.expiryDate) < new Date());
            return {
                ...product,
                totalStock,
                expiringSoon,
                expired,
            };
        });
        return summary.filter(p =>
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [products, getters, debouncedSearch]);

    const batchDetails = useMemo(() => {
        return inventory.map(item => {
            const product = getters.getProductById(item.productId);
            return {
                ...item,
                productName: product?.name || 'N/A',
                productSku: product?.sku || 'N/A',
            };
        }).filter(item =>
            item.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.productSku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.batchNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [inventory, getters, debouncedSearch]);
    
    const handleAdjustStock = async () => {
        if (!editingItem || !logReason || adjustment === 0) return;

        const originalQuantity = editingItem.quantity;
        const newQuantity = originalQuantity + adjustment;

        if (newQuantity < 0) {
            alert("Stock cannot be negative.");
            return;
        }

        const updatedItem = { ...editingItem, quantity: newQuantity };
        mockApi.saveInventoryItem(updatedItem); // Directly call mockApi to prevent re-fetch loop

        await actions.addAuditLog({
            timestamp: new Date().toISOString(),
            userId: currentUser!.id,
            userName: currentUser!.name,
            productId: editingItem.productId,
            productName: products.find(p => p.id === editingItem.productId)?.name || 'N/A',
            quantityChange: adjustment,
            newTotalStock: getters.getTotalStock(editingItem.productId) + adjustment,
            reason: logReason,
        });

        // Manually update local state to avoid full re-fetch if not desired
        fetchData('inventory');
        setEditingItem(null);
        setLogReason('');
        setAdjustment(0);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Inventory Management</h1>
            <div className="flex justify-between items-center mb-4">
                <div className="w-1/3">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search products or batches..." />
                </div>
                <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button onClick={() => setView('summary')} className={`px-4 py-1 rounded-md text-sm font-medium ${view === 'summary' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Summary View</button>
                    <button onClick={() => setView('batches')} className={`px-4 py-1 rounded-md text-sm font-medium ${view === 'batches' ? 'bg-white dark:bg-dark-card shadow' : ''}`}>Batch View</button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-x-auto">
                {view === 'summary' ? (
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Product</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Total Stock</th>
                                <th scope="col" className="px-6 py-3">Low Stock Threshold</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                         <tbody>
                            {inventorySummary.map(p => {
                                const isLowStock = p.totalStock < p.lowStockThreshold;
                                return (
                                <tr key={p.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-4">{p.sku}</td>
                                    <td className={`px-6 py-4 font-bold ${isLowStock ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{p.totalStock}</td>
                                    <td className="px-6 py-4">{p.lowStockThreshold}</td>
                                    <td className="px-6 py-4">
                                        {isLowStock && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Low Stock</span>}
                                        {p.expiringSoon && !p.expired && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Expiring Soon</span>}
                                        {p.expired && <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Expired</span>}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                             <tr>
                                <th scope="col" className="px-6 py-3">Product</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Batch Number</th>
                                <th scope="col" className="px-6 py-3">Quantity</th>
                                <th scope="col" className="px-6 py-3">Expiry Date</th>
                                <th scope="col" className="px-6 py-3">Added Date</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchDetails.map(item => (
                                <tr key={item.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.productName}</td>
                                    <td className="px-6 py-4">{item.productSku}</td>
                                    <td className="px-6 py-4">{item.batchNumber}</td>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(item.addedDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setEditingItem(item)} className="text-primary hover:underline">{icons.edit}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {editingItem && (
                 <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={`Adjust Stock for ${products.find(p=>p.id === editingItem.productId)?.name} (Batch: ${editingItem.batchNumber})`}>
                    <div className="space-y-4">
                        <p>Current stock in this batch: <strong>{editingItem.quantity}</strong></p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adjustment</label>
                            <input type="number" value={adjustment} onChange={e => setAdjustment(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                            <p className="text-sm text-gray-500">Use positive numbers to add stock, negative to remove.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Adjustment</label>
                            <input type="text" value={logReason} onChange={e => setLogReason(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="text-right">
                             <button onClick={handleAdjustStock} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                                Apply Adjustment
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

const ProductManagementPage: React.FC = () => {
    const { products, categories, actions } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [products, debouncedSearch]);
    
    const { sortedData, handleSort, renderSortArrow } = useSort(filteredProducts, 'name');
    
    const openModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const ProductForm: React.FC<{ product: Product | null, onSave: (product: Product) => void, onCancel: () => void }> = ({ product, onSave, onCancel }) => {
        const [formData, setFormData] = useState<Product>(product || { id: '', sku: '', name: '', price: 0, cost: 0, category: '', lowStockThreshold: 10 });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'cost' || name === 'lowStockThreshold' ? parseFloat(value) : value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const productToSave: Product = { ...formData, id: formData.id || `prod-${Date.now()}` };
            onSave(productToSave);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                           <option value="">Select a category</option>
                           {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost</label>
                        <input type="number" name="cost" value={formData.cost ?? ''} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
                        <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onCancel} className="bg-white dark:bg-gray-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">Save Product</button>
                </div>
            </form>
        )
    };
    
    const handleSave = async (product: Product) => {
        await actions.saveProduct(product);
        closeModal();
    };

    const handleDelete = async (productId: string) => {
        if (window.confirm("Are you sure you want to delete this product? This will also remove all associated inventory and cannot be undone.")) {
            await actions.deleteProduct(productId);
        }
    };
    
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Products</h1>
                <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                    Add Product
                </button>
            </div>
             <div className="mb-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search products..." />
            </div>
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('sku')}>SKU {renderSortArrow('sku')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('category')}>Category {renderSortArrow('category')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('price')}>Price {renderSortArrow('price')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('cost')}>Cost {renderSortArrow('cost')}</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {sortedData.map(product => (
                            <tr key={product.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">{product.sku}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">${product.cost?.toFixed(2) || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openModal(product)} className="text-primary hover:underline mr-4">{icons.edit}</button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">{icons.trash}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
                <ProductForm product={editingProduct} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
};

const UserManagementPage: React.FC = () => { /* ... Placeholder ... */ return <div className="p-8"><h1 className="text-2xl font-bold">User Management</h1></div>; };
const SuppliersManagementPage: React.FC = () => { /* ... Placeholder ... */ return <div className="p-8"><h1 className="text-2xl font-bold">Supplier Management</h1></div>; };
const CategoriesManagementPage: React.FC = () => { /* ... Placeholder ... */ return <div className="p-8"><h1 className="text-2xl font-bold">Category Management</h1></div>; };
const ReceiveStockPage: React.FC = () => {
    const { products, suppliers, actions, purchaseOrders, getters, currentUser } = useStore();
    const router = useRouter();
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [selectedPOId, setSelectedPOId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !quantity) return;
        
        const supplier = getters.getSupplierById(supplierId);

        await actions.receiveStock({
            productId: selectedProductId,
            quantity: parseInt(quantity),
            batchNumber,
            expiryDate: expiryDate || undefined,
            supplierId: supplierId || undefined,
            supplierName: supplier?.name,
            purchaseOrderId: selectedPOId || undefined,
        });

        await actions.addAuditLog({
            timestamp: new Date().toISOString(),
            userId: currentUser!.id,
            userName: currentUser!.name,
            productId: selectedProductId,
            productName: getters.getProductById(selectedProductId)?.name || 'N/A',
            quantityChange: parseInt(quantity),
            newTotalStock: getters.getTotalStock(selectedProductId) + parseInt(quantity),
            reason: `Stock received from ${supplier?.name || 'manual entry'}.`,
        });

        alert('Stock received successfully!');
        router.navigate('/inventory');
    };

    const handlePOSelect = (poId: string) => {
        setSelectedPOId(poId);
        if (poId) {
            const po = purchaseOrders.find(p => p.id === poId);
            if (po) {
                setSupplierId(po.supplierId);
            }
        } else {
            setSupplierId('');
            setSelectedProductId('');
        }
    };
    
    const openPOs = useMemo(() => {
        return purchaseOrders.filter(po => po.status === PurchaseOrderStatus.SUBMITTED || po.status === PurchaseOrderStatus.SHIPPED || po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED);
    }, [purchaseOrders]);
    
    const productsInSelectedPO = useMemo(() => {
        if (!selectedPOId) return products;
        const po = purchaseOrders.find(p => p.id === selectedPOId);
        if (!po) return [];
        const productIdsInPO = po.items.map(item => item.productId);
        return products.filter(p => productIdsInPO.includes(p.id));
    }, [selectedPOId, purchaseOrders, products]);
    
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Receive Stock</h1>
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Purchase Order (Optional)</label>
                        <select value={selectedPOId} onChange={e => handlePOSelect(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a PO</option>
                            {openPOs.map(po => <option key={po.id} value={po.id}>{po.poNumber} - {po.supplierName}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                        <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a product</option>
                            {productsInSelectedPO.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
                            <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (Optional)</label>
                            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} disabled={!!selectedPOId} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-800">
                                <option value="">Select a supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="pt-5">
                        <div className="flex justify-end">
                            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                                Add to Inventory
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
const PurchaseOrdersManagementPage: React.FC = () => {
    const { purchaseOrders } = useStore();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const filteredPOs = useMemo(() => {
        if (!debouncedSearch) return purchaseOrders;
        const lowercasedSearch = debouncedSearch.toLowerCase();
        return purchaseOrders.filter(po => 
            po.poNumber.toLowerCase().includes(lowercasedSearch) ||
            po.supplierName.toLowerCase().includes(lowercasedSearch) ||
            po.status.toLowerCase().includes(lowercasedSearch) ||
            po.items.some(item => 
                item.productName.toLowerCase().includes(lowercasedSearch) || 
                item.productSku.toLowerCase().includes(lowercasedSearch)
            )
        );
    }, [purchaseOrders, debouncedSearch]);
    
    const { sortedData, handleSort, renderSortArrow } = useSort(filteredPOs, 'createdAt', 'desc');

    const getStatusColor = (status: PurchaseOrderStatus) => {
        switch (status) {
            case PurchaseOrderStatus.PENDING: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case PurchaseOrderStatus.SUBMITTED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case PurchaseOrderStatus.SHIPPED: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case PurchaseOrderStatus.PARTIALLY_RECEIVED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case PurchaseOrderStatus.RECEIVED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case PurchaseOrderStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Purchase Orders</h1>
                <button onClick={() => router.navigate('/purchase-orders/new')} className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                    Create New PO
                </button>
            </div>
            <div className="mb-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by PO #, Supplier, Status, or Product..." />
            </div>
            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('poNumber')}>PO Number {renderSortArrow('poNumber')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('createdAt')}>Created At {renderSortArrow('createdAt')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('expectedDeliveryDate')}>Expected Delivery {renderSortArrow('expectedDeliveryDate')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('supplierName')}>Supplier {renderSortArrow('supplierName')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>Status {renderSortArrow('status')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('total')}>Total {renderSortArrow('total')}</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(po => (
                            <tr key={po.id} className="bg-white dark:bg-dark-card border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-primary hover:underline cursor-pointer" onClick={() => router.navigate(`/purchase-orders/${po.id}`)}>{po.poNumber}</td>
                                <td className="px-6 py-4">{new Date(po.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4">{po.supplierName}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusColor(po.status)}`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">${po.total.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => router.navigate(`/purchase-orders/${po.id}`)} className="text-primary hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
const PurchaseOrderFormPage: React.FC = () => {
    const { param: poId, navigate } = useRouter();
    const { suppliers, products, getters, actions } = useStore();
    const isNew = poId === 'new';
    
    const [poData, setPoData] = useState<Omit<PurchaseOrder, 'items'>>({
        id: '', poNumber: '', supplierId: '', supplierName: '', status: PurchaseOrderStatus.PENDING,
        createdAt: new Date().toISOString(), subtotal: 0, total: 0
    });
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const debouncedProductSearch = useDebounce(productSearch, 300);

    useEffect(() => {
        if (!isNew && poId) {
            const existingPO = getters.getPurchaseOrderById(poId);
            if (existingPO) {
                const { items, ...data } = existingPO;
                setPoData(data);
                setItems(items);
            }
        } else {
            const newPoNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
            setPoData(prev => ({ ...prev, poNumber: newPoNumber, id: `po-${Date.now()}` }));
        }
    }, [poId, isNew, getters]);

    useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + item.cost * item.quantityOrdered, 0);
        setPoData(prev => ({ ...prev, subtotal, total: subtotal }));
    }, [items]);
    
    const handleSupplierChange = (supplierId: string) => {
        const supplier = getters.getSupplierById(supplierId);
        setPoData(prev => ({...prev, supplierId, supplierName: supplier?.name || ''}));
    };

    const handleAddItem = (product: Product) => {
        if (!items.some(item => item.productId === product.id)) {
            setItems(prev => [...prev, {
                productId: product.id,
                productName: product.name,
                productSku: product.sku,
                quantityOrdered: 1,
                cost: product.cost || 0
            }]);
        }
        setProductSearch('');
    };

    const handleItemChange = (productId: string, field: 'quantityOrdered' | 'cost', value: number) => {
        setItems(prev => prev.map(item => item.productId === productId ? {...item, [field]: value} : item));
    };

    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSave = async (newStatus?: PurchaseOrderStatus) => {
        let statusToSave = newStatus || poData.status;
        let submittedAt;
        if (newStatus === PurchaseOrderStatus.SUBMITTED && poData.status === PurchaseOrderStatus.PENDING) {
            submittedAt = new Date().toISOString();
        }

        const finalPO: PurchaseOrder = {
            ...poData,
            items,
            status: statusToSave,
            ...(submittedAt && { submittedAt }),
        };
        await actions.savePurchaseOrder(finalPO);
        navigate('/purchase-orders');
    };

    const searchResults = useMemo(() => {
        if (!debouncedProductSearch) return [];
        return products.filter(p => p.name.toLowerCase().includes(debouncedProductSearch.toLowerCase()) || p.sku.toLowerCase().includes(debouncedProductSearch.toLowerCase())).slice(0, 5);
    }, [debouncedProductSearch, products]);
    
    const isEditable = poData.status === PurchaseOrderStatus.PENDING;

    return (
        <div className="p-4 md:p-6 lg:p-8">
             <button onClick={() => navigate('/purchase-orders')} className="flex items-center text-primary mb-4 hover:underline">
                {icons.arrowLeft}
                <span className="ml-2">Back to Purchase Orders</span>
            </button>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{isNew ? 'Create Purchase Order' : `Edit Purchase Order ${poData.poNumber}`}</h1>
            <div className="space-y-6">
                <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                        <select value={poData.supplierId} onChange={e => handleSupplierChange(e.target.value)} disabled={!isEditable} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800">
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Delivery Date</label>
                         <input type="date" value={poData.expectedDeliveryDate?.split('T')[0] || ''} onChange={e => setPoData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))} disabled={!isEditable} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800"/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                         <p className={`mt-1 text-sm font-semibold p-2 rounded-md ${isEditable ? 'text-gray-700 dark:text-gray-300' : 'bg-gray-100 dark:bg-gray-700'}`}>{poData.status}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Items</h2>
                    {isEditable && (
                        <div className="relative mb-4">
                            <SearchBar value={productSearch} onChange={setProductSearch} placeholder="Search to add products..."/>
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full bg-white dark:bg-dark-card shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                                    {searchResults.map(p => <div key={p.id} onClick={() => handleAddItem(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{p.name} ({p.sku})</div>)}
                                </div>
                            )}
                        </div>
                    )}
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                             <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="py-2">Product</th><th className="py-2">Quantity</th><th className="py-2">Cost/Item</th><th className="py-2">Total</th><th className="py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.productId} className="border-t dark:border-gray-700">
                                        <td className="py-2">{item.productName}</td>
                                        <td><input type="number" value={item.quantityOrdered} onChange={e => handleItemChange(item.productId, 'quantityOrdered', parseInt(e.target.value))} min="1" disabled={!isEditable} className="w-20 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"/></td>
                                        <td><input type="number" value={item.cost} onChange={e => handleItemChange(item.productId, 'cost', parseFloat(e.target.value))} min="0" step="0.01" disabled={!isEditable} className="w-24 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-800 dark:border-gray-600"/></td>
                                        <td>${(item.quantityOrdered * item.cost).toFixed(2)}</td>
                                        <td>{isEditable && <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500">{icons.trash}</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                        <textarea value={poData.notes || ''} onChange={e => setPoData(prev => ({ ...prev, notes: e.target.value }))} rows={4} disabled={!isEditable} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div className="text-right space-y-2">
                        <p className="text-lg">Subtotal: <span className="font-semibold">${poData.subtotal.toFixed(2)}</span></p>
                        <p className="text-xl font-bold">Total: <span className="text-primary">${poData.total.toFixed(2)}</span></p>
                    </div>
                </div>
                
                {isEditable && (
                    <div className="flex justify-end space-x-4">
                        <button onClick={() => handleSave()} className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700">Save Draft</button>
                        <button onClick={() => handleSave(PurchaseOrderStatus.SUBMITTED)} className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90">Submit Order</button>
                    </div>
                )}
            </div>
        </div>
    );
};
const RefundPage: React.FC = () => {
    const { param: saleId, navigate } = useRouter();
    const { getters, actions, currentUser, refunds } = useStore();
    const [sale, setSale] = useState<Sale | null>(null);
    const [refundItems, setRefundItems] = useState<Map<string, number>>(new Map());
    const [reason, setReason] = useState('');
    const [returnToStock, setReturnToStock] = useState(true);

    useEffect(() => {
        if (saleId) {
            const saleData = getters.getSaleById(saleId);
            setSale(saleData || null);
        }
    }, [saleId, getters]);

    const alreadyRefundedQuantities = useMemo(() => {
        const quantities = new Map<string, number>();
        if (!sale || !sale.refundIds) return quantities;
        
        const saleRefunds = refunds.filter(r => sale.refundIds!.includes(r.id));
        saleRefunds.forEach(refund => {
            refund.items.forEach(item => {
                quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
            });
        });
        return quantities;
    }, [sale, refunds]);

    const handleQuantityChange = (productId: string, quantity: number, maxQuantity: number) => {
        const newQuantities = new Map(refundItems);
        if (quantity > 0 && quantity <= maxQuantity) {
            newQuantities.set(productId, quantity);
        } else if (quantity <= 0) {
            newQuantities.delete(productId);
        } else {
             newQuantities.set(productId, maxQuantity);
        }
        setRefundItems(newQuantities);
    };

    const { totalRefundAmount, totalRefundCost } = useMemo(() => {
        let amount = 0;
        let cost = 0;
        if (!sale) return { totalRefundAmount: 0, totalRefundCost: 0 };

        refundItems.forEach((quantity, productId) => {
            const originalItem = sale.items.find(i => i.id === productId);
            if (originalItem) {
                amount += originalItem.price * quantity;
                cost += (originalItem.cost || 0) * quantity;
            }
        });
        return { totalRefundAmount: amount, totalRefundCost: cost };
    }, [refundItems, sale]);

    const handleSubmitRefund = async () => {
        if (!sale || refundItems.size === 0 || !reason) {
            alert('Please select items to refund and provide a reason.');
            return;
        }

        const itemsToRefund: CartItem[] = [];
        refundItems.forEach((quantity, productId) => {
            const originalItem = sale.items.find(i => i.id === productId);
            if (originalItem) {
                itemsToRefund.push({ ...originalItem, quantity });
            }
        });

        const refundData: Omit<Refund, 'id'> = {
            originalSaleId: sale.id,
            items: itemsToRefund,
            totalRefundAmount,
            totalRefundCost,
            reason,
            returnedToStock: returnToStock,
            timestamp: new Date().toISOString(),
            processedById: currentUser!.id,
            processedByName: currentUser!.name,
        };
        
        await actions.addRefund(refundData);
        alert('Refund processed successfully!');
        navigate('/sales');
    };

    if (!sale) return <div className="p-8">Sale not found.</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
             <button onClick={() => navigate('/sales')} className="flex items-center text-primary mb-4 hover:underline">
                {icons.arrowLeft}
                <span className="ml-2">Back to Sales History</span>
            </button>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Process Refund</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">For Sale ID: {sale.id}</p>

            <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-8">
                 <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Select items to refund</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                                <th className="text-center py-2 font-semibold text-gray-600 dark:text-gray-300">Original Qty</th>
                                <th className="text-center py-2 font-semibold text-gray-600 dark:text-gray-300">Refundable Qty</th>
                                <th className="text-center py-2 font-semibold text-gray-600 dark:text-gray-300">Refund Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map(item => {
                                const alreadyRefunded = alreadyRefundedQuantities.get(item.id) || 0;
                                const maxRefundable = item.quantity - alreadyRefunded;
                                if (maxRefundable <= 0) return null;

                                return (
                                    <tr key={item.id}>
                                        <td className="py-3">{item.name}</td>
                                        <td className="py-3 text-center">{item.quantity}</td>
                                        <td className="py-3 text-center">{maxRefundable}</td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxRefundable}
                                                value={refundItems.get(item.id) || ''}
                                                onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 0, maxRefundable)}
                                                className="w-20 text-center mx-auto block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Refund</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="mt-4 flex items-center">
                    <input id="returnToStock" type="checkbox" checked={returnToStock} onChange={e => setReturnToStock(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="returnToStock" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Return items to sellable stock</label>
                </div>
                
                <div className="border-t dark:border-gray-700 mt-8 pt-4 text-right">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">Total Refund: ${totalRefundAmount.toFixed(2)}</p>
                    <button onClick={handleSubmitRefund} className="mt-4 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                        Process Refund
                    </button>
                </div>
            </div>
        </div>
    );
};
const SettingsPage: React.FC = () => { /* ... Placeholder ... */ return <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>; };

// --- MAIN APP COMPONENT --- //
const App: React.FC = () => {
    const { currentUser } = useStore();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    if (!currentUser) {
        return <LoginPage />;
    }
    
    const renderPage = () => {
        const { page, param } = router;

        switch(page) {
            case 'dashboard':
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <DashboardPage />
                    </ProtectedRoute>
                );
            case 'pos':
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.CASHIER]}>
                        <POSPage />
                    </ProtectedRoute>
                );
            case 'sales':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <SalesHistoryPage />
                    </ProtectedRoute>
                );
             case 'refund':
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <RefundPage />
                    </ProtectedRoute>
                );
            case 'inventory':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <InventoryManagementPage />
                    </ProtectedRoute>
                );
            case 'products':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <ProductManagementPage />
                    </ProtectedRoute>
                );
             case 'receive-stock':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <ReceiveStockPage />
                    </ProtectedRoute>
                );
            case 'users':
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <UserManagementPage />
                    </ProtectedRoute>
                );
            case 'suppliers':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <SuppliersManagementPage />
                    </ProtectedRoute>
                );
             case 'categories':
                 return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <CategoriesManagementPage />
                    </ProtectedRoute>
                );
            case 'purchase-orders':
                return (
                     <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        {param ? <PurchaseOrderFormPage /> : <PurchaseOrdersManagementPage />}
                    </ProtectedRoute>
                );
            case 'settings':
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <SettingsPage />
                    </ProtectedRoute>
                );
            default:
                router.navigate('/dashboard');
                return (
                    <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.STOCK_MANAGER]}>
                        <DashboardPage />
                    </ProtectedRoute>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg">
            <Sidebar isOpen={isSidebarOpen} onLinkClick={closeSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={handleToggleSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

const Root: React.FC = () => {
    return (
        <StoreProvider>
            <App />
        </StoreProvider>
    );
};

export default Root;