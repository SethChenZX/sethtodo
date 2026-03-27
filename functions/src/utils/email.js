import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTodoCreatedNotification = async (superUsers, todo, creatorName) => {
  // TEST: Only send to seth.chen@outlook.com
  const recipients = ['seth.chen@outlook.com'];

  if (recipients.length === 0) {
    console.log('No valid super user emails to notify');
    return { success: true, message: 'No recipients' };
  }

  const emailContent = `
A new todo has been created!

Created by: ${creatorName}
Title: ${todo.title}
Description: ${todo.description || '(No description)'}

---
This is an automated notification from Dodo Todo App.
  `.trim();

  const emailHtml = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #6b46c1; margin-bottom: 20px;">Dodo Todo - New Todo Created</h2>
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
      <strong>Created by:</strong> ${creatorName}
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
      <strong>Title:</strong> ${todo.title}
    </p>
    <p style="margin: 0; color: #374151; font-size: 16px;">
      <strong>Description:</strong> ${todo.description || '(No description)'}
    </p>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    This is an automated notification from Dodo Todo App.
  </p>
</div>
  `.trim();

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: recipients,
      subject: `[Dodo Todo] New Todo Created by ${creatorName}`,
      text: emailContent,
      html: emailHtml
    });

    console.log('Todo creation notification sent:', data);
    return { success: true, data, recipients };
  } catch (error) {
    console.error('Failed to send todo creation notification:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};