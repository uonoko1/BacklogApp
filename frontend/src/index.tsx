import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PathProvider } from './state/PathContext';
import { ModalProvider } from './state/ModalContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <PathProvider>
        <ModalProvider>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </ModalProvider>
    </PathProvider>
)