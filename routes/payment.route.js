const express = require('express');
const { payForService } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/pay-for-service', payForService);

module.exports = router;