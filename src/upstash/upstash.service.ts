import { Injectable } from '@nestjs/common';
import { Client } from '@upstash/qstash'
import { OTPByEmailDto } from './dto/email.dto';
import { EmailTemplate } from './dto/email.dto';
import 'dotenv/config';

const EMAIL_ENDPOINT = `https://infrawatch-i6cr.onrender.com/email`;

export const upstash = new Client({
    baseUrl: process.env.QSTASH_URL!,
    token: process.env.QSTASH_TOKEN!,
});

@Injectable()
export class UpstashService {

    async SendOTP_email(data: OTPByEmailDto) {
        try {
            await upstash.queue({ queueName: "email-otp-queue" }).enqueue({
                url: EMAIL_ENDPOINT,
                body: JSON.stringify({
                    from: process.env.EMAIL_ADDRESS_1,
                    to: data.to,
                    subject : "Seu código OTP de verificação",
                    body: EmailTemplate({ name: data.name, otp: data.otp }),
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (err) {
            console.error("Falha ao criar notificação de OTP com upstash:", err);
        }
    }
}