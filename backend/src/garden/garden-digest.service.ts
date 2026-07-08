import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { GardenAssistantService } from "./garden-assistant.service";
import { GardenMailService } from "./garden-mail.service";

function formatPlDate(value?: string | null) {
  if (!value) return "w tym miesiącu";
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "long" }).format(new Date(value));
}

function isOpenTask(task: { status?: string }) {
  return task.status !== "done" && task.status !== "skipped";
}

@Injectable()
export class GardenDigestService {
  private readonly logger = new Logger(GardenDigestService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly assistant: GardenAssistantService,
    private readonly mail: GardenMailService,
  ) {}

  async sendWeeklyDigestForAllUsers() {
    const users = await this.db.query(
      `SELECT users.id, users.email, users.name,
              COALESCE(profile.weekly_digest_enabled, TRUE) AS "weeklyDigestEnabled"
       FROM shop_users users
       LEFT JOIN user_garden_profiles profile ON profile.user_id = users.id
       WHERE users.email <> ''`,
    );

    let sent = 0;
    let skipped = 0;

    for (const row of users.rows) {
      if (!row.weeklyDigestEnabled) {
        skipped += 1;
        continue;
      }
      const result = await this.sendWeeklyDigestForUser(Number(row.id), String(row.email), String(row.name || ""));
      if (result.sent) sent += 1;
      else skipped += 1;
    }

    this.logger.log(`Weekly digest finished: sent=${sent}, skipped=${skipped}`);
    return { sent, skipped, total: users.rows.length };
  }

  async sendWeeklyDigestForUser(userId: number, email?: string, name?: string) {
    const userRow = email
      ? { email, name: name || "" }
      : (await this.db.query(`SELECT email, name FROM shop_users WHERE id = $1`, [userId])).rows[0];
    if (!userRow?.email) return { sent: false, reason: "no-email" as const };

    const profile = await this.assistant.profile(userId);
    if (profile.weeklyDigestEnabled === false) return { sent: false, reason: "disabled" as const };

    const month = new Date().getMonth() + 1;
    const taskPayload = await this.assistant.tasks(userId, month);
    const openTasks = (taskPayload.tasks || []).filter(isOpenTask);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekTasks = openTasks.filter((task: any) => {
      if (!task.dueDate) return task.source === "seasonal";
      const due = new Date(String(task.dueDate).slice(0, 10));
      return due >= today && due <= weekEnd;
    }).slice(0, 8);

    if (!weekTasks.length) return { sent: false, reason: "no-tasks" as const };

    const appUrl = (process.env.APP_PUBLIC_URL || "http://app.ogrodio.localhost").replace(/\/$/, "");
    const greeting = userRow.name ? `Cześć ${userRow.name},` : "Cześć,";
    const lines = weekTasks.map((task: any) => {
      const when = formatPlDate(task.dueDate);
      const plant = task.plantName ? ` (${task.plantName})` : "";
      return `• ${task.title}${plant} — ${when}`;
    });

    const text = [
      greeting,
      "",
      "Oto prace w Twoim ogrodzie na najbliższy tydzień:",
      "",
      ...lines,
      "",
      `Otwórz aplikację: ${appUrl}/app`,
      "",
      "— Ogrodio · Mój ogród (beta)",
      "Wyłącz przypomnienia w ustawieniach aplikacji.",
    ].join("\n");

    const html = `
      <p>${greeting}</p>
      <p>Oto prace w Twoim ogrodzie na najbliższy tydzień:</p>
      <ul>${weekTasks.map((task: any) => {
        const when = formatPlDate(task.dueDate);
        const plant = task.plantName ? ` <em>(${task.plantName})</em>` : "";
        return `<li><strong>${task.title}</strong>${plant} — ${when}</li>`;
      }).join("")}</ul>
      <p><a href="${appUrl}/app">Otwórz aplikację Ogrodio</a></p>
      <p style="color:#64748b;font-size:12px;">Wyłącz przypomnienia w ustawieniach aplikacji.</p>
    `;

    await this.mail.send({
      to: userRow.email,
      subject: "Twój ogród na ten tydzień — Ogrodio",
      text,
      html,
    });

    return { sent: true, tasks: weekTasks.length };
  }
}
