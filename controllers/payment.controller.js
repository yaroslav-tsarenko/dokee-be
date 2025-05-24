require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

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



const sendDataToEmail = async (req, res) => {
    upload.array('files')(req, res, async (err) => {
        if (err) {
            console.error('❌ File upload error:', err);
            return res.status(500).json({ error: 'File upload failed' });
        }

        try {
            const { email, languagePair, tariff, documents } = req.body;


            let parsedDocs = [];
            try {
                parsedDocs = typeof documents === 'string' ? JSON.parse(documents) : documents;
            } catch (e) {
                parsedDocs = [];
            }

            const attachments = (req.files || []).map((file) => ({
                filename: file.originalname,
                content: file.buffer,
            }));

            const emailText = `
Новый запрос на перевод:

📧 Почта клиента: ${email}
📦 Тариф: ${tariff}
🌐 Языковая пара: ${languagePair}

Документы:
${parsedDocs.map((doc, i) => (
                `${i + 1}. ${doc.name}
  - ФИО: ${doc.fioLatin || '-'}
  - Печать: ${doc.sealText || '-'}
  - Штамп: ${doc.stampText || '-'}
  - Образцы: ${(doc.selectedSamples || []).map(s => s.name).join(', ') || '-'}`)).join('\n')}
`;

            await sendEmail('obobuskiy@gmail.com', '📄 Новый заказ на перевод', emailText, attachments);
            return res.status(200).json({ message: 'Данные успешно отправлены на email' });

        } catch (error) {
            console.error('❌ Ошибка при отправке:', error);
            return res.status(500).json({ error: 'Ошибка при отправке письма' });
        }
    });
};


module.exports = {
    payForService,
    sendDataToEmail
};

