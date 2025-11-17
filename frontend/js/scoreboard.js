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
  const targetEl = document.getElementById('target-score');
  const currentOverEl = document.getElementById('current-over');

  if (totalRunsEl) totalRunsEl.textContent = currentInnings.totalRuns;
  if (totalWicketsEl) totalWicketsEl.textContent = currentInnings.wickets;
  if (oversEl) oversEl.textContent = `${overs}.${remainingBalls} / ${currentInnings.totalOvers}`;
  if (inningsEl) inningsEl.textContent = match.currentInnings === 1 ? '1st Innings' : '2nd Innings';
  if (runRateEl) runRateEl.textContent = calculateRunRate(currentInnings.totalRuns, validBalls);
  if (extrasEl) extrasEl.textContent = currentInnings.extras;

  // Striker and non-striker
  const strikerCard = currentInnings.battingCard.find(b => 
    b.player._id.toString() === currentInnings.striker.toString() && !b.isOut
  );
  const nonStrikerCard = currentInnings.battingCard.find(b => 
    b.player._id.toString() === currentInnings.nonStriker.toString() && !b.isOut
  );

  if (strikerEl && strikerCard) {
    strikerEl.textContent = `${strikerCard.player.name} ${strikerCard.runs} (${strikerCard.balls})`;
  }
  if (nonStrikerEl && nonStrikerCard) {
    nonStrikerEl.textContent = `${nonStrikerCard.player.name} ${nonStrikerCard.runs} (${nonStrikerCard.balls})`;
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

