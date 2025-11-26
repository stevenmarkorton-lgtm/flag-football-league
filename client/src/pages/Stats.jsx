import React, {useEffect, useState} from 'react';
export default function Stats(){
    const [teams, setTeams] = useState([]);
    useEffect(()=>{ fetch('/api/teams').then(r=>r.json()).then(setTeams); },[]);
    return (
        <div>
            <h2>Stats</h2>
            <p>Click a team to view aggregate stats (team page in future).</p>
            {teams.map(t=>(
                <div className='card' key={t.id}>
                    <a href={'/teams/'+t.id}>{t.name}</a>
                </div>
            ))}
        </div>
    );
}
