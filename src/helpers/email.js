import sgMail from "@sendgrid/mail";
import fs from "fs";
import { currentPdf } from "./files.js";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (emailAddress) => {
  const pathToAttachment = currentPdf;
  const attachment = fs.readFileSync(pathToAttachment).toString("base64");
  console.log(emailAddress);
  const msg = {
    to: emailAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Attachment",
    html: "<p>Here’s an attachment for you!</p>",
    attachments: [
      {
        content: attachment,
        filename: "mypdf.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };
  const response = await sgMail.send(msg);
  return response;
};
// try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//     const msg = {
//       to: emailAddress,
//       from: process.env.SENDER_EMAIL,
//       subject: "Sending with Twilio SendGrid is Fun",
//       text: "and easy to do anywhere, even with Node.js",
//       html: "<strong>and easy to do anywhere, even with Node.js</strong>",
//     };

//     const res = await sgMail.send(msg);
//     return res;
//   } catch (error) {
//     console.log(error);
//     throw new Error("An error occurred while sending an email");
//   }
