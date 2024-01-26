import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PathProvider } from './state/PathContext';
import { ModalProvider } from './state/ModalContext';
import { AuthProvider } from './state/AuthContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <PathProvider>
        <AuthProvider>
            <ModalProvider>
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            </ModalProvider>
        </AuthProvider>
    </PathProvider>
)