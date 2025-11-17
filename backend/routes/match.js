const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/active', matchController.getActiveMatch);
router.get('/:id', matchController.getMatch);

// Protected routes (require authentication)
router.post('/create', authenticate, matchController.createMatch);
router.post('/:id/start', authenticate, matchController.startMatch);
router.post('/:id/ball', authenticate, matchController.recordBall);
router.post('/:id/end-innings', authenticate, matchController.endInnings);
router.post('/:id/end-match', authenticate, matchController.endMatch);

module.exports = router;

