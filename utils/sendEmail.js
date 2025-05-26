const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'dokee.pro@gmail.com',
            pass: 'cgrr mobx igcg fkbh'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'dokee.pro@gmail.com',
        to,
        subject,
        text,
        attachments // ← ВАЖНО
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('📩 Email sent with attachments');
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

module.exports = sendEmail;
