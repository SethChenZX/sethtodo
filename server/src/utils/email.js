import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'todo-notice@cshrpro.com',
      to: email,
      subject: '【Dodo Todo】メールアドレス確認コード',
      text: `Dodo Todo メールアドレス確認コード

確認コード：${otp}

このコードは5分後に有効期限が切れます。
このコードを他人に教えないでください。

Dodo Todoに登録していない場合は、このメールを無視してください。`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6b46c1; margin-bottom: 20px;">Dodo Todo</h2>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
              確認コード：
            </p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6b46c1; text-align: center;">
              ${otp}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
            このコードは5分後に有効期限が切れます。
          </p>
          <p style="color: #dc2626; font-size: 14px; margin-bottom: 16px;">
            このコードを他人に教えないでください。
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            Dodo Todoに登録していない場合は、このメールを無視してください。
          </p>
        </div>
      `
    });

    console.log('Email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const verifyResendConnection = async () => {
  try {
    await resend.apiKeys.list();
    console.log('Resend API is ready');
    return true;
  } catch (error) {
    console.error('Resend connection error:', error);
    return false;
  }
};

const isRealEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const testDomains = ['test.com', 'example.com', 'localhost', 'fake.com', 'null'];
  const domain = email.split('@')[1]?.toLowerCase();
  return !testDomains.includes(domain);
};

export const sendTodoCreatedNotification = async (superUsers, todo, creatorName) => {
  const recipients = ['chen.qiangqiang@outlook.com', 'seth.chen@outlook.com'];

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
      from: process.env.EMAIL_FROM || 'todo-notice@cshrpro.com',
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

export const sendTodoStatusChangedNotification = async (superUsers, todo, oldStatus, newStatus, creatorName) => {
  const recipients = ['chen.qiangqiang@outlook.com', 'seth.chen@outlook.com'];

  if (recipients.length === 0) {
    console.log('No valid super user emails to notify');
    return { success: true, message: 'No recipients' };
  }

  const emailContent = `
[Status Changed] Todo Status Update

Created by: ${creatorName}
Title: ${todo.title}
Old Status: ${oldStatus}
New Status: ${newStatus}

---
This is an automated notification from Dodo Todo App.
  `.trim();

  const emailHtml = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #6b46c1; margin-bottom: 20px;">Dodo Todo - Status Changed</h2>
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
      <strong>Created by:</strong> ${creatorName}
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
      <strong>Title:</strong> ${todo.title}
    </p>
    <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
      <strong>Old Status:</strong> ${oldStatus}
    </p>
    <p style="margin: 0; color: #374151; font-size: 16px;">
      <strong>New Status:</strong> ${newStatus}
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
      from: process.env.EMAIL_FROM || 'todo-notice@cshrpro.com',
      to: recipients,
      subject: `[Dodo Todo] Status Changed: ${todo.title} (${oldStatus} → ${newStatus})`,
      text: emailContent,
      html: emailHtml
    });

    console.log('Todo status change notification sent:', data);
    return { success: true, data, recipients };
  } catch (error) {
    console.error('Failed to send todo status change notification:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};
