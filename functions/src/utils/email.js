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

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateShort = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const createTodoItemText = (index, todo, type) => {
  let text = `\n【${index}】📧 ${todo.email}\n`;
  text += `　　📝 タイトル: ${todo.title}\n`;
  if (todo.description) {
    text += `　　📖 説明文: ${todo.description}\n`;
  }

  if (type === 'created') {
    text += `　　⏰ 期限: ${formatDateShort(todo.deadline)}\n`;
    text += `　　📌 ステータス: pending（作成）\n`;
  } else if (type === 'delayed') {
    text += `　　📌 ステータス変更: ${todo.oldStatus} → delayed（+${todo.delayDays}日）\n`;
    text += `　　⏰ 新しい期限: ${formatDateShort(todo.newDeadline)}\n`;
  } else if (type === 'overdue') {
    text += `　　📌 ステータス変更: ${todo.oldStatus} → overdue\n`;
    text += `　　⏰ 期限: ${formatDateShort(todo.deadline)}\n`;
  } else if (type === 'completed') {
    text += `　　📌 ステータス変更: ${todo.oldStatus} → completed\n`;
  } else if (type === 'abandoned') {
    text += `　　📌 ステータス変更: ${todo.oldStatus} → abandoned\n`;
  }

  return text;
};

const createTodoItemHtml = (index, todo, type, color) => {
  let statusChange = '';
  let deadlineLine = '';

  if (type === 'created') {
    statusChange = `<span style="color: #6b46c1; font-weight: bold;">pending（作成）</span>`;
    deadlineLine = `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">⏰ 期限: ${formatDateShort(todo.deadline)}</p>`;
  } else if (type === 'delayed') {
    statusChange = `<span style="color: #6b46c1;">${todo.oldStatus}</span> → <span style="color: #ea580c; font-weight: bold;">delayed（+${todo.delayDays}日）</span>`;
    deadlineLine = `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">⏰ 新しい期限: ${formatDateShort(todo.newDeadline)}</p>`;
  } else if (type === 'overdue') {
    statusChange = `<span style="color: #6b46c1;">${todo.oldStatus}</span> → <span style="color: #9333ea; font-weight: bold;">overdue</span>`;
    deadlineLine = `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">⏰ 期限: ${formatDateShort(todo.deadline)}</p>`;
  } else if (type === 'completed') {
    statusChange = `<span style="color: #6b46c1;">${todo.oldStatus}</span> → <span style="color: #16a34a; font-weight: bold;">completed</span>`;
  } else if (type === 'abandoned') {
    statusChange = `<span style="color: #6b46c1;">${todo.oldStatus}</span> → <span style="color: #dc2626; font-weight: bold;">abandoned</span>`;
  }

  return `
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
      <p style="margin: 0 0 6px; color: #374151; font-size: 13px; font-weight: bold;">
        【${index}】📧 ${todo.email}
      </p>
      <p style="margin: 4px 0; color: #1f2937; font-size: 14px;">
        📝 タイトル: ${todo.title}
      </p>
      ${todo.description ? `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;">📖 説明文: ${todo.description}</p>` : ''}
      ${deadlineLine}
      <p style="margin: 4px 0; color: #6b7280; font-size: 13px;">
        📌 ステータス: ${statusChange}
      </p>
    </div>
  `;
};

export const sendDailySummaryEmail = async (stats) => {
  const recipients = ['chen.qiangqiang@outlook.com', 'seth.chen@outlook.com'];
  const {
    createdCount,
    delayedCount,
    overdueCount,
    completedCount,
    abandonedCount,
    completionRate,
    todosData
  } = stats;

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let emailContent = `
【Dodo Todo】日次サマリー (${today})

━━━━━━━━━━━━━━━
📊 本日の集計
━━━━━━━━━━━━━━━
📝 作成: ${createdCount}件 | ⏰ 延期: ${delayedCount}件 | ⚠️ 期限切れ: ${overdueCount}件
✅ 完了: ${completedCount}件 | ❌ 放棄: ${abandonedCount}件
📈 完了率: ${completionRate}%
`;

  if (todosData.created.length > 0) {
    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 本日作成されたTodo（${todosData.created.length}件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    todosData.created.forEach((todo, i) => {
      emailContent += createTodoItemText(i + 1, todo, 'created');
    });
  }

  if (todosData.delayed.length > 0) {
    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ 本日延期されたTodo（${todosData.delayed.length}件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    todosData.delayed.forEach((todo, i) => {
      emailContent += createTodoItemText(i + 1, todo, 'delayed');
    });
  }

  if (todosData.overdue.length > 0) {
    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 本日期限切れになったTodo（${todosData.overdue.length}件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    todosData.overdue.forEach((todo, i) => {
      emailContent += createTodoItemText(i + 1, todo, 'overdue');
    });
  }

  if (todosData.completed.length > 0) {
    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 本日完了したTodo（${todosData.completed.length}件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    todosData.completed.forEach((todo, i) => {
      emailContent += createTodoItemText(i + 1, todo, 'completed');
    });
  }

  if (todosData.abandoned.length > 0) {
    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 本日放棄したTodo（${todosData.abandoned.length}件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    todosData.abandoned.forEach((todo, i) => {
      emailContent += createTodoItemText(i + 1, todo, 'abandoned');
    });
  }

  emailContent += `\n━━━━━━━━━━━━━━━
本邮件由 Dodo Todo App 自动发送`;

  let emailHtml = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #6b46c1; margin-bottom: 8px;">【Dodo Todo】日次サマリー</h2>
  <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">${today}</p>

  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h3 style="color: #374151; font-size: 14px; margin: 0 0 12px; font-weight: bold;">📊 本日の集計</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">📝 作成</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #6b46c1;">${createdCount}件</p>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">⏰ 延期</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #ea580c;">${delayedCount}件</p>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">⚠️ 期限切れ</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #9333ea;">${overdueCount}件</p>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">✅ 完了</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #16a34a;">${completedCount}件</p>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">❌ 放棄</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #dc2626;">${abandonedCount}件</p>
      </div>
      <div style="flex: 1; min-width: 120px;">
        <span style="color: #6b7280; font-size: 12px;">📈 完了率</span>
        <p style="margin: 2px 0 0; font-size: 18px; font-weight: bold; color: #16a34a;">${completionRate}%</p>
      </div>
    </div>
  </div>
`;

  if (todosData.created.length > 0) {
    emailHtml += `
  <div style="margin-bottom: 24px;">
    <h3 style="color: #6b46c1; font-size: 14px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #6b46c1;">
      📋 本日作成されたTodo（${todosData.created.length}件）
    </h3>
    ${todosData.created.map((todo, i) => createTodoItemHtml(i + 1, todo, 'created', '#6b46c1')).join('')}
  </div>
`;
  }

  if (todosData.delayed.length > 0) {
    emailHtml += `
  <div style="margin-bottom: 24px;">
    <h3 style="color: #ea580c; font-size: 14px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #ea580c;">
      ⏰ 本日延期されたTodo（${todosData.delayed.length}件）
    </h3>
    ${todosData.delayed.map((todo, i) => createTodoItemHtml(i + 1, todo, 'delayed', '#ea580c')).join('')}
  </div>
`;
  }

  if (todosData.overdue.length > 0) {
    emailHtml += `
  <div style="margin-bottom: 24px;">
    <h3 style="color: #9333ea; font-size: 14px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #9333ea;">
      ⚠️ 本日期限切れになったTodo（${todosData.overdue.length}件）
    </h3>
    ${todosData.overdue.map((todo, i) => createTodoItemHtml(i + 1, todo, 'overdue', '#9333ea')).join('')}
  </div>
`;
  }

  if (todosData.completed.length > 0) {
    emailHtml += `
  <div style="margin-bottom: 24px;">
    <h3 style="color: #16a34a; font-size: 14px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #16a34a;">
      ✅ 本日完了したTodo（${todosData.completed.length}件）
    </h3>
    ${todosData.completed.map((todo, i) => createTodoItemHtml(i + 1, todo, 'completed', '#16a34a')).join('')}
  </div>
`;
  }

  if (todosData.abandoned.length > 0) {
    emailHtml += `
  <div style="margin-bottom: 24px;">
    <h3 style="color: #dc2626; font-size: 14px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #dc2626;">
      ❌ 本日放棄したTodo（${todosData.abandoned.length}件）
    </h3>
    ${todosData.abandoned.map((todo, i) => createTodoItemHtml(i + 1, todo, 'abandoned', '#dc2626')).join('')}
  </div>
`;
  }

  emailHtml += `
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    本邮件由 Dodo Todo App 自动发送
  </p>
</div>
`;

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'todo-notice@cshrpro.com',
      to: recipients,
      subject: `【Dodo Todo】日次サマリー (${today})`,
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