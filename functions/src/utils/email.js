import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

export const sendDailySummaryEmail = async (stats) => {
  const recipients = ['chen.qiangqiang@outlook.com', 'seth.chen@outlook.com'];
  const { createdCount, completedCount, overdueCount, delayedCount, abandonedCount, completionRate } = stats;

  const emailContent = `
【Dodo Todo】日次サマリー (${new Date().toLocaleDateString('ja-JP')})

本日のTodo状況まとめ

━━━━━━━━━━━━━━━
📝 作成数: ${createdCount}件
✅ 完了数: ${completedCount}件
⚠️ 期限切れ: ${overdueCount}件
⏰ 延期数: ${delayedCount}件
❌ 放棄数: ${abandonedCount}件
━━━━━━━━━━━━━━━
📊 完了率: ${completionRate}%

━━━━━━━━━━━━━━━
本邮件由 Dodo Todo App 自动发送
`.trim();

  const emailHtml = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #6b46c1; margin-bottom: 20px;">【Dodo Todo】日次サマリー</h2>
  <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
    <h3 style="color: #374151; font-size: 16px; margin: 0 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
      本日のTodo状況まとめ
    </h3>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #374151;">📝 作成数</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #6b46c1;">${createdCount}件</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #374151;">✅ 完了数</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a;">${completedCount}件</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #374151;">⚠️ 期限切れ</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #9333ea;">${overdueCount}件</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #374151;">⏰ 延期数</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ea580c;">${delayedCount}件</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #374151;">❌ 放棄数</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #dc2626;">${abandonedCount}件</td>
      </tr>
    </table>
    
    <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #374151; font-size: 16px;">📊 完了率</span>
        <span style="color: #16a34a; font-size: 24px; font-weight: bold;">${completionRate}%</span>
      </div>
    </div>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    本邮件由 Dodo Todo App 自动发送
  </p>
</div>
`.trim();

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'todo-notice@cshrpro.com',
      to: recipients,
      subject: `【Dodo Todo】日次サマリー (${new Date().toLocaleDateString('ja-JP')})`,
      text: emailContent,
      html: emailHtml
    });

    console.log('Daily summary email sent:', data);
    return { success: true, data, recipients };
  } catch (error) {
    console.error('Failed to send daily summary email:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};