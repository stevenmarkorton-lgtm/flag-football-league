import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

export default function LiveGame(){
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [events, setEvents] = useState([]);
    const [players, setPlayers] = useState([]);
    const [type, setType] = useState('TD');
    const [playerId, setPlayerId] = useState('');
    const [desc, setDesc] = useState('');

    async function load(){
        const [g, evs, pls] = await Promise.all([fetch('/api/games/'+gameId).then(r=>r.json()), fetch('/api/games/'+gameId+'/events').then(r=>r.json()), fetch('/api/players').then(r=>r.json())]);
        setGame(g);
        setEvents(evs);
        setPlayers(pls);
    }

    useEffect(()=>{
        load();
        const iv = setInterval(()=>{ fetch('/api/games/'+gameId+'/events').then(r=>r.json()).then(setEvents); },5000);
        return ()=>clearInterval(iv);
    },[gameId]);

    async function addEvent(e){
        e.preventDefault();
        const token = window.localStorage.getItem('ff_token') || '';
        const res = await fetch('/api/games/'+gameId+'/events',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({type,player_id:playerId||null,description:desc})});
        if(res.ok){ setDesc(''); setPlayerId(''); setType('TD'); load(); }
        else { alert('Failed to add event (ensure you are logged in as admin in /admin and token stored in localStorage as ff_token).'); }
    }

    return (
        <div>
            <h2>Live — {game ? (game.home_name+' vs '+game.away_name+' on '+game.date) : 'Loading...'}</h2>
            <div className='card'>
                <h3>Events</h3>
                {events.length===0 && <div>No events yet.</div>}
                <ul>
                    {events.map(ev=>(<li key={ev.id}>{new Date(ev.timestamp*1000).toLocaleTimeString()} — <strong>{ev.type}</strong> {ev.first_name ? `${ev.first_name} ${ev.last_name}` : ''} {ev.description ? ` — ${ev.description}` : ''}</li>))}
                </ul>
            </div>

            <form onSubmit={addEvent} className='card'>
                <h3>Add Event</h3>
                <div className='form-row'>
                    <label>Type
                        <select value={type} onChange={e=>setType(e.target.value)}>
                            <option>TD</option><option>XP</option><option>INT</option><option>SACK</option><option>FUMBLE</option><option>2PT</option><option>Other</option>
                        </select>
                    </label>
                </div>
                <div className='form-row'>
                    <label>Player (optional)
                        <select value={playerId} onChange={e=>setPlayerId(e.target.value)}>
                            <option value=''>-- none --</option>
                            {players.map(p=>(<option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.team_name||'FA'})</option>))}
                        </select>
                    </label>
                </div>
                <div className='form-row'>
                    <label>Description <input value={desc} onChange={e=>setDesc(e.target.value)} /></label>
                </div>
                <button className='btn'>Add Event</button>
            </form>
        </div>
    );
}
