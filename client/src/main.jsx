import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Stats from './pages/Stats';
import Schedule from './pages/Schedule';
import Standings from './pages/Standings';
import History from './pages/History';
import Admin from './pages/Admin';
import LiveGame from './pages/LiveGame';
import BoxScoreEditor from './pages/BoxScoreEditor';
import './styles.css';

function App(){
    return (
        <BrowserRouter>
            <header>
                <h1>Flag Football League</h1>
                <nav>
                    <Link to='/'>Teams</Link>
                    <Link to='/players'>Players</Link>
                    <Link to='/stats'>Stats</Link>
                    <Link to='/schedule'>Schedule</Link>
                    <Link to='/standings'>Standings</Link>
                    <Link to='/history'>History</Link>
                    <Link to='/live'>Live</Link>
                    <Link to='/admin'>Admin</Link>
                </nav>
            </header>
            <main>
                <Routes>
                    <Route path='/' element={<Teams/>} />
                    <Route path='/players' element={<Players/>} />
                    <Route path='/stats' element={<Stats/>} />
                    <Route path='/schedule' element={<Schedule/>} />
                    <Route path='/standings' element={<Standings/>} />
                    <Route path='/history' element={<History/>} />
                    <Route path='/admin' element={<Admin/>} />
                    <Route path='/live' element={<div><h2>Live Games</h2><p>Choose a game from the schedule and click 'Open Live' in the schedule page.</p></div>} />
                    <Route path='/live/:gameId' element={<LiveGame/>} />
                    <Route path='/box/:gameId' element={<BoxScoreEditor/>} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')).render(<App />);
