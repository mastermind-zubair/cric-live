// Scoreboard display logic

import { getActiveMatch } from './api.js';
import { formatOvers, calculateRunRate } from './utils.js';

let pollInterval = null;

export function startPolling(callback, interval = 2000) {
  stopPolling();
  pollInterval = setInterval(async () => {
    try {
      const match = await getActiveMatch();
      if (callback) callback(match);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, interval);
}

export function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export function updateScoreboard(match) {
  if (!match) return;

  const currentInnings = match.currentInnings === 1 ? match.firstInnings : match.secondInnings;
  const totalBalls = currentInnings.balls.length;
  const validBalls = currentInnings.balls.filter(b => 
    b.ballType !== 'wide' && b.ballType !== 'no-ball' && b.ballType !== 'dead-ball'
  ).length;
  const { overs, balls: remainingBalls } = calculateOvers(validBalls);
  
  // Update main scorecard elements
  const totalRunsEl = document.getElementById('total-runs');
  const totalWicketsEl = document.getElementById('total-wickets');
  const oversEl = document.getElementById('overs');
  const inningsEl = document.getElementById('innings-indicator');
  const runRateEl = document.getElementById('run-rate');
  const extrasEl = document.getElementById('extras');
  const strikerEl = document.getElementById('striker');
  const nonStrikerEl = document.getElementById('non-striker');
  const currentBowlerEl = document.getElementById('current-bowler');
  const targetEl = document.getElementById('target-score');
  const currentOverEl = document.getElementById('current-over');

  if (totalRunsEl) totalRunsEl.textContent = currentInnings.totalRuns;
  if (totalWicketsEl) totalWicketsEl.textContent = currentInnings.wickets;
  if (oversEl) oversEl.textContent = `${overs}.${remainingBalls} / ${currentInnings.totalOvers}`;
  if (inningsEl) inningsEl.textContent = match.currentInnings === 1 ? '1st Innings' : '2nd Innings';
  if (runRateEl) runRateEl.textContent = calculateRunRate(currentInnings.totalRuns, validBalls);
  if (extrasEl) extrasEl.textContent = currentInnings.extras;

  // Striker and non-striker - Handle both cases: player as object or player as ID
  const strikerId = currentInnings.striker && currentInnings.striker._id 
    ? currentInnings.striker._id.toString() 
    : (currentInnings.striker ? currentInnings.striker.toString() : null);
    
  const nonStrikerId = currentInnings.nonStriker && currentInnings.nonStriker._id 
    ? currentInnings.nonStriker._id.toString() 
    : (currentInnings.nonStriker ? currentInnings.nonStriker.toString() : null);
  
  // Find striker card
  const strikerCard = strikerId ? currentInnings.battingCard.find(b => {
    if (!b.player) return false;
    const playerId = b.player && b.player._id ? b.player._id.toString() : b.player.toString();
    return playerId === strikerId && !b.isOut;
  }) : null;
  
  // Find non-striker card
  const nonStrikerCard = nonStrikerId ? currentInnings.battingCard.find(b => {
    if (!b.player) return false;
    const playerId = b.player && b.player._id ? b.player._id.toString() : b.player.toString();
    return playerId === nonStrikerId && !b.isOut;
  }) : null;

  // Display striker
  if (strikerEl) {
    if (strikerCard && strikerCard.player) {
      const playerName = strikerCard.player.name || (typeof strikerCard.player === 'string' ? strikerCard.player : 'Player');
      strikerEl.textContent = `${playerName} ${strikerCard.runs || 0} (${strikerCard.balls || 0})`;
    } else if (currentInnings.striker && currentInnings.striker.name) {
      // Fallback: use striker object directly if available
      strikerEl.textContent = `${currentInnings.striker.name} 0 (0)`;
    } else {
      strikerEl.textContent = '-';
    }
  }
  
  // Display non-striker
  if (nonStrikerEl) {
    if (nonStrikerCard && nonStrikerCard.player) {
      const playerName = nonStrikerCard.player.name || (typeof nonStrikerCard.player === 'string' ? nonStrikerCard.player : 'Player');
      nonStrikerEl.textContent = `${playerName} ${nonStrikerCard.runs || 0} (${nonStrikerCard.balls || 0})`;
    } else if (currentInnings.nonStriker && currentInnings.nonStriker.name) {
      // Fallback: use nonStriker object directly if available
      nonStrikerEl.textContent = `${currentInnings.nonStriker.name} 0 (0)`;
    } else {
      nonStrikerEl.textContent = '-';
    }
  }

  // Display current bowler
  if (currentBowlerEl) {
    if (currentInnings.currentBowler) {
      const bowler = currentInnings.currentBowler;
      const bowlerName = bowler.name || (typeof bowler === 'string' ? 'Player' : 'Player');
      
      // Find bowler card to get stats
      const bowlerCard = currentInnings.bowlingCard.find(b => {
        if (!b.player) return false;
        const playerId = b.player && b.player._id ? b.player._id.toString() : b.player.toString();
        const bowlerId = bowler._id ? bowler._id.toString() : bowler.toString();
        return playerId === bowlerId;
      });
      
      if (bowlerCard && bowlerCard.player) {
        const totalBalls = bowlerCard.balls + (bowlerCard.overs * 6);
        const oversDisplay = formatOvers(totalBalls);
        currentBowlerEl.textContent = `${bowlerCard.player.name || bowlerName} - ${bowlerCard.wickets}/${bowlerCard.runs} (${oversDisplay})`;
      } else {
        currentBowlerEl.textContent = bowlerName;
      }
    } else {
      // Try to get bowler from last ball
      const lastBall = currentInnings.balls[currentInnings.balls.length - 1];
      if (lastBall && lastBall.bowler) {
        const bowler = lastBall.bowler;
        const bowlerName = bowler.name || (typeof bowler === 'string' ? 'Player' : 'Player');
        currentBowlerEl.textContent = bowlerName;
      } else {
        currentBowlerEl.textContent = '-';
      }
    }
  }

  // Target score (for 2nd innings)
  if (targetEl && match.currentInnings === 2) {
    const target = match.firstInnings.totalRuns + 1;
    targetEl.textContent = `Target: ${target}`;
    targetEl.style.display = 'block';
  } else if (targetEl) {
    targetEl.style.display = 'none';
  }

  // Current over (last 6 balls)
  if (currentOverEl) {
    const last6Balls = currentInnings.balls.slice(-6);
    const overDisplay = last6Balls.map(ball => {
      if (ball.ballType === 'wide') return 'Wd';
      if (ball.ballType === 'no-ball') return 'Nb';
      if (ball.isWicket) return 'W';
      return ball.runs || '0';
    }).join(' ');
    currentOverEl.textContent = overDisplay || 'No balls bowled';
  }
}

function calculateOvers(balls) {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return { overs, balls: remainingBalls };
}

