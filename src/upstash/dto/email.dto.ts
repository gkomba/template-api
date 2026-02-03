export class OTPByEmailDto {
    name: string;
    otp: string;
    to: string;
}


interface EmailTemplateProps {
  name: string;
  otp: string;
}

export function EmailTemplate({ name, otp }: EmailTemplateProps) {
  return (
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Olá, ${name}!</h2>
      <p>Você solicitou um código OTP para verificação. Use o código abaixo para continuar:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; border: 2px dashed #4CAF50; display: inline-block;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #777;">Se você não solicitou este código, por favor ignore este e-mail.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa;">Este é um e-mail automático, por favor não responda.</p>
    </div>`
  );
}