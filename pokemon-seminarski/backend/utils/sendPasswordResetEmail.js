const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_SECRET
    }
})

/**
 * @param {string} email 
 * @param {string} url Link to reset password
 */
const sendPasswordResetEmail = (email, url) => {
    transporter.sendMail({
        to: email,
        subject: 'Password reset ITEH-POKEMON',
        html: `<h1> Hi! </h1>
        <p> This is your password reset link ${url} </p>
        <p> Expires in 15min </p>`
    }).then(() => {
        console.log('Password email sent!');
    }).catch(err => {
        console.error(err);
    })
}

module.exports = {
    sendPasswordResetEmail
}