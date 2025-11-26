const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'league.db'));

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

app.use(cors());
app.use(bodyParser.json());

// --- Authentication (simple admin)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const row = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username);
    if(!row) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = bcrypt.compareSync(password, row.password_hash);
    if(!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
});

function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({ error: 'Missing auth' });
    const parts = auth.split(' ');
    if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed auth' });
    try {
        const payload = jwt.verify(parts[1], JWT_SECRET);
        req.user = payload;
        next();
    } catch(e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// --- Teams
app.get('/api/teams', (req, res) => {
    const teams = db.prepare('SELECT * FROM teams ORDER BY name').all();
    res.json(teams);
});

app.get('/api/teams/:id', (req, res) => {
    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
    if(!team) return res.status(404).json({ error: 'Not found' });
    const players = db.prepare('SELECT * FROM players WHERE team_id = ? ORDER BY number').all(req.params.id);
    team.players = players;
    res.json(team);
});

app.post('/api/teams', requireAuth, (req, res) => {
    const { name, color } = req.body;
    const info = db.prepare('INSERT INTO teams (name, color) VALUES (?, ?)').run(name, color);
    res.json({ id: info.lastInsertRowid });
});

// --- Players
app.get('/api/players', (req, res) => {
    const players = db.prepare('SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id ORDER BY p.last_name').all();
    res.json(players);
});

app.get('/api/players/:id', (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
    if(!player) return res.status(404).json({ error: 'Not found' });
    res.json(player);
});

app.post('/api/players', requireAuth, (req, res) => {
    const { first_name, last_name, number, team_id } = req.body;
    const info = db.prepare('INSERT INTO players (first_name,last_name,number,team_id) VALUES (?,?,?,?)').run(first_name,last_name,number,team_id||null);
    res.json({ id: info.lastInsertRowid });
});

// --- Games / Schedule
app.get('/api/games', (req, res) => {
    const games = db.prepare('SELECT g.*, t1.name as home_name, t2.name as away_name FROM games g LEFT JOIN teams t1 ON g.home_team = t1.id LEFT JOIN teams t2 ON g.away_team = t2.id ORDER BY date').all();
    res.json(games);
});

app.get('/api/games/:id', (req, res) => {
    const g = db.prepare('SELECT g.*, t1.name as home_name, t2.name as away_name FROM games g LEFT JOIN teams t1 ON g.home_team = t1.id LEFT JOIN teams t2 ON g.away_team = t2.id WHERE g.id = ?').get(req.params.id);
    if(!g) return res.status(404).json({ error: 'Not found' });
    res.json(g);
});

app.post('/api/games', requireAuth, (req, res) => {
    const { date, home_team, away_team, home_score, away_score } = req.body;
    const info = db.prepare('INSERT INTO games (date,home_team,away_team,home_score,away_score) VALUES (?,?,?,?,?)').run(date,home_team,away_team,home_score||null,away_score||null);
    res.json({ id: info.lastInsertRowid });
});

// --- Live Game Events (API)
app.get('/api/games/:id/events', (req,res)=>{
    const rows = db.prepare('SELECT ge.*, p.first_name, p.last_name FROM game_events ge LEFT JOIN players p ON ge.player_id = p.id WHERE game_id=? ORDER BY timestamp ASC').all(req.params.id);
    res.json(rows);
});

app.post('/api/games/:id/events', requireAuth, (req,res)=>{
    const { type, player_id, description } = req.body;
    const info = db.prepare('INSERT INTO game_events (game_id,type,player_id,description,timestamp) VALUES (?,?,?,?,strftime("%s","now"))')
      .run(req.params.id,type,player_id||null,description||'');
    res.json({ id: info.lastInsertRowid });
});

// --- Box Score Editor
app.get('/api/games/:id/box', (req,res)=>{
    const rows = db.prepare('SELECT bs.*, p.first_name, p.last_name FROM box_scores bs LEFT JOIN players p ON bs.player_id = p.id WHERE game_id=? ORDER BY p.last_name').all(req.params.id);
    res.json(rows);
});

app.post('/api/games/:id/box', requireAuth, (req,res)=>{
    const { player_id, stat_key, stat_value } = req.body;
    const exist = db.prepare('SELECT * FROM box_scores WHERE game_id=? AND player_id=? AND stat_key=?')
      .get(req.params.id,player_id,stat_key);
    if(exist){
        db.prepare('UPDATE box_scores SET stat_value=? WHERE id=?').run(stat_value,exist.id);
    } else {
        db.prepare('INSERT INTO box_scores (game_id,player_id,stat_key,stat_value) VALUES (?,?,?,?)')
          .run(req.params.id,player_id,stat_key,stat_value);
    }
    res.json({ ok:true });
});

// --- Simple stats endpoints (aggregate)
app.get('/api/stats/team/:id', (req, res) => {
    const id = req.params.id;
    const games = db.prepare('SELECT * FROM games WHERE home_team = ? OR away_team = ?').all(id, id);
    let wins=0, losses=0, ties=0, points_for=0, points_against=0;
    games.forEach(g=>{
        if(g.home_score==null || g.away_score==null) return;
        let isHome = (g.home_team === Number(id));
        let teamScore = isHome ? g.home_score : g.away_score;
        let oppScore = isHome ? g.away_score : g.home_score;
        points_for += teamScore;
        points_against += oppScore;
        if(teamScore>oppScore) wins++;
        else if(teamScore<oppScore) losses++;
        else ties++;
    });
    res.json({ wins, losses, ties, points_for, points_against, games: games.length });
});

app.get('/api/standings', (req, res) => {
    const teams = db.prepare('SELECT * FROM teams').all();
    const result = teams.map(t=>{
        const s = require('./utils/standings_calc')(db, t.id);
        return Object.assign({}, t, s);
    }).sort((a,b)=> (b.wins - a.wins) || (b.points_for - a.points_for));
    res.json(result);
});

// --- History
app.get('/api/history', (req, res) => {
    const rows = db.prepare('SELECT * FROM history ORDER BY season DESC').all();
    res.json(rows);
});

// --- Admin tools
app.get('/api/admin/overview', requireAuth, (req, res) => {
    const counts = {
        teams: db.prepare('SELECT COUNT(*) as c FROM teams').get().c,
        players: db.prepare('SELECT COUNT(*) as c FROM players').get().c,
        games: db.prepare('SELECT COUNT(*) as c FROM games').get().c
    };
    res.json({ counts });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
