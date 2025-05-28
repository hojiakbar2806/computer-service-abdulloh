import nodemailer from 'nodemailer';


export const sendToEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'asultonkabirov@gmail.com',
          pass: 'wofswpcsgslzpugu', 
        },
      });
  
      const mailOptions = {
        from: 'asultonkabirov@gmail.com',
        to: email,
        subject: subject,
        text:text,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Xabar yuborildi:', info.response);
    } catch (error) {
      console.error('Xatolik:', error);
    }
  };
  