module.exports = function(db, teamId){
    const games = db.prepare('SELECT * FROM games WHERE home_team = ? OR away_team = ?').all(teamId, teamId);
    let wins=0, losses=0, ties=0, points_for=0, points_against=0, played=0;
    games.forEach(g=>{
        if(g.home_score==null || g.away_score==null) return;
        played++;
        const isHome = (g.home_team === teamId);
        const teamScore = isHome ? g.home_score : g.away_score;
        const oppScore = isHome ? g.away_score : g.home_score;
        points_for += teamScore;
        points_against += oppScore;
        if(teamScore>oppScore) wins++;
        else if(teamScore<oppScore) losses++;
        else ties++;
    });
    return { wins, losses, ties, points_for, points_against, played };
};
