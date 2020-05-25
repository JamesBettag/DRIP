/*
exports.sendNotificationEmail = function sendNotificationFunction(email) {

    require('dotenv').config()
    const key = process.env.SENDGRID_API_KEY
  
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(key);
    const msg = {
      to: email,
      from: 'notifications.drip@gmail.com',
      subject: 'DRIP Notification!',
      text: '?',    //This field does not seem to appear on emails
      html: "<strong>Your plant's water is too low!</strong><br><p>Check your recent updates here:<br><a href=\"http://localhost:3001/\"></a></p>" //Replace with http://leia.cs.spu.edu:3001 later
      ,     //End html words in text box
    };
    //ES8
    (async () => {
      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);
  
        if (error.response) {
          console.error(error.response.body)
        }
      }
    })();
  
  }
*/