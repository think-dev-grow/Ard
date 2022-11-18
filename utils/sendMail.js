var { SendMailClient } = require("zeptomail");

const url = "api.zeptomail.com/";
const token =
  "Zoho-enczapikey wSsVR61w/xT1Xah0lDD8Lr86kQhQA130EEV/31en4yL6Hf7Ep8dvlUHOBAauSKUYRDVsFTBHoOgpmxYHh2Bcidwpn1ACDiiF9mqRe1U4J3x17qnvhDzOX2VfkRuKLokAxghtn2hmGsEk+g==";

let client = new SendMailClient({ url, token });

//Verification mail
const sendVerificationMail = (to, value) => {
  client
    .sendMail({
      bounce_address: "NOREPLY@bounce.ardilla.africa",
      from: {
        address: "noreply@ardilla.africa",
        name: "Ardilla",
      },
      to: [
        {
          email_address: {
            address: `${to}`,
            name: "",
          },
        },
      ],
      subject: "Email verifaction",
      htmlbody: `<div style="text-align: center;">
        <img src="https://i.postimg.cc/wBWk35pJ/Logo-copy.png" alt="" class="img-fluid" style="padding: 30px 0px;">
        <hr>
        <img src="https://i.postimg.cc/rmtXJNqX/illustration.png " alt="" class="img-fluid">
        <h6 style="color: #041D05; font-size: 18px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Please use the OTP code below to complete your account setup:</h6>
        <p style="color: #041D05; font-size: 58px; font-weight: 700; line-height: 76px; font-family: 'Ubuntu'; margin-top: 20px;">${value}</p>
        
        <h3 style="color: #041D05; font-size: 19px; font-weight: 600; line-height: 26px; font-family: 'Ubuntu'; margin-top: 70px;">- The Ardilla Team</h3>
        <small style="color: #041D05; font-size: 17px; font-weight: 500; line-height: 26px; font-family: 'Ubuntu'; margin-top: 20px;">Copyright © 2022 Ardilla. All rights reserved </small>
      </div>`,
    })
    .then((resp) => console.log("success", resp))
    .catch((error) => console.log("error", error));
};

//Reset password mail
const resetPassword = (to, name, username, token) => {
  client
    .sendMail({
      bounce_address: "NOREPLY@bounce.ardilla.africa",
      from: {
        address: "noreply@ardilla.africa",
        name: "Ardilla",
      },
      to: [
        {
          email_address: {
            address: `${to}`,
            name: `${username}`,
          },
        },
      ],
      subject: "Email verifaction",
      htmlbody: `<table
      cellSpacing="0"
      cellPadding="0"
      style="background-color: #F2F2F2; border: 1px solid #eee; width: 100%;"
    >
      <tbody>
        <tr>
          <td>
            <div style="background-color: #fff; border: 1px solid #eee; border-bottom: 4px solid #027EE6; box-sizing: border-box; font-family: Lato, Helvetica, 'Helvetica Neue', Arial, 'sans-serif'; padding: 40px 50px; margin: 40px auto; max-width: 600px; overflow: hidden; width: 600px;">
              <div style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
                <div style="background-image: url(https://static.zohocdn.com/zeptomail/assets/images/resetPwd.35d5b474ceb78229f2a4.svg); background-repeat: no-repeat; background-position: center; height: 40px; width: 40px; margin-right: 10px;"></div>
                <h4 style="font-weight: normal; font-size: 24px; margin: 0;">
                  Password Reset Instructions
                </h4>
              </div>
              <h2 style="color: #253745; font-size: 20px; font-weight: normal; margin: 0; margin-bottom: 30px;">
                Hi
               ${name},
              </h2>
              <p style="color: #253745; font-size: 14px; margin: 0; margin-bottom: 30px; line-height: 22px;">
                You have requested for a password reset for your
                <strong>Ardilla</strong>
                account with the username
                <strong>${username}.</strong>
              </p>
              <p style="color: #253745; font-size: 14px; margin: 0; line-height: 22px;">
                Click on the below link to reset your password.
              </p>
              <a
                href="https://ard-illa.herokuapp.com/ardilla/api/auth/verify/reset-password/${token}"
                style="border: none; border-radius: 4px; color: #fff; cursor: pointer; display: inline-block; font-size: 16px; padding: 15px 30px; background-color: #027EE6; text-decoration: none; margin: 25px 0;"
              >
                Password Reset
              </a>
              <p style="color: #253745; font-size: 14px; margin: 0; margin-bottom: 30px; line-height: 22px;">
                This link will only be valid for the next
                <strong>24 hours.</strong>
                If you did not initiate the password reset, ignore this email.
              </p>
              <p style="color: #253745; font-size: 14px; margin: 0; margin-bottom: 30px; line-height: 22px;">
                If you'd like to know more about
                <span style="color: #027EE6;">Ardilla</span>
                or want to get in touch with us, get in touch with our customer
                support team.
              </p>
              <p style="color: #253745; font-size: 14px; margin: 0; margin-bottom: 30px; line-height: 22px;">
                If you're looking for immediate help, take a look at our help
                documentation and view our latest updates in our blog.
              </p>
              <p style="color: #253745; font-size: 14px; margin: 0; line-height: 22px;">
                Thank you.
              </p>
              
            </div>
          </td>
        </tr>
      </tbody>
    </table>`,
    })
    .then((resp) => console.log("success", resp))
    .catch((error) => console.log("error", error));
};

module.exports = { sendVerificationMail, resetPassword };
