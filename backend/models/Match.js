const mongoose = require('mongoose');

const ballSchema = new mongoose.Schema({
  ballNumber: Number,
  runs: Number,
  ballType: {
    type: String,
    enum: ['normal', 'wide', 'no-ball', 'dead-ball'],
    default: 'normal'
  },
  isFreeHit: {
    type: Boolean,
    default: false
  },
  isWicket: {
    type: Boolean,
    default: false
  },
  dismissalType: {
    type: String,
    enum: ['bowled', 'catch', 'stump-out', 'run-out', 'hit-wicket', 'LBW', 'other', null],
    default: null
  },
  batsman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  bowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  fielder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  }
}, { _id: false });

const battingCardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  runs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  fours: {
    type: Number,
    default: 0
  },
  sixes: {
    type: Number,
    default: 0
  },
  isOut: {
    type: Boolean,
    default: false
  },
  dismissalType: {
    type: String,
    enum: ['bowled', 'catch', 'stump-out', 'run-out', 'hit-wicket', 'LBW', 'other', null],
    default: null
  },
  dismissedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  fielder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  }
}, { _id: false });

const bowlingCardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  overs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  maidens: {
    type: Number,
    default: 0
  },
  runs: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  noBalls: {
    type: Number,
    default: 0
  },
  wides: {
    type: Number,
    default: 0
  }
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  totalRuns: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  totalOvers: Number,
  balls: [ballSchema],
  battingCard: [battingCardSchema],
  bowlingCard: [bowlingCardSchema],
  striker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  nonStriker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  currentBowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  extras: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  totalOvers: {
    type: Number,
    required: true
  },
  battingFirst: {
    type: String,
    enum: ['teamA', 'teamB'],
    required: true
  },
  firstInnings: inningsSchema,
  secondInnings: inningsSchema,
  currentInnings: {
    type: Number,
    enum: [1, 2],
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'completed'],
    default: 'pending'
  },
  result: {
    type: String,
    enum: ['teamA-wins', 'teamB-wins', 'tied', 'draw', 'no-result', null],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);

