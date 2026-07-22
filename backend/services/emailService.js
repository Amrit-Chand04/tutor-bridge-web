const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, toName, otp) => {
  await transporter.sendMail({
    from: `"TutorBridge" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your TutorBridge verification code",
    text: `Hi ${toName},\n\nYour TutorBridge verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
};

module.exports = { sendOtpEmail };
