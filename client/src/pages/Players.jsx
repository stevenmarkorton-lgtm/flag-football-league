import React, {useEffect, useState} from 'react';
export default function Players(){
    const [players, setPlayers] = useState([]);
    useEffect(()=>{ fetch('/api/players').then(r=>r.json()).then(setPlayers); },[]);
    return (
        <div>
            <h2>Players</h2>
            {players.map(p=>(
                <div className='card' key={p.id}>
                    #{p.number} - {p.first_name} {p.last_name} <em>{p.team_name || 'Free Agent'}</em>
                </div>
            ))}
        </div>
    );
}
