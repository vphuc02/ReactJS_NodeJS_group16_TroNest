const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return Boolean(
    process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.NODE_ENV !== 'test'
  );
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: String(process.env.SMTP_PASS).replace(/\s+/g, '')
    }
  });
};

/**
 * Gửi email chứa mã OTP đặt lại mật khẩu.
 * Nếu chưa cấu hình SMTP (môi trường dev/test), trả về mode 'dev-preview' kèm devOtp.
 */
const sendOtpEmail = async ({ to, fullName, otp, expiresInMinutes = 5 }) => {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV !== 'test') {
      console.info(
        `[TroNest Mail Preview] OTP khôi phục mật khẩu cho ${to}: ${otp} (hiệu lực ${expiresInMinutes} phút)`
      );
    }
    return {
      delivered: false,
      mode: 'dev-preview',
      devOtp: otp
    };
  }

  const transporter = createTransporter();
  const fromAddress =
    process.env.SMTP_FROM || `"TroNest" <${process.env.SMTP_USER}>`;

  const html = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #0f172a;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
        <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-bottom: 16px;">
          TroNest — Khôi phục mật khẩu
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
          Xin chào <strong>${fullName || to}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TroNest của bạn. Vui lòng sử dụng mã xác thực OTP dưới đây:
        </p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <span style="font-size: 30px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-variant-numeric: tabular-nums;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 8px;">
          • Mã xác thực có hiệu lực trong vòng <strong>${expiresInMinutes} phút</strong>.
        </p>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
          • Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `[TroNest] Mã OTP khôi phục mật khẩu của bạn: ${otp}`,
    html
  });

  return {
    delivered: true,
    mode: 'smtp'
  };
};

module.exports = {
  sendOtpEmail,
  hasSmtpConfig
};

