require('dotenv').config();
const crypto = require('crypto');

const payForService = (req, res) => {
    const {
        totalValue,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
    } = req.body;

    if (!totalValue || !clientFirstName || !clientLastName || !clientEmail || !clientPhone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    const merchantSecretKey = process.env.WAYFORPAY_MERCHANT_SECRET;
    const merchantDomainName = process.env.WAYFORPAY_DOMAIN;

    const orderReference = `ORDER-${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);

    const productName = ['Оплата послуги'];
    const productCount = [1];
    const productPrice = [Number(totalValue)];

    const wayforpayData = {
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        amount: Number(totalValue),
        currency: 'KZT',
        productName,
        productCount,
        productPrice,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone,
        language: 'UA',
        returnUrl: `https://${merchantDomainName}/thank-you`,
        serviceUrl: `https://${merchantDomainName}/payment-callback`,
    };

    const signatureParts = [
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        wayforpayData.amount,
        wayforpayData.currency,
        productName[0],
        productCount[0],
        productPrice[0],
    ];

    const signatureString = signatureParts.join(';') + ';' + merchantSecretKey;
    const merchantSignature = crypto
        .createHash('md5')
        .update(signatureString)
        .digest('hex');

    wayforpayData.merchantSignature = merchantSignature;

    return res.json(wayforpayData);
};

module.exports = {
    payForService,
};
