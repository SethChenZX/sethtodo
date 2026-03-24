import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'seth.chen@outlook.com',
      subject: '【Dodo Todo】Test Email',
      html: '<p>This is a test email from Dodo Todo!</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
}

testEmail();
