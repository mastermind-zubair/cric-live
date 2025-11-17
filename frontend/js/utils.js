// Utility functions

export function formatOvers(balls) {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
}

export function calculateRunRate(runs, balls) {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 6).toFixed(2);
}

export function calculateRequiredRunRate(runsNeeded, ballsRemaining) {
  if (ballsRemaining === 0) return '0.00';
  return ((runsNeeded / ballsRemaining) * 6).toFixed(2);
}

export function getDismissalText(dismissalType) {
  const dismissals = {
    'bowled': 'b',
    'catch': 'c',
    'stump-out': 'st',
    'run-out': 'run out',
    'hit-wicket': 'hit wicket',
    'LBW': 'lbw',
    'other': 'other'
  };
  return dismissals[dismissalType] || '';
}

export function formatPlayerName(player) {
  if (!player) return 'N/A';
  return typeof player === 'object' ? player.name : player;
}

