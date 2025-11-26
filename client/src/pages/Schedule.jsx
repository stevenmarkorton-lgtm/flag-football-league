import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
export default function Schedule(){
    const [games, setGames] = useState([]);
    const navigate = useNavigate();
    useEffect(()=>{ fetch('/api/games').then(r=>r.json()).then(setGames); },[]);
    return (
        <div>
            <h2>Schedule</h2>
            {games.map(g=>(
                <div className='card' key={g.id}>
                    <div><strong>{g.date}</strong></div>
                    <div>{g.home_name} {g.home_score != null ? g.home_score : '-'}  vs  {g.away_name} {g.away_score != null ? g.away_score : '-'}</div>
                    <div style={{marginTop:8}}>
                        <button className='btn' onClick={()=>navigate('/live/'+g.id)}>Open Live</button>
                        <button className='btn' style={{marginLeft:8}} onClick={()=>navigate('/box/'+g.id)}>Open Box Score</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
