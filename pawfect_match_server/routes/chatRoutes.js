const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/threads', chatController.getThreads);
router.get('/messages', chatController.getMessages);
router.post('/read', chatController.markAsRead);
router.post('/message', chatController.createMessage);

module.exports = router; 