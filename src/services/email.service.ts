import { emailConfig, emailTransporter } from "../config/email.config";

class EmailService {
   async sendVerificationEmail(email: string, verificationToken: string, userName: string): Promise<void> {
      const subject = "Verify Your Email Address";
      const verificationLink = `${emailConfig.appBaseUrl}/auth/verify-email?token=${verificationToken}`;

      const html = `
         <!DOCTYPE html>
         <html>
         <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <style>
            body { 
               font-family: Arial, sans-serif; 
               line-height: 1.6; 
               color: #333; 
               margin: 0; 
               padding: 0; 
               background-color: #f6f9fc; 
            }
            .container { 
               max-width: 600px; 
               margin: 0 auto; 
               padding: 20px; 
            }
            .header { 
               background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); 
               color: white; 
               padding: 30px 20px; 
               text-align: center; 
               border-radius: 8px 8px 0 0;
            }
            .content { 
               background: #ffffff; 
               padding: 30px; 
               border-radius: 0 0 8px 8px;
               box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .button {
               display: inline-block;
               padding: 14px 28px;
               color: #007bff;
               text-decoration: none;
               border-radius: 5px;
               border: 2px solid #007bff;
               font-weight: bold;
               margin: 20px 0;
               text-align: center;
            }
            .footer { 
               text-align: center; 
               margin-top: 30px; 
               color: #666; 
               font-size: 12px; 
               padding: 20px;
            }
            .verification-code {
               display: none;
            }
            @media only screen and (max-width: 600px) {
               .container {
                  padding: 10px;
               }
               .content {
                  padding: 20px;
               }
            }
         </style>
         </head>
         <body>
         <div class="container">
            <div class="header">
               <h1>Email Verification</h1>
            </div>
            <div class="content">
               <p>Hello ${userName},</p>
               <p>Thank you for registering with ${emailConfig.appName}. Please verify your email address to complete your registration.</p>
               
               <div style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
               </div>
               
               <p>Or copy and paste this link into your browser:</p>
               <p style="word-break: break-all; color: #007bff;">${verificationLink}</p>
               
               <p>This verification link will expire in 24 hours.</p>
               
               <p>If you didn't create an account with ${emailConfig.appName}, please ignore this email.</p>
               
               <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
               
               <p style="font-size: 14px; color: #666;">
                  Having trouble with the button?<br>
                  Try copying the link directly into your web browser.
               </p>
            </div>
            <div class="footer">
               <p>This email was sent to ${email} because you registered for a ${emailConfig.appName} account.</p>
               <p>&copy; ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
            </div>
         </div>
         </body>
         </html>
      `;

      try {
         await emailTransporter.sendMail({
            from: emailConfig.from,
            to: email,
            subject,
            html
         });
      } catch(e) {
         console.error('Failed to send verification email:', e);
         throw new Error('Failed to send verification email');
      }
   }
}

export default new EmailService()