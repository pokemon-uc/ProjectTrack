const express = require('express');
const router = express.Router();

const { getMyNotifications, readOne, readAll } = require('../controllers/notification.controller');
const protect = require('../middleware/auth');

router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, readAll);
router.put('/notifications/:id/read', protect, readOne);

module.exports = router;