import React, {useEffect, useState} from 'react';
export default function Teams(){
    const [teams, setTeams] = useState([]);
    useEffect(()=>{ fetch('/api/teams').then(r=>r.json()).then(setTeams); },[]);
    return (
        <div>
            <h2>Teams</h2>
            <div className='grid'>
            {teams.map(t=>(
                <div className='card' key={t.id}>
                    <strong>{t.name}</strong>
                    <div>Color: <span style={{display:'inline-block', width:12, height:12, background:t.color, border:'1px solid #ccc'}}></span> {t.color}</div>
                </div>
            ))}
            </div>
        </div>
    );
}
