const express = require('express');
const { payForService, sendDataToEmail } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/pay-for-service', payForService);
router.post('/send-data-to-email', sendDataToEmail);

module.exports = router;