import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class GardenMailService {
  private readonly logger = new Logger(GardenMailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST || "";
    if (!host) return null;

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
        : undefined,
    });
    return this.transporter;
  }

  async send(payload: MailPayload) {
    const from = process.env.SMTP_FROM || "Ogrodio <noreply@ogrodio.pl>";
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.log(`[mail] ${payload.to} — ${payload.subject}\n${payload.text}`);
      return { ok: true, mode: "log" as const };
    }

    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    return { ok: true, mode: "smtp" as const };
  }
}
