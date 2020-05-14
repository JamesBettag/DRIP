exports.sendVerificationEmail = function sendVerificationEmailFunction(email, accHash) {

  require('dotenv').config()
  const key = process.env.SENDGRID_API_KEY

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(key);
  const msg = {
    to: email,   //Change this later to use account field emails
    from: 'notifications.drip@gmail.com',
    subject: 'DRIP Account Verification',
    text: '?',    //This field does not seem to appear on emails
    html: "<strong>Account has been created!</strong><br><p>Validate your email here:<br>  <a href=\"http://leia.cs.spu.edu:3001/verification?hash=" + accHash + "\">Validate</a></p>"
    //Server version located below:
    //"<strong>Account has been created!</strong><br><p>Validate your email here:<br>  <a href=\"http://leia.cs.spu.edu:3000/verification?hash=" + accHash + "\">Validate</a></p>"
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
