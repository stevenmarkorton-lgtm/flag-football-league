import React, {useEffect, useState} from 'react';
export default function Standings(){
    const [standings, setStandings] = useState([]);
    useEffect(()=>{ fetch('/api/standings').then(r=>r.json()).then(setStandings); },[]);
    return (
        <div>
            <h2>Standings</h2>
            <table style={{width:'100%'}}><thead><tr><th>Team</th><th>W</th><th>L</th><th>T</th><th>PF</th><th>PA</th></tr></thead>
            <tbody>
                {standings.map(s=>(
                    <tr key={s.id}><td>{s.name}</td><td>{s.wins||0}</td><td>{s.losses||0}</td><td>{s.ties||0}</td><td>{s.points_for||0}</td><td>{s.points_against||0}</td></tr>
                ))}
            </tbody></table>
        </div>
    );
}
