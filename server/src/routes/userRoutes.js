const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
// router.post('/login_', userController.login);
router.post('/subscribe', userController.subscribe);

module.exports = router;