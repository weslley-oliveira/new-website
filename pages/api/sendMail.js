
const nodemailer = require("nodemailer");

export default async (req, res) => {
   
    const { USER_EMAIL, USER_PASS } = process.env

    if (req.method === "POST"){

        const {name, email, text} = req.body;
       
        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.eu",
            port: 465,
            secure: true,
            auth: {
                user: `${USER_EMAIL}`,
                pass: `${USER_PASS}`
            },
          });

          const mailOption = {
            from: '<me@weslleyoliveira.com>',
            to: `me@weslleyoliveira.com`,
            subject: `${email}'`,
            html: `
              <h1>${name}</h1>
              <p>${text}</p>
              ${email}
              `,          
          };
        
          transporter.sendMail(mailOption, (err, response) => {
            if (err) {
              console.log(err);             
              res.send("error" + JSON.stringify(err));
            } else {
              console.log("mail sent");
              res.send("success" + JSON.stringify(response));
            }
        });                       
            
    }    
      
}
