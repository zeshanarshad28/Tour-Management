const nodemailer = require("nodemailer");
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Zeeshan Arshad <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Send Grid
      return nodemailer.createTransport({
        service: "SendGrid",
        // service: "gmail",
        auth: {
          // user: process.env.SENDGRID_USERNAME,
          // user: "zeshanarshad28@gmail.com",
          user: "apikey",
          // pass: process.env.SENDGRID_PASSWORD,
          pass: "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",
        },
      });
    }
    return nodemailer.createTransport({
      //   service: 'gmail',
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    //this will send actual email.....
    // 1) Render HTML based on pug template

    // res.render('') // we can use it like this for render html based on pug template....
    // we require "pug" pkg first
    //  use below html variable when to use in real time but for now use simple html.
    // const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
    //   firstName:this.firstName,
    //   url:this.url,
    //   subject
    // });
    console.log(this.from);
    console.log(this.to);
    console.log(process.env.EMAIL_USERNAME);
    console.log(process.env.EMAIL_PASSWORD);

    const html = `<h1>hello Zeeshan </h1>`;
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      // from: "Zeeshan Arshad <zeshanarshad28@gmail.com>",
      to: this.to,
      // to: "zahidmahmood5455@gmail.com",
      // to: "shanii@mailsac.com",
      subject, //sunject:subject
      // html,
      // text: htmlToText.fromString(html),
      text: "hello",
    };
    // 3)Creat a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("Welcome", "Welcome to Magnus Mage");
  }
  async sendPasswordReset() {
    await this.send(
      "Password Reset",
      "Your password reset token ! ( valid for 10 minutes)"
    );
  }
};

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// <<<<<<<<simple way of sendind mail.>>>>>>>>>>>>>>>>>
// const sendEmail = async (options) => {
//   // 1) creat transporter
//   let transporter = nodemailer.createTransport({
//     //   service: 'gmail',
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //   var transport = nodemailer.createTransport({
//   //   host: "smtp.mailtrap.io",
//   //   port: 2525,
//   //   auth: {
//   //     user: "398c219b2438a4",
//   //     pass: "273bd8e76b9eff"
//   //   }
//   // });

//   // Define the email options

//   const mailOptions = {
//     from: "Zeeshan Arshad <zeshanarshad28@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Email sent: " + info.response);
//     }
//   });
// };

// module.exports = sendEmail;
