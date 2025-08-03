const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyFBToken } = require('../middlewares/authMiddleware');

router.get('/threads',verifyFBToken, chatController.getThreads);
router.get('/messages',verifyFBToken, chatController.getMessages);
router.post('/read',verifyFBToken, chatController.markAsRead);
router.post('/message',verifyFBToken, chatController.createMessage);

module.exports = router; 