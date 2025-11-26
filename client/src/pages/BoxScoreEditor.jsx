import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

export default function BoxScoreEditor(){
    const { gameId } = useParams();
    const [players, setPlayers] = useState([]);
    const [box, setBox] = useState([]);
    const [statKey, setStatKey] = useState('TD');

    async function load(){
        const [pls, bx] = await Promise.all([fetch('/api/players').then(r=>r.json()), fetch('/api/games/'+gameId+'/box').then(r=>r.json())]);
        setPlayers(pls);
        setBox(bx);
    }

    useEffect(()=>{ load(); },[gameId]);

    function getStat(playerId, key){
        const row = box.find(b=>b.player_id===playerId && b.stat_key===key);
        return row ? row.stat_value : 0;
    }

    async function saveStat(playerId, key, value){
        const token = window.localStorage.getItem('ff_token') || '';
        const res = await fetch('/api/games/'+gameId+'/box',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({player_id:playerId, stat_key:key, stat_value:Number(value)})});
        if(res.ok) load();
        else alert('Save failed. Make sure you are logged in as admin and token stored in localStorage as ff_token.');
    }

    return (
        <div>
            <h2>Box Score Editor — Game {gameId}</h2>
            <div className='card'>
                <h3>Stat Key</h3>
                <select value={statKey} onChange={e=>setStatKey(e.target.value)}>
                    <option>TD</option><option>Yds</option><option>Int</option><option>Sacks</option><option>Fumbles</option><option>Tackles</option>
                </select>
            </div>
            <div className='card'>
                <h3>Players</h3>
                <table style={{width:'100%'}}>
                    <thead><tr><th>Player</th><th>Team</th><th>{statKey}</th><th>Actions</th></tr></thead>
                    <tbody>
                        {players.map(p=>{
                            const val = getStat(p.id, statKey);
                            return (
                                <tr key={p.id}>
                                    <td>{p.first_name} {p.last_name}</td>
                                    <td>{p.team_name||'FA'}</td>
                                    <td><input type='number' defaultValue={val} id={'s_'+p.id} /></td>
                                    <td><button className='btn' onClick={()=>{ const v = document.getElementById('s_'+p.id).value; saveStat(p.id, statKey, v); }}>Save</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div style={{marginTop:12}}>
                <button className='btn' onClick={()=>{ window.location.href = '/schedule'; }}>Back to Schedule</button>
            </div>
        </div>
    );
}
