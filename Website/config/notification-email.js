exports.sendNotificationEmail = function sendNotificationEmailFunction(email) {

  require('dotenv').config()
  const key = process.env.SENDGRID_API_KEY

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(key);
  const msg = {
    to: email,   //Change this later to use account field emails
    from: 'notifications.drip@gmail.com',
    subject: 'DRIP Notification',
    text: '?',    //This field does not seem to appear on emails
    html: "<strong>Your water levels have gone too low!</strong><br><p>Click this link:<br>  <a href=\"http://leia.cs.spu.edu:3001/\">Redirect to website</a></p>"
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
