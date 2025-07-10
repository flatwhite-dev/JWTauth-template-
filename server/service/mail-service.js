// mail.service.js
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  }

  async createTransporter() {
    const accessTokenResponse = await this.oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse;
    if (!accessToken) throw new Error("No access token");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken,
      },
    });
  }

  async sendActivationMail(to, link, code) {
    const transporter = await this.createTransporter();
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Activate account on ${process.env.API_URL}`,
      text: `Activate here: ${link}`,
      html: ` <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center">

                  <div> Hello, here is your code: <strong style="font-size: 20px">${code}</strong> <br>
                  or click on the button to activate account: <br> </div>
                  <a href="${link}" style="padding: 10px 20px; background: black; color: #fff; text-decoration: none">ACTIVATE</a>

             </div>
      `,
    });
  }
}

module.exports = new MailService();
