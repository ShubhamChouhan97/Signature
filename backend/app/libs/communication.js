import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
});


export const sendNewUserEmail = (email, password) => {
    const message = `Please use Email: ${email} and password: ${password} for login.`;
    transporter.sendMail({
        subject: "New Account",
        text: message,
        to: email,
        from: process.env.EMAIL_AUTH_USER
    })
}