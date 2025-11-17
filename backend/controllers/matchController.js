const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');

// Helper function to calculate overs from balls
const calculateOvers = (balls) => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return { overs, balls: remainingBalls, totalBalls: balls };
};

// Helper function to calculate run rate
const calculateRunRate = (runs, balls) => {
  if (balls === 0) return 0;
  return ((runs / balls) * 6).toFixed(2);
};

// Create match with lineup
exports.createMatch = async (req, res) => {
  try {
    const { teamA, teamB, totalOvers, battingFirst } = req.body;

    if (!teamA || !teamB || !totalOvers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Default to teamA if battingFirst is not specified
    const battingFirstTeam = battingFirst || 'teamA';

    // Create teams
    const teamADoc = await Team.create({
      name: teamA.name,
      players: teamA.players
    });

    const teamBDoc = await Team.create({
      name: teamB.name,
      players: teamB.players
    });

    // Initialize first innings
    const battingTeam = battingFirstTeam === 'teamA' ? teamADoc : teamBDoc;
    const bowlingTeam = battingFirstTeam === 'teamA' ? teamBDoc : teamADoc;

    const battingCard = battingTeam.players.map((playerId) => ({
      player: playerId,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false
    }));

    // Create bowling card for all players in bowling team (they can all potentially bowl)
    const bowlingCard = bowlingTeam.players.map(playerId => ({
      player: playerId,
      overs: 0,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      noBalls: 0,
      wides: 0
    }));

    const firstInnings = {
      team: battingTeam._id,
      totalRuns: 0,
      wickets: 0,
      totalOvers: totalOvers,
      balls: [],
      battingCard: battingCard,
      bowlingCard: bowlingCard,
      striker: battingTeam.players[0],
      nonStriker: battingTeam.players[1],
      extras: 0,
      isCompleted: false
    };

    const match = await Match.create({
      teamA: teamADoc._id,
      teamB: teamBDoc._id,
      totalOvers: totalOvers,
      battingFirst: battingFirstTeam,
      firstInnings: firstInnings,
      currentInnings: 1,
      status: 'pending'
    });

    const populatedMatch = await Match.findById(match._id)
      .populate({
        path: 'teamA',
        populate: { path: 'players' }
      })
      .populate({
        path: 'teamB',
        populate: { path: 'players' }
      })
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player');

    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Error creating match', error: error.message });
  }
};

// Start match
exports.startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'teamA',
        populate: { path: 'players' }
      })
      .populate({
        path: 'teamB',
        populate: { path: 'players' }
      })
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.status = 'live';
    await match.save();

    // Re-populate after save to ensure all data is fresh
    const updatedMatch = await Match.findById(match._id)
      .populate({
        path: 'teamA',
        populate: { path: 'players' }
      })
      .populate({
        path: 'teamB',
        populate: { path: 'players' }
      })
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player');

    res.json(updatedMatch);
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({ message: 'Error starting match', error: error.message });
  }
};

// Get active match
exports.getActiveMatch = async (req, res) => {
  try {
    const match = await Match.findOne({ status: 'live' })
      .populate({
        path: 'teamA',
        populate: { path: 'players' }
      })
      .populate({
        path: 'teamB',
        populate: { path: 'players' }
      })
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player')
      .populate('secondInnings.team')
      .populate('secondInnings.striker')
      .populate('secondInnings.nonStriker')
      .populate('secondInnings.battingCard.player')
      .populate('secondInnings.bowlingCard.player');

    if (!match) {
      return res.status(404).json({ message: 'No active match found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Get active match error:', error);
    res.status(500).json({ message: 'Error fetching active match', error: error.message });
  }
};

// Get match by ID
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA')
      .populate('teamB')
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player')
      .populate('secondInnings.team')
      .populate('secondInnings.striker')
      .populate('secondInnings.nonStriker')
      .populate('secondInnings.battingCard.player')
      .populate('secondInnings.bowlingCard.player');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Error fetching match', error: error.message });
  }
};

// Record a ball
exports.recordBall = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const { runs, ballType, isFreeHit, isWicket, dismissalType, bowler, fielder } = req.body;

    const currentInnings = match.currentInnings === 1 ? match.firstInnings : match.secondInnings;
    const totalBalls = currentInnings.balls.length;
    const { overs, balls: remainingBalls } = calculateOvers(totalBalls);

    // Check if innings is complete
    if (currentInnings.isCompleted) {
      return res.status(400).json({ message: 'Innings already completed' });
    }

    // Check if overs limit reached
    if (overs >= currentInnings.totalOvers && remainingBalls >= 6) {
      return res.status(400).json({ message: 'Overs limit reached' });
    }

    // Handle no-ball and wide
    let actualRuns = runs || 0;
    let isExtra = false;

    if (ballType === 'no-ball') {
      currentInnings.extras += 1;
      currentInnings.totalRuns += 1;
      isExtra = true;
      // Update bowler stats
      const bowlerCard = currentInnings.bowlingCard.find(b => b.player.toString() === bowler);
      if (bowlerCard) {
        bowlerCard.noBalls += 1;
        bowlerCard.runs += 1;
      }
    } else if (ballType === 'wide') {
      currentInnings.extras += (actualRuns + 1);
      currentInnings.totalRuns += (actualRuns + 1);
      isExtra = true;
      // Update bowler stats
      const bowlerCard = currentInnings.bowlingCard.find(b => b.player.toString() === bowler);
      if (bowlerCard) {
        bowlerCard.wides += 1;
        bowlerCard.runs += (actualRuns + 1);
      }
    } else if (ballType === 'dead-ball') {
      // Dead ball - no runs, no ball counted
      const ball = {
        ballNumber: totalBalls + 1,
        runs: 0,
        ballType: 'dead-ball',
        isFreeHit: false,
        isWicket: false,
        batsman: currentInnings.striker,
        bowler: bowler
      };
      currentInnings.balls.push(ball);
      await match.save();
      return res.json(match);
    }

    // Handle wicket
    if (isWicket && !isFreeHit) {
      const strikerCard = currentInnings.battingCard.find(b => b.player.toString() === currentInnings.striker.toString() && !b.isOut);
      
      if (strikerCard) {
        strikerCard.isOut = true;
        strikerCard.dismissalType = dismissalType;
        strikerCard.dismissedBy = bowler;
        if (['catch', 'stump-out', 'run-out'].includes(dismissalType)) {
          strikerCard.fielder = fielder;
        }
      }

      currentInnings.wickets += 1;
      
      // Update bowler stats
      const bowlerCard = currentInnings.bowlingCard.find(b => b.player.toString() === bowler);
      if (bowlerCard) {
        bowlerCard.wickets += 1;
      }

      // Find next batsman
      const nextBatsman = currentInnings.battingCard.find(b => !b.isOut && b.player.toString() !== currentInnings.nonStriker.toString());
      if (nextBatsman) {
        currentInnings.striker = nextBatsman.player;
      } else {
        // All out
        currentInnings.isCompleted = true;
      }
    }

    // Update batsman stats (if not wicket or if free hit)
    if (!isWicket || isFreeHit) {
      const strikerCard = currentInnings.battingCard.find(b => b.player.toString() === currentInnings.striker.toString() && !b.isOut);
      if (strikerCard && ballType !== 'wide' && ballType !== 'no-ball') {
        strikerCard.runs += actualRuns;
        strikerCard.balls += 1;
        if (actualRuns === 4) strikerCard.fours += 1;
        if (actualRuns === 6) strikerCard.sixes += 1;
      }
    }

    // Update bowler stats
    if (ballType === 'normal' || ballType === 'dead-ball') {
      const bowlerCard = currentInnings.bowlingCard.find(b => b.player.toString() === bowler);
      if (bowlerCard) {
        bowlerCard.balls += 1;
        bowlerCard.runs += actualRuns;
        
        // Check for maiden over
        if (bowlerCard.balls % 6 === 0) {
          const overBalls = currentInnings.balls.slice(-6);
          const overRuns = overBalls.reduce((sum, b) => sum + (b.runs || 0), 0);
          if (overRuns === 0) {
            bowlerCard.maidens += 1;
          }
        }
        
        if (bowlerCard.balls % 6 === 0) {
          bowlerCard.overs += 1;
          bowlerCard.balls = 0;
        }
      }
    }

    // Update total runs
    if (ballType !== 'dead-ball') {
      currentInnings.totalRuns += actualRuns;
    }

    // Create ball record
    const ball = {
      ballNumber: totalBalls + 1,
      runs: actualRuns,
      ballType: ballType || 'normal',
      isFreeHit: isFreeHit || false,
      isWicket: isWicket || false,
      dismissalType: isWicket ? dismissalType : null,
      batsman: currentInnings.striker,
      bowler: bowler,
      fielder: fielder || null
    };

    currentInnings.balls.push(ball);
    
    // Store current bowler in innings (only for valid balls)
    if (ballType !== 'wide' && ballType !== 'no-ball' && ballType !== 'dead-ball') {
      currentInnings.currentBowler = bowler;
    }

    // Rotate striker/non-striker on odd runs or end of over
    if (actualRuns % 2 === 1 && ballType !== 'wide' && ballType !== 'no-ball') {
      [currentInnings.striker, currentInnings.nonStriker] = [currentInnings.nonStriker, currentInnings.striker];
    }

    // Rotate at end of over (every 6 valid balls)
    const validBalls = currentInnings.balls.filter(b => b.ballType !== 'wide' && b.ballType !== 'no-ball' && b.ballType !== 'dead-ball');
    if (validBalls.length % 6 === 0 && validBalls.length > 0) {
      [currentInnings.striker, currentInnings.nonStriker] = [currentInnings.nonStriker, currentInnings.striker];
      // Clear current bowler when over is complete to allow new bowler selection
      currentInnings.currentBowler = null;
    }

    // Check if all out
    if (currentInnings.wickets >= 10) {
      currentInnings.isCompleted = true;
    }

    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate({
        path: 'teamA',
        populate: { path: 'players' }
      })
      .populate({
        path: 'teamB',
        populate: { path: 'players' }
      })
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.currentBowler')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player')
      .populate('secondInnings.team')
      .populate('secondInnings.striker')
      .populate('secondInnings.nonStriker')
      .populate('secondInnings.currentBowler')
      .populate('secondInnings.battingCard.player')
      .populate('secondInnings.bowlingCard.player');

    res.json(updatedMatch);
  } catch (error) {
    console.error('Record ball error:', error);
    res.status(500).json({ message: 'Error recording ball', error: error.message });
  }
};

// End innings
exports.endInnings = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const currentInnings = match.currentInnings === 1 ? match.firstInnings : match.secondInnings;
    currentInnings.isCompleted = true;

    // If first innings, initialize second innings
    if (match.currentInnings === 1) {
      const battingTeam = match.battingFirst === 'teamA' ? match.teamB : match.teamA;
      const bowlingTeam = match.battingFirst === 'teamA' ? match.teamA : match.teamB;

      const battingCard = battingTeam.players.map(playerId => ({
        player: playerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false
      }));

      const bowlingCard = bowlingTeam.players.map(playerId => ({
        player: playerId,
        overs: 0,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        noBalls: 0,
        wides: 0
      }));

      match.secondInnings = {
        team: battingTeam,
        totalRuns: 0,
        wickets: 0,
        totalOvers: match.totalOvers,
        balls: [],
        battingCard: battingCard,
        bowlingCard: bowlingCard,
        striker: battingTeam.players[0],
        nonStriker: battingTeam.players[1],
        extras: 0,
        isCompleted: false
      };

      match.currentInnings = 2;
    } else {
      // Second innings ended, match is complete
      match.status = 'completed';
    }

    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate('teamA')
      .populate('teamB')
      .populate('firstInnings.team')
      .populate('firstInnings.striker')
      .populate('firstInnings.nonStriker')
      .populate('firstInnings.battingCard.player')
      .populate('firstInnings.bowlingCard.player')
      .populate('secondInnings.team')
      .populate('secondInnings.striker')
      .populate('secondInnings.nonStriker')
      .populate('secondInnings.battingCard.player')
      .populate('secondInnings.bowlingCard.player');

    res.json(updatedMatch);
  } catch (error) {
    console.error('End innings error:', error);
    res.status(500).json({ message: 'Error ending innings', error: error.message });
  }
};

// End match
exports.endMatch = async (req, res) => {
  try {
    const { result } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.status = 'completed';
    match.result = result;

    await match.save();

    res.json({ message: 'Match ended successfully', match });
  } catch (error) {
    console.error('End match error:', error);
    res.status(500).json({ message: 'Error ending match', error: error.message });
  }
};

