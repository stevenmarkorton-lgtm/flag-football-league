const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = new Database(path.join(__dirname, 'league.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT);
CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT, color TEXT);
CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, number INTEGER, team_id INTEGER, FOREIGN KEY(team_id) REFERENCES teams(id));
CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY, date TEXT, home_team INTEGER, away_team INTEGER, home_score INTEGER, away_score INTEGER);
CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, season INTEGER, champion_team_id INTEGER, notes TEXT);

CREATE TABLE IF NOT EXISTS game_events (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    type TEXT,
    player_id INTEGER,
    description TEXT,
    timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS box_scores (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    player_id INTEGER,
    stat_key TEXT,
    stat_value INTEGER
);
`);

const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if(!admin){
    const hash = bcrypt.hashSync('password', 10);
    db.prepare('INSERT INTO admins (username,password_hash) VALUES (?,?)').run('admin', hash);
    console.log('Created default admin: admin / password');
}

// seed some teams
const tcount = db.prepare('SELECT COUNT(*) as c FROM teams').get().c;
if(tcount === 0){
    const teams = [
        ['Red Raptors','#c0392b'],
        ['Blue Blazers','#2980b9'],
        ['Green Giants','#27ae60'],
        ['Yellow Hornets','#f1c40f']
    ];
    const ins = db.prepare('INSERT INTO teams (name,color) VALUES (?,?)');
    teams.forEach(t=>ins.run(t[0], t[1]));
    console.log('Seeded teams');
}

const pcount = db.prepare('SELECT COUNT(*) as c FROM players').get().c;
if(pcount === 0){
    const players = [
        ['John','Doe',7,1],
        ['Sam','Smith',12,1],
        ['Alex','Johnson',3,2],
        ['Chris','Lee',5,2],
        ['Pat','Brown',9,3]
    ];
    const ins = db.prepare('INSERT INTO players (first_name,last_name,number,team_id) VALUES (?,?,?,?)');
    players.forEach(p=>ins.run(p[0],p[1],p[2],p[3]));
    console.log('Seeded players');
}

const gcount = db.prepare('SELECT COUNT(*) as c FROM games').get().c;
if(gcount === 0){
    const games = [
        ['2025-09-01','1','2',21,14],
        ['2025-09-08','3','4',7,7],
        ['2025-09-15','2','3',10,17]
    ];
    const ins = db.prepare('INSERT INTO games (date,home_team,away_team,home_score,away_score) VALUES (?,?,?,?,?)');
    games.forEach(g=>ins.run(g[0],g[1],g[2],g[3],g[4]));
    console.log('Seeded games');
}

const hcount = db.prepare('SELECT COUNT(*) as c FROM history').get().c;
if(hcount === 0){
    db.prepare('INSERT INTO history (season,champion_team_id,notes) VALUES (?,?,?)').run(2024,1,'Inaugural season');
    console.log('Seeded history');
}

console.log('DB initialization complete.');
