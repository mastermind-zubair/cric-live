// Game control logic

import { recordBall, endInnings, endMatch } from './api.js';
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from './utils.js';

let currentMatch = null;
let currentBowler = null;
let isFreeHit = false;
let updateBowlerSelectCallback = null;

export function initializeControl(match) {
  currentMatch = match;
  updateControlDisplay(match);
  setupBallButtons();
}

function updateControlDisplay(match) {
  if (!match) return;

  const currentInnings = match.currentInnings === 1 ? match.firstInnings : match.secondInnings;
  const totalBalls = currentInnings.balls.length;
  const validBalls = currentInnings.balls.filter(b => 
    b.ballType !== 'wide' && b.ballType !== 'no-ball' && b.ballType !== 'dead-ball'
  ).length;
  const { overs, balls: remainingBalls } = calculateOvers(validBalls);

  // Update current score section
  const inningsTypeEl = document.getElementById('control-innings-type');
  const targetEl = document.getElementById('control-target');
  const scoreEl = document.getElementById('control-score');
  const oversEl = document.getElementById('control-overs');
  const runRateEl = document.getElementById('control-run-rate');
  const requiredRunRateEl = document.getElementById('control-required-run-rate');

  if (inningsTypeEl) inningsTypeEl.textContent = match.currentInnings === 1 ? '1st Innings' : '2nd Innings';
  if (scoreEl) scoreEl.textContent = `${currentInnings.totalRuns}/${currentInnings.wickets}`;
  if (oversEl) oversEl.textContent = `${overs}.${remainingBalls} / ${currentInnings.totalOvers}`;
  if (runRateEl) runRateEl.textContent = calculateRunRate(currentInnings.totalRuns, validBalls);

  if (targetEl && match.currentInnings === 2) {
    const target = match.firstInnings.totalRuns + 1;
    const runsNeeded = target - currentInnings.totalRuns;
    targetEl.textContent = `Target: ${target} (Need ${runsNeeded} runs)`;
    targetEl.style.display = 'block';
    
    if (requiredRunRateEl) {
      const ballsRemaining = (currentInnings.totalOvers * 6) - validBalls;
      requiredRunRateEl.textContent = calculateRequiredRunRate(runsNeeded, ballsRemaining);
      requiredRunRateEl.style.display = 'block';
    }
  } else {
    if (targetEl) targetEl.style.display = 'none';
    if (requiredRunRateEl) requiredRunRateEl.style.display = 'none';
  }

  // Update batting side
  const strikerCard = currentInnings.battingCard.find(b => 
    b.player._id.toString() === currentInnings.striker.toString() && !b.isOut
  );
  const nonStrikerCard = currentInnings.battingCard.find(b => 
    b.player._id.toString() === currentInnings.nonStriker.toString() && !b.isOut
  );

  const strikerEl = document.getElementById('control-striker');
  const nonStrikerEl = document.getElementById('control-non-striker');

  if (strikerEl && strikerCard) {
    strikerEl.textContent = `${strikerCard.player.name} ${strikerCard.runs} (${strikerCard.balls})`;
    strikerEl.parentElement.classList.add('striker-highlight');
  }
  if (nonStrikerEl && nonStrikerCard) {
    nonStrikerEl.textContent = `${nonStrikerCard.player.name} ${nonStrikerCard.runs} (${nonStrikerCard.balls})`;
    nonStrikerEl.parentElement.classList.remove('striker-highlight');
  }

  // Update bowling side
  updateBowlingDisplay(currentInnings);

  // Update ball-by-ball status
  updateBallByBallStatus(currentInnings);
}

function updateBowlingDisplay(innings) {
  const bowlerEl = document.getElementById('control-bowler');
  const bowlerStatsEl = document.getElementById('control-bowler-stats');

  if (currentBowler && bowlerEl && bowlerStatsEl) {
    const bowlerCard = innings.bowlingCard.find(b => 
      b.player._id.toString() === currentBowler.toString()
    );
    
    if (bowlerCard) {
      bowlerEl.textContent = bowlerCard.player.name;
      bowlerStatsEl.textContent = `${bowlerCard.wickets}/${bowlerCard.runs} - ${formatOvers(bowlerCard.balls + bowlerCard.overs * 6)}`;
    }
  }
}

function updateBallByBallStatus(innings) {
  const ballStatusEl = document.getElementById('ball-by-ball-status');
  if (!ballStatusEl) return;

  const last6Balls = innings.balls.slice(-6);
  const statusHTML = last6Balls.map(ball => {
    let display = ball.runs || '0';
    if (ball.ballType === 'wide') display = 'Wd';
    if (ball.ballType === 'no-ball') display = 'Nb';
    if (ball.isWicket) display = 'W';
    return `<span class="badge bg-secondary me-1">${display}</span>`;
  }).join('');
  
  ballStatusEl.innerHTML = statusHTML || 'No balls bowled';
}

function setupBallButtons() {
  // Score buttons
  for (let i = 0; i <= 6; i++) {
    const btn = document.getElementById(`score-${i}`);
    if (btn) {
      btn.addEventListener('click', () => recordBallAction(i));
    }
  }

  // Ball type selection
  const ballTypeSelect = document.getElementById('ball-type');
  if (ballTypeSelect) {
    ballTypeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'no-ball') {
        isFreeHit = true;
        document.getElementById('free-hit').checked = true;
      }
    });
  }

  // Free hit checkbox
  const freeHitCheckbox = document.getElementById('free-hit');
  if (freeHitCheckbox) {
    freeHitCheckbox.addEventListener('change', (e) => {
      isFreeHit = e.target.checked;
    });
  }

  // Wicket button
  const wicketBtn = document.getElementById('wicket-btn');
  if (wicketBtn) {
    wicketBtn.addEventListener('click', showWicketControls);
  }

  // End innings button
  const endInningsBtn = document.getElementById('end-innings-btn');
  if (endInningsBtn) {
    endInningsBtn.addEventListener('click', handleEndInnings);
  }

  // End match button
  const endMatchBtn = document.getElementById('end-match-btn');
  if (endMatchBtn) {
    endMatchBtn.addEventListener('click', handleEndMatch);
  }
}

async function recordBallAction(runs) {
  if (!currentMatch || !currentBowler) {
    alert('Please select a bowler first');
    return;
  }

  const ballTypeSelect = document.getElementById('ball-type');
  const ballType = ballTypeSelect ? ballTypeSelect.value : 'normal';
  const freeHitCheckbox = document.getElementById('free-hit');
  const isFreeHitValue = freeHitCheckbox ? freeHitCheckbox.checked : false;

  try {
    const ballData = {
      runs: runs,
      ballType: ballType,
      isFreeHit: isFreeHitValue,
      isWicket: false,
      bowler: currentBowler
    };

    const updatedMatch = await recordBall(currentMatch._id, ballData);
    currentMatch = updatedMatch;
    updateControlDisplay(updatedMatch);
    if (updateBowlerSelectCallback) {
      updateBowlerSelectCallback(updatedMatch);
    }

    // Reset form
    if (ballTypeSelect) ballTypeSelect.value = 'normal';
    if (freeHitCheckbox) freeHitCheckbox.checked = false;
    isFreeHit = false;

    // Clear free hit after use
    if (isFreeHitValue) {
      isFreeHit = false;
      if (freeHitCheckbox) freeHitCheckbox.checked = false;
    }
  } catch (error) {
    alert('Error recording ball: ' + error.message);
  }
}

function showWicketControls() {
  const wicketModal = document.getElementById('wicket-modal');
  if (wicketModal) {
    const modal = new bootstrap.Modal(wicketModal);
    modal.show();
  }

  // Setup wicket form
  const wicketForm = document.getElementById('wicket-form');
  if (wicketForm) {
    wicketForm.onsubmit = async (e) => {
      e.preventDefault();
      await handleWicket();
    };
  }
}

async function handleWicket() {
  if (!currentMatch || !currentBowler) {
    alert('Please select a bowler first');
    return;
  }

  const dismissalType = document.getElementById('dismissal-type')?.value;
  const fielderSelect = document.getElementById('fielder-select');
  const fielder = fielderSelect ? fielderSelect.value : null;

  if (!dismissalType) {
    alert('Please select dismissal type');
    return;
  }

  try {
    const ballData = {
      runs: 0,
      ballType: 'normal',
      isFreeHit: isFreeHit,
      isWicket: true,
      dismissalType: dismissalType,
      bowler: currentBowler,
      fielder: fielder || null
    };

    const updatedMatch = await recordBall(currentMatch._id, ballData);
    currentMatch = updatedMatch;
    updateControlDisplay(updatedMatch);
    if (updateBowlerSelectCallback) {
      updateBowlerSelectCallback(updatedMatch);
    }

    // Close modal
    const modalElement = document.getElementById('wicket-modal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    // Reset free hit
    isFreeHit = false;
    const freeHitCheckbox = document.getElementById('free-hit');
    if (freeHitCheckbox) freeHitCheckbox.checked = false;
  } catch (error) {
    alert('Error recording wicket: ' + error.message);
  }
}

async function handleEndInnings() {
  if (!currentMatch) return;

  if (!confirm('Are you sure you want to end this innings?')) {
    return;
  }

  try {
    const updatedMatch = await endInnings(currentMatch._id);
    currentMatch = updatedMatch;
    updateControlDisplay(updatedMatch);

    if (updatedMatch.status === 'completed') {
      alert('Match completed!');
      handleEndMatch();
    }
  } catch (error) {
    alert('Error ending innings: ' + error.message);
  }
}

async function handleEndMatch() {
  if (!currentMatch) return;

  const result = prompt('Enter match result:\n1. teamA-wins\n2. teamB-wins\n3. tied\n4. draw\n5. no-result');
  
  if (!result) return;

  const validResults = ['teamA-wins', 'teamB-wins', 'tied', 'draw', 'no-result'];
  if (!validResults.includes(result)) {
    alert('Invalid result');
    return;
  }

  try {
    await endMatch(currentMatch._id, result);
    alert('Match ended successfully!');
    window.location.href = '/lineup.html';
  } catch (error) {
    alert('Error ending match: ' + error.message);
  }
}

export function setBowler(bowlerId) {
  currentBowler = bowlerId;
  if (currentMatch) {
    updateControlDisplay(currentMatch);
  }
}

export function setUpdateBowlerSelectCallback(callback) {
  updateBowlerSelectCallback = callback;
}

function calculateOvers(balls) {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return { overs, balls: remainingBalls };
}

