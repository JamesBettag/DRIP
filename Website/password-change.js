exports.sendPasswordChangeEmail = function sendpasswordChangeFunction(email, accHash) {

    require('dotenv').config()
    const key = process.env.SENDGRID_API_KEY
  
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(key);
    const msg = {
      to: email,
      from: 'notifications.drip@gmail.com',
      subject: 'DRIP Password Change',
      text: '?',    //This field does not seem to appear on emails
      html: "<strong>You have requested a password change</strong><br><p>Copy and paste this link:<br><p>http://localhost:3000/passwordchange?hash=' + accHash + '</p>"
      //html: "<strong>Account has been created!</strong><br><p>Validate your email here:<br><a href='http://localhost:3000/verification?hash=" + accHash +"'>Validate</a></p>"
                                                              // "<a " + target + "href='YourURLHere?dbid=db&id=" + openLink +"'>HyperLinkText</a>";
  
      ,     //End html words in text box
    };
    //ES6
    sgMail
      .send(msg)
      .then(() => { }, error => {
        console.error(error);
  
        if (error.response) {
          console.error(error.response.body)
        }
      });
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