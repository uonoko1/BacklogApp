import React from 'react';
import './App.css';
import axios from 'axios';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import "./utils/interceptors.ts";

function Content() {
    return (
        <Routes>
            <Route path='/*' element={<Home />} />
        </Routes>
    )
}

function App() {
    axios.defaults.withCredentials = true;
    return (
        <Router>
            <Content />
        </Router>
    );
}

export default App;
