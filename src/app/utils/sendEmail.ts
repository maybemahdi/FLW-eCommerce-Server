import config from "@/config";
import nodemailer from "nodemailer";

export const sendEmail = async (subject: string, to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    // port: 465,
    // secure: config.node_env === "production",
    service: "gmail",
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  await transporter.sendMail({
    from: config.emailSender.email,
    to,
    subject: subject,
    text: "",
    html,
  });
};
