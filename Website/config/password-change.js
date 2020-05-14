exports.sendPasswordChangeEmail = function sendpasswordChangeFunction(email, passHash) {

    require('dotenv').config()
    const key = process.env.SENDGRID_API_KEY
  
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(key);
    const msg = {
      to: email,
      from: 'notifications.drip@gmail.com',
      subject: 'DRIP Password Change',
      text: '?',    //This field does not seem to appear on emails
      html: "<strong>You have requested a password change</strong><br><p>Click this link:<br>  <a href=\"http://leia.cs.spu.edu:3001/passwordchange?hash=" + passHash + "\">Change</a></p>"
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
