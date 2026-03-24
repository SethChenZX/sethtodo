import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
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
