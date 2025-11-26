import React, {useEffect, useState} from 'react';
export default function History(){
    const [history, setHistory] = useState([]);
    useEffect(()=>{ fetch('/api/history').then(r=>r.json()).then(setHistory); },[]);
    return (
        <div>
            <h2>League History</h2>
            {history.map(h=>(
                <div className='card' key={h.id}>
                    Season {h.season} — Champion Team ID: {h.champion_team_id} <div>{h.notes}</div>
                </div>
            ))}
        </div>
    );
}
