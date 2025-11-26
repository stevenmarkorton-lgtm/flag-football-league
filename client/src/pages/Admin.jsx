import React, {useState} from 'react';
export default function Admin(){
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password');
    async function login(e){
        e.preventDefault();
        const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
        if(res.ok){
            const j = await res.json();
            setToken(j.token);
            alert('Logged in (token stored in memory).');
        } else {
            alert('Login failed');
        }
    }
    return (
        <div>
            <h2>Admin</h2>
            <form onSubmit={login}>
                <div className='form-row'><label>Username <input value={username} onChange={e=>setUsername(e.target.value)}/></label></div>
                <div className='form-row'><label>Password <input value={password} onChange={e=>setPassword(e.target.value)} type='password' /></label></div>
                <button className='btn'>Login</button>
            </form>
            <p>Admin features available when logged in via API token. This is a starter admin UI — you can expand to add create/update/delete forms.</p>
        </div>
    );
}
