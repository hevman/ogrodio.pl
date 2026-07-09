import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { existsSync, readdirSync, readFileSync } from "fs";
import { mkdir } from "fs/promises";
import { join, resolve } from "path";
import { randomUUID } from "crypto";
import { DatabaseService } from "../database/database.service";

const sharp = require("sharp");

type PlantDefinition = {
  type: string;
  aliases?: string[];
  label: string;
  category: string;
  defaultName: string;
  articleKeywords: string[];
};

type TaskTemplate = {
  plantTypes: string[];
  months: number[];
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  kind: "watering" | "fertilizing" | "cutting" | "inspection" | "protection" | "custom";
};

type PlantCatalogJson = {
  slug: string;
  appAliases?: string[];
  name: string;
  group: string;
  summary: string;
  tags?: string[];
  water?: string;
  calendar?: {
    month: string;
    task: string;
    type: "start" | "care" | "harvest";
  }[];
  problems?: string[];
  relatedArticles?: { title: string; href: string }[];
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function templateId(task: TaskTemplate) {
  return `${task.kind}-${slug(task.title)}`;
}

const monthNumbers: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
};

function plantCatalogDir() {
  const candidates = [
    process.env.PLANT_CATALOG_DIR,
    join(process.cwd(), "content", "plants"),
    resolve(process.cwd(), "..", "frontend", "src", "content", "plants"),
    resolve(process.cwd(), "frontend", "src", "content", "plants"),
  ].filter(Boolean) as string[];
  return candidates.find((candidate) => existsSync(candidate));
}

function loadPlantCatalogJson() {
  const dir = plantCatalogDir();
  if (!dir) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as PlantCatalogJson)
    .filter((plant) => plant.slug && plant.name);
}

function articleKeywords(plant: PlantCatalogJson) {
  return Array.from(new Set([
    plant.slug,
    ...plant.slug.split("-"),
    plant.name.toLowerCase(),
    ...plant.name.toLowerCase().split(/\s+/),
    plant.group.toLowerCase(),
    ...(plant.tags || []),
    ...(plant.problems || []).flatMap((problem) => problem.toLowerCase().split(/\s+/)),
  ].map((keyword) => keyword.trim()).filter((keyword) => keyword.length >= 3)));
}

function taskKind(task: string, type: NonNullable<PlantCatalogJson["calendar"]>[number]["type"]): TaskTemplate["kind"] {
  const value = task.toLowerCase();
  if (value.includes("podle")) return "watering";
  if (value.includes("nawo") || value.includes("kompost")) return "fertilizing";
  if (value.includes("ci\u0119") || value.includes("cie") || value.includes("przyci")) return "cutting";
  if (value.includes("kontrol") || value.includes("obserw") || value.includes("sprawd")) return "inspection";
  if (value.includes("okry") || value.includes("zabezpie") || value.includes("mroz")) return "protection";
  if (type === "care") return "inspection";
  return "custom";
}

function taskPriority(kind: TaskTemplate["kind"], type: NonNullable<PlantCatalogJson["calendar"]>[number]["type"]): TaskTemplate["priority"] {
  if (kind === "watering" || kind === "protection") return "high";
  if (type === "harvest") return "medium";
  return "medium";
}

function plantTypes(plant: PlantCatalogJson) {
  return [plant.slug, ...(plant.appAliases || [])];
}

const PLANT_CATALOG = loadPlantCatalogJson();

const PLANTS: PlantDefinition[] = PLANT_CATALOG.map((plant) => ({
  type: plant.slug,
  aliases: plant.appAliases || [],
  label: plant.name,
  category: plant.group,
  defaultName: plant.name,
  articleKeywords: articleKeywords(plant),
}));

function plantDefinitionForType(type: string) {
  return PLANTS.find((plant) => plant.type === type || (plant.aliases || []).includes(type));
}

const TASKS: TaskTemplate[] = PLANT_CATALOG.flatMap((plant) =>
  (plant.calendar || []).flatMap((entry) => {
    const month = monthNumbers[entry.month];
    if (!month) return [];
    const kind = taskKind(entry.task, entry.type);
    return [{
      plantTypes: plantTypes(plant),
      months: [month],
      title: entry.task,
      description: `${plant.name}: ${entry.task}. ${plant.summary}`,
      priority: taskPriority(kind, entry.type),
      kind,
    }];
  }),
);
@Injectable()
export class GardenAssistantService {
  constructor(private readonly db: DatabaseService) {}

  catalog() {
    return { plants: PLANTS };
  }

  async organization(userId: number) {
    return this.ensureDefaultOrganization(userId);
  }

  async updateOrganization(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    if (organization.role !== "owner") {
      throw new BadRequestException("Tylko właściciel może zmienić organizację");
    }
    const name = String(body?.name || organization.name).trim();
    const type = String(body?.type || organization.type).trim();
    if (!["private", "business"].includes(type)) {
      throw new BadRequestException("Nieprawidlowy typ organizacji");
    }
    const result = await this.db.query(
      `UPDATE garden_organizations
       SET name = $3, type = $4, updated_at = NOW()
       WHERE id = $1 AND owner_user_id = $2
       RETURNING id, name, type, owner_user_id AS "ownerUserId"`,
      [organization.id, userId, name || organization.name, type],
    );
    return { ...result.rows[0], role: organization.role };
  }

  async members(userId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT users.id, users.email, users.name, users.phone, member.role, member.created_at AS "createdAt"
       FROM garden_memberships member
       JOIN shop_users users ON users.id = member.user_id
       WHERE member.organization_id = $1
       ORDER BY CASE member.role WHEN 'owner' THEN 0 WHEN 'worker' THEN 1 ELSE 2 END, users.name ASC`,
      [organization.id],
    );
    return result.rows;
  }

  async addMember(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);

    const email = String(body?.email || "").trim().toLowerCase();
    const role = this.normalizeMemberRole(body?.role || "worker");
    if (!email) throw new BadRequestException("Podaj email uzytkownika");

    const user = await this.db.query(`SELECT id FROM shop_users WHERE email = $1 LIMIT 1`, [email]);
    if (!user.rows[0]) {
      return this.createInvitation(userId, { email, role });
    }
    if (Number(user.rows[0].id) === userId) {
      throw new BadRequestException("Jestes juz czlonkiem tej organizacji");
    }

    await this.db.query(
      `INSERT INTO garden_memberships (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role`,
      [organization.id, user.rows[0].id, role],
    );
    return this.memberById(organization.id, user.rows[0].id);
  }

  async invitations(userId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);
    const result = await this.db.query(
      `SELECT invitation.id, invitation.email, invitation.role, invitation.token, invitation.status,
              invitation.expires_at AS "expiresAt", invitation.accepted_at AS "acceptedAt",
              invitation.created_at AS "createdAt", invited.name AS "invitedByName",
              accepted.name AS "acceptedByName"
       FROM garden_invitations invitation
       LEFT JOIN shop_users invited ON invited.id = invitation.invited_by
       LEFT JOIN shop_users accepted ON accepted.id = invitation.accepted_by
       WHERE invitation.organization_id = $1
       ORDER BY invitation.created_at DESC`,
      [organization.id],
    );
    return result.rows;
  }

  async createInvitation(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);
    const email = String(body?.email || "").trim().toLowerCase();
    const role = this.normalizeMemberRole(body?.role || "worker");
    if (!email) throw new BadRequestException("Podaj email zapraszanej osoby");

    const user = await this.db.query(`SELECT id FROM shop_users WHERE email = $1 LIMIT 1`, [email]);
    if (user.rows[0]) {
      const existingMember = await this.db.query(
        `SELECT user_id FROM garden_memberships WHERE organization_id = $1 AND user_id = $2 LIMIT 1`,
        [organization.id, user.rows[0].id],
      );
      if (existingMember.rows[0]) {
        throw new BadRequestException("Ten uzytkownik jest juz w organizacji");
      }
    }

    const result = await this.db.query(
      `INSERT INTO garden_invitations (organization_id, email, role, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '14 days')
       RETURNING id, email, role, token, status, expires_at AS "expiresAt", created_at AS "createdAt"`,
      [organization.id, email, role, randomUUID(), userId],
    );
    return result.rows[0];
  }

  async cancelInvitation(userId: number, id: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);
    const result = await this.db.query(
      `UPDATE garden_invitations
       SET status = 'cancelled', updated_at = NOW()
       WHERE organization_id = $1 AND id = $2 AND status = 'pending'
       RETURNING id, email, role, token, status, expires_at AS "expiresAt", created_at AS "createdAt"`,
      [organization.id, id],
    );
    if (!result.rows[0]) throw new NotFoundException("Nie znaleziono aktywnego zaproszenia");
    return result.rows[0];
  }

  async myInvitations(userId: number) {
    const user = await this.db.query(`SELECT email FROM shop_users WHERE id = $1 LIMIT 1`, [userId]);
    const email = String(user.rows[0]?.email || "").toLowerCase();
    const result = await this.db.query(
      `SELECT invitation.id, invitation.email, invitation.role, invitation.token, invitation.status,
              invitation.expires_at AS "expiresAt", invitation.created_at AS "createdAt",
              org.name AS "organizationName", org.type AS "organizationType"
       FROM garden_invitations invitation
       JOIN garden_organizations org ON org.id = invitation.organization_id
       WHERE invitation.email = $1
         AND invitation.status = 'pending'
         AND invitation.expires_at > NOW()
       ORDER BY invitation.created_at DESC`,
      [email],
    );
    return result.rows;
  }

  async acceptInvitation(userId: number, id: number) {
    const user = await this.db.query(`SELECT email FROM shop_users WHERE id = $1 LIMIT 1`, [userId]);
    const email = String(user.rows[0]?.email || "").toLowerCase();
    const invitation = await this.db.query(
      `SELECT id, organization_id AS "organizationId", email, role, status
       FROM garden_invitations
       WHERE id = $1 AND email = $2 AND status = 'pending' AND expires_at > NOW()
       LIMIT 1`,
      [id, email],
    );
    if (!invitation.rows[0]) throw new NotFoundException("Nie znaleziono aktywnego zaproszenia");
    await this.db.query(
      `INSERT INTO garden_memberships (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role`,
      [invitation.rows[0].organizationId, userId, invitation.rows[0].role],
    );
    const result = await this.db.query(
      `UPDATE garden_invitations
       SET status = 'accepted', accepted_by = $2, accepted_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, role, status, accepted_at AS "acceptedAt"`,
      [id, userId],
    );
    return result.rows[0];
  }

  async notifications(userId: number) {
    const organization = await this.currentOrganization(userId);
    const invitations = await this.myInvitations(userId);
    const weatherAlerts = await this.weather(userId).then((data) => data.alerts).catch(() => []);
    const assignedTasks = organization ? await this.db.query(
      `SELECT id::TEXT, title, priority, due_date AS "dueDate", status
       FROM garden_tasks
       WHERE organization_id = $1
         AND assigned_user_id = $2
         AND status = 'open'
         AND (due_date IS NULL OR due_date <= CURRENT_DATE + INTERVAL '7 days')
       ORDER BY due_date NULLS LAST, created_at DESC
       LIMIT 8`,
      [organization.id, userId],
    ) : { rows: [] };
    const overdueTasks = organization ? await this.db.query(
      `SELECT id::TEXT, title, priority, due_date AS "dueDate", status
       FROM garden_tasks
       WHERE organization_id = $1
         AND status = 'open'
         AND due_date < CURRENT_DATE
       ORDER BY due_date ASC
       LIMIT 8`,
      [organization.id],
    ) : { rows: [] };
    const todayTasks = organization ? await this.db.query(
      `SELECT id::TEXT, title, priority, due_date AS "dueDate", status
       FROM garden_tasks
       WHERE organization_id = $1
         AND status = 'open'
         AND due_date = CURRENT_DATE
       ORDER BY priority DESC, created_at DESC
       LIMIT 8`,
      [organization.id],
    ) : { rows: [] };
    const journal = organization ? await this.db.query(
      `SELECT entry.id::TEXT, entry.title, entry.happened_at AS "happenedAt",
              plant.display_name AS "plantName", author.name AS "authorName"
       FROM garden_journal_entries entry
       LEFT JOIN user_garden_plants plant ON plant.id = entry.plant_id
       LEFT JOIN shop_users author ON author.id = entry.author_user_id
       WHERE entry.organization_id = $1
         AND entry.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY entry.created_at DESC
       LIMIT 8`,
      [organization.id],
    ) : { rows: [] };
    const plants = organization ? await this.db.query(
      `SELECT id::TEXT, display_name AS "displayName", location, status, health_status AS "healthStatus"
       FROM user_garden_plants
       WHERE organization_id = $1
         AND (status IN ('problem', 'observation') OR health_status IN ('issue', 'watch', 'quarantine'))
       ORDER BY updated_at DESC
       LIMIT 8`,
      [organization.id],
    ) : { rows: [] };
    const items = [
      ...invitations.map((invitation: any) => ({
        id: `invitation-${invitation.id}`,
        type: "invitation",
        priority: "high",
        title: `Zaproszenie: ${invitation.organizationName}`,
        description: invitation.role === "worker" ? "Rola: pracownik" : "Rola: obserwator",
        href: "/ustawienia",
        createdAt: invitation.createdAt,
      })),
      ...overdueTasks.rows.map((task: any) => ({
        id: `task-overdue-${task.id}`,
        type: "task",
        priority: "high",
        title: `Zalegle: ${task.title}`,
        description: task.dueDate ? `Termin: ${String(task.dueDate).slice(0, 10)}` : "Zadanie bez terminu",
        href: `/tasks/${task.id}`,
        createdAt: task.dueDate,
      })),
      ...todayTasks.rows.map((task: any) => ({
        id: `task-today-${task.id}`,
        type: "task",
        priority: task.priority || "medium",
        title: `Dzisiaj: ${task.title}`,
        description: task.dueDate ? `Termin: ${String(task.dueDate).slice(0, 10)}` : "Zadanie na dzisiaj",
        href: `/tasks/${task.id}`,
        createdAt: task.dueDate,
      })),
      ...assignedTasks.rows.map((task: any) => ({
        id: `task-assigned-${task.id}`,
        type: "task",
        priority: task.priority || "medium",
        title: task.title,
        description: task.dueDate ? `Termin: ${String(task.dueDate).slice(0, 10)}` : "Zadanie bez terminu",
        href: `/tasks/${task.id}`,
        createdAt: task.dueDate,
      })),
      ...plants.rows.map((plant: any) => ({
        id: `plant-${plant.id}`,
        type: "plant",
        priority: plant.status === "problem" || plant.healthStatus === "issue" ? "high" : "medium",
        title: `Sprawdz rosline: ${plant.displayName}`,
        description: plant.location || "Roslina wymaga uwagi",
        href: `/plants/${plant.id}`,
        createdAt: new Date().toISOString(),
      })),
      ...journal.rows.map((entry: any) => ({
        id: `journal-${entry.id}`,
        type: "journal",
        priority: "low",
        title: entry.title,
        description: [entry.authorName, entry.plantName].filter(Boolean).join(" - ") || "Nowy wpis dziennika",
        href: `/journal/${entry.id}`,
        createdAt: entry.happenedAt,
      })),
      ...weatherAlerts,
    ];
    return { unreadCount: items.length, items };
  }

  async updateMember(userId: number, memberId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);
    if (memberId === Number(organization.ownerUserId)) {
      throw new BadRequestException("Nie można zmienić roli właściciela");
    }
    const role = this.normalizeMemberRole(body?.role || "worker");
    const result = await this.db.query(
      `UPDATE garden_memberships
       SET role = $3
       WHERE organization_id = $1 AND user_id = $2
       RETURNING user_id`,
      [organization.id, memberId, role],
    );
    if (!result.rows.length) throw new NotFoundException("Nie znaleziono czlonka organizacji");
    return this.memberById(organization.id, memberId);
  }

  async removeMember(userId: number, memberId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertOwner(organization);
    if (memberId === Number(organization.ownerUserId)) {
      throw new BadRequestException("Nie można usunąć właściciela organizacji");
    }
    await this.db.query(
      `UPDATE garden_tasks SET assigned_user_id = NULL WHERE organization_id = $1 AND assigned_user_id = $2`,
      [organization.id, memberId],
    );
    const result = await this.db.query(
      `DELETE FROM garden_memberships WHERE organization_id = $1 AND user_id = $2 RETURNING user_id`,
      [organization.id, memberId],
    );
    if (!result.rows.length) throw new NotFoundException("Nie znaleziono czlonka organizacji");
    return { ok: true };
  }

  private assertOwner(organization: any) {
    if (organization.role !== "owner") {
      throw new BadRequestException("Tylko właściciel może zarządzać organizacją");
    }
  }

  private assertCanWrite(organization: any) {
    if (!["owner", "worker"].includes(String(organization.role))) {
      throw new BadRequestException("Brak uprawnien do edycji w tej organizacji");
    }
  }

  private normalizeMemberRole(role: string) {
    const value = String(role || "worker").trim();
    if (!["worker", "viewer"].includes(value)) {
      throw new BadRequestException("Nieprawidłowa rola członka");
    }
    return value;
  }

  private async memberById(organizationId: number, memberId: number) {
    const result = await this.db.query(
      `SELECT users.id, users.email, users.name, users.phone, member.role, member.created_at AS "createdAt"
       FROM garden_memberships member
       JOIN shop_users users ON users.id = member.user_id
       WHERE member.organization_id = $1 AND member.user_id = $2
       LIMIT 1`,
      [organizationId, memberId],
    );
    if (!result.rows[0]) throw new NotFoundException("Nie znaleziono czlonka organizacji");
    return result.rows[0];
  }

  private async ensureAssignedMember(organizationId: number, assignedUserId: number | null) {
    if (!assignedUserId) return null;
    const result = await this.db.query(
      `SELECT user_id FROM garden_memberships WHERE organization_id = $1 AND user_id = $2 LIMIT 1`,
      [organizationId, assignedUserId],
    );
    if (!result.rows[0]) {
      throw new BadRequestException("Przypisana osoba nie nalezy do tej organizacji");
    }
    return assignedUserId;
  }

  private async ensureDefaultOrganization(userId: number) {
    const existing = await this.db.query(
      `SELECT org.id, org.name, org.type, org.owner_user_id AS "ownerUserId", member.role
       FROM garden_organizations org
       JOIN garden_memberships member ON member.organization_id = org.id
       WHERE member.user_id = $1
       ORDER BY member.created_at DESC, CASE WHEN member.role = 'owner' THEN 0 ELSE 1 END
       LIMIT 1`,
      [userId],
    );
    if (existing.rows[0]) return existing.rows[0];

    const user = await this.db.query(`SELECT name, email FROM shop_users WHERE id = $1 LIMIT 1`, [userId]);
    const label = user.rows[0]?.name || user.rows[0]?.email || "Moj ogrod";
    const created = await this.db.query(
      `INSERT INTO garden_organizations (owner_user_id, name, type)
       VALUES ($1, $2, 'private')
       RETURNING id, name, type, owner_user_id AS "ownerUserId"`,
      [userId, `${label} - ogrod`],
    );
    await this.db.query(
      `INSERT INTO garden_memberships (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [created.rows[0].id, userId],
    );
    await this.db.query(
      `UPDATE user_garden_plants SET organization_id = $1 WHERE user_id = $2 AND organization_id IS NULL`,
      [created.rows[0].id, userId],
    );
    return { ...created.rows[0], role: "owner" };
  }

  private async currentOrganization(userId: number) {
    const existing = await this.db.query(
      `SELECT org.id, org.name, org.type, org.owner_user_id AS "ownerUserId", member.role
       FROM garden_organizations org
       JOIN garden_memberships member ON member.organization_id = org.id
       WHERE member.user_id = $1
       ORDER BY member.created_at DESC, CASE WHEN member.role = 'owner' THEN 0 ELSE 1 END
       LIMIT 1`,
      [userId],
    );
    return existing.rows[0] || null;
  }

  async profile(userId: number) {
    const result = await this.db.query(
      `SELECT city, region, climate_zone AS "climateZone", soil_type AS "soilType",
              latitude::FLOAT AS latitude, longitude::FLOAT AS longitude,
              weekly_digest_enabled AS "weeklyDigestEnabled",
              updated_at AS "updatedAt"
       FROM user_garden_profiles
       WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0] || {
      city: "",
      region: "",
      climateZone: "",
      soilType: "",
      latitude: null,
      longitude: null,
      weeklyDigestEnabled: true,
    };
  }

  async updateProfile(userId: number, body: any) {
    const city = String(body?.city || "").trim();
    const region = String(body?.region || "").trim();
    const climateZone = String(body?.climateZone || body?.climate_zone || "").trim();
    const soilType = String(body?.soilType || body?.soil_type || "").trim();
    const latitude = body?.latitude === "" || body?.latitude === undefined || body?.latitude === null ? null : Number(body.latitude);
    const longitude = body?.longitude === "" || body?.longitude === undefined || body?.longitude === null ? null : Number(body.longitude);
    const weeklyDigestEnabled = body?.weeklyDigestEnabled === undefined
      ? true
      : Boolean(body.weeklyDigestEnabled ?? body.weekly_digest_enabled);
    if (latitude !== null && (Number.isNaN(latitude) || latitude < -90 || latitude > 90)) {
      throw new BadRequestException("Nieprawidlowa szerokosc geograficzna");
    }
    if (longitude !== null && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
      throw new BadRequestException("Nieprawidlowa dlugosc geograficzna");
    }

    const result = await this.db.query(
      `INSERT INTO user_garden_profiles (user_id, city, region, climate_zone, soil_type, latitude, longitude, weekly_digest_enabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET city = EXCLUDED.city,
                     region = EXCLUDED.region,
                     climate_zone = EXCLUDED.climate_zone,
                     soil_type = EXCLUDED.soil_type,
                     latitude = EXCLUDED.latitude,
                     longitude = EXCLUDED.longitude,
                     weekly_digest_enabled = EXCLUDED.weekly_digest_enabled,
                     updated_at = NOW()
       RETURNING city, region, climate_zone AS "climateZone", soil_type AS "soilType",
                 latitude::FLOAT AS latitude, longitude::FLOAT AS longitude,
                 weekly_digest_enabled AS "weeklyDigestEnabled",
                 updated_at AS "updatedAt"`,
      [userId, city, region, climateZone, soilType, latitude, longitude, weeklyDigestEnabled],
    );
    return result.rows[0];
  }

  async weather(userId: number) {
    const profile = await this.profile(userId);
    const locationLabel = this.formatWeatherLocation(profile);

    if (profile.latitude === null || profile.latitude === undefined || profile.longitude === null || profile.longitude === undefined) {
      return {
        profile,
        locationLabel: null,
        current: null,
        forecast: [],
        alerts: [{
          id: "weather-location-missing",
          type: "weather",
          priority: "medium",
          title: "Wybierz miasto dla prognozy pogody",
          description: "Ustaw lokalizację ogrodu w ustawieniach — wpisz nazwę miasta i wybierz z listy.",
          href: "/ustawienia",
          createdAt: new Date().toISOString(),
        }],
      };
    }

    const { current, forecast } = await this.fetchWeatherForecast(Number(profile.latitude), Number(profile.longitude));
    return {
      profile,
      locationLabel,
      current,
      forecast,
      alerts: this.weatherAlerts(forecast),
    };
  }

  async searchWeatherLocations(query: string) {
    const name = String(query || "").trim();
    if (name.length < 2) return [];

    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", name);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "pl");
    url.searchParams.set("countryCode", "PL");

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestException("Nie udało się wyszukać miasta");
    }

    const data: any = await response.json();
    return (data?.results || []).map((item: any) => ({
      name: String(item.name || "").trim(),
      region: String(item.admin1 || "").trim(),
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
    })).filter((item: any) => item.name && !Number.isNaN(item.latitude) && !Number.isNaN(item.longitude));
  }

  private formatWeatherLocation(profile: any) {
    const city = String(profile?.city || "").trim();
    if (!city) return null;
    const region = String(profile?.region || "").trim();
    return region ? `${city}, ${region}` : city;
  }

  private async fetchWeatherForecast(latitude: number, longitude: number) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,weather_code,precipitation,wind_speed_10m");
    url.searchParams.set("daily", "weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,wind_speed_10m_max");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "Europe/Warsaw");

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestException("Nie udało się pobrać prognozy pogody");
    }
    const data: any = await response.json();
    const daily = data?.daily || {};
    const days: string[] = daily.time || [];
    const forecast = days.map((date, index) => ({
      date,
      weatherCode: Number(daily.weather_code?.[index] ?? 0),
      temperatureMin: Number(daily.temperature_2m_min?.[index] ?? 0),
      temperatureMax: Number(daily.temperature_2m_max?.[index] ?? 0),
      precipitation: Number(daily.precipitation_sum?.[index] ?? 0),
      windSpeedMax: Number(daily.wind_speed_10m_max?.[index] ?? 0),
    }));

    const currentData = data?.current;
    const current = currentData ? {
      temperature: Number(currentData.temperature_2m ?? 0),
      weatherCode: Number(currentData.weather_code ?? 0),
      precipitation: Number(currentData.precipitation ?? 0),
      windSpeed: Number(currentData.wind_speed_10m ?? 0),
    } : null;

    return { current, forecast };
  }

  private weatherAlerts(forecast: any[]) {
    const alerts: any[] = [];
    const nextFrost = forecast.find((day) => Number(day.temperatureMin) <= 0);
    const dryDays = forecast.filter((day) => Number(day.precipitation) < 1).length;
    const rainyDays = forecast.filter((day) => Number(day.precipitation) >= 8);
    const windyDay = forecast.find((day) => Number(day.windSpeedMax) >= 45);

    if (nextFrost) {
      alerts.push({
        id: `weather-frost-${nextFrost.date}`,
        type: "weather",
        priority: "high",
        title: "Ryzyko przymrozku",
        description: `${nextFrost.date}: minimum ${nextFrost.temperatureMin}C. Zabezpiecz wrazliwe rosliny i kwiaty.`,
        href: "/plants",
        createdAt: nextFrost.date,
      });
    }
    if (dryDays >= 5) {
      alerts.push({
        id: "weather-dry-week",
        type: "weather",
        priority: "high",
        title: "Suchy tydzien w prognozie",
        description: "Przez wiekszosc tygodnia prognoza pokazuje malo opadow. Sprawdz borowki, mlode nasadzenia i rosliny w pojemnikach.",
        href: "/calendar",
        createdAt: new Date().toISOString(),
      });
    }
    if (rainyDays.length >= 2) {
      alerts.push({
        id: "weather-rain-disease-risk",
        type: "weather",
        priority: "medium",
        title: "Wilgotny okres - kontrola chorob",
        description: "Kilka dni z wiekszymi opadami. Po deszczu sprawdz plamy na lisciach, szara plesn i zamieranie owocow.",
        href: "/tasks",
        createdAt: rainyDays[0].date,
      });
    }
    if (windyDay) {
      alerts.push({
        id: `weather-wind-${windyDay.date}`,
        type: "weather",
        priority: "medium",
        title: "Silniejszy wiatr w prognozie",
        description: `${windyDay.date}: wiatr do ${windyDay.windSpeedMax} km/h. Sprawdz podpory, tunele i mlode drzewa.`,
        href: "/plants",
        createdAt: windyDay.date,
      });
    }
    return alerts;
  }

  async plants(userId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT id, plant_type AS "plantType", display_name AS "displayName", location,
              location_id AS "locationId", status, quantity, variety,
              batch_code AS "batchCode", health_status AS "healthStatus",
              planted_at AS "plantedAt", notes, created_at AS "createdAt"
       FROM user_garden_plants
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organization.id],
    );
    return result.rows;
  }

  async plant(userId: number, id: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT plant.id, plant.plant_type AS "plantType", plant.display_name AS "displayName",
              plant.location, plant.location_id AS "locationId", loc.name AS "locationName",
              plant.status, plant.quantity, plant.variety, plant.batch_code AS "batchCode",
              plant.health_status AS "healthStatus", plant.planted_at AS "plantedAt",
              plant.notes, plant.created_at AS "createdAt", plant.updated_at AS "updatedAt"
       FROM user_garden_plants plant
       LEFT JOIN garden_locations loc ON loc.id = plant.location_id
       WHERE plant.organization_id = $1 AND plant.id = $2
       LIMIT 1`,
      [organization.id, id],
    );
    if (!result.rows[0]) {
      throw new NotFoundException("Nie znaleziono rosliny");
    }
    return result.rows[0];
  }

  async addPlant(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const plantType = String(body?.plantType || body?.plant_type || "").trim();
    const definition = plantDefinitionForType(plantType);
    if (!definition) {
      throw new BadRequestException("Wybierz rosline z katalogu");
    }

    const displayName = String(body?.displayName || body?.display_name || definition.defaultName).trim();
    const location = String(body?.location || "").trim();
    const locationId = body?.locationId || body?.location_id || null;
    const notes = String(body?.notes || "").trim();
    const plantedAt = body?.plantedAt || body?.planted_at || null;
    const quantity = Math.max(1, Number(body?.quantity || 1));
    const status = String(body?.status || "active").trim() || "active";
    const variety = String(body?.variety || "").trim();
    const batchCode = String(body?.batchCode || body?.batch_code || "").trim();
    const healthStatus = String(body?.healthStatus || body?.health_status || "good").trim() || "good";

    const result = await this.db.query(
      `INSERT INTO user_garden_plants (user_id, organization_id, plant_type, display_name, location, location_id, planted_at, notes, quantity, status, variety, batch_code, health_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, plant_type AS "plantType", display_name AS "displayName", location,
                 location_id AS "locationId", status, quantity, variety,
                 batch_code AS "batchCode", health_status AS "healthStatus",
                 planted_at AS "plantedAt", notes, created_at AS "createdAt"`,
      [userId, organization.id, plantType, displayName || definition.defaultName, location, locationId || null, plantedAt || null, notes, quantity, status, variety, batchCode, healthStatus],
    );
    return result.rows[0];
  }

  async updatePlant(userId: number, id: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const existing = await this.plant(userId, id);

    const displayName = String(body?.displayName ?? body?.display_name ?? existing.displayName).trim();
    if (!displayName) {
      throw new BadRequestException("Podaj nazwe rosliny");
    }
    const status = String(body?.status ?? existing.status ?? "active").trim() || "active";
    const healthStatus = String(body?.healthStatus ?? body?.health_status ?? existing.healthStatus ?? "good").trim() || "good";
    const quantity = Math.max(1, Number(body?.quantity ?? existing.quantity ?? 1));
    const location = String(body?.location ?? existing.location ?? "").trim();
    const locationId = body?.locationId ?? body?.location_id ?? existing.locationId ?? null;
    const variety = String(body?.variety ?? existing.variety ?? "").trim();
    const batchCode = String(body?.batchCode ?? body?.batch_code ?? existing.batchCode ?? "").trim();
    const plantedAt = body?.plantedAt ?? body?.planted_at ?? existing.plantedAt ?? null;
    const notes = String(body?.notes ?? existing.notes ?? "").trim();

    const result = await this.db.query(
      `UPDATE user_garden_plants
       SET display_name = $3,
           location = $4,
           location_id = $5,
           planted_at = $6,
           notes = $7,
           quantity = $8,
           status = $9,
           variety = $10,
           batch_code = $11,
           health_status = $12,
           updated_at = NOW()
       WHERE organization_id = $1 AND id = $2
       RETURNING id`,
      [organization.id, id, displayName, location, locationId || null, plantedAt || null, notes, quantity, status, variety, batchCode, healthStatus],
    );
    if (!result.rows.length) {
      throw new NotFoundException("Nie znaleziono rosliny");
    }
    return this.plant(userId, id);
  }

  async removePlant(userId: number, id: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const result = await this.db.query(
      `DELETE FROM user_garden_plants WHERE organization_id = $1 AND id = $2 RETURNING id`,
      [organization.id, id],
    );
    if (!result.rows.length) {
      throw new NotFoundException("Nie znaleziono rosliny");
    }
    return { ok: true };
  }

  async tasks(userId: number, month = new Date().getMonth() + 1) {
    const organization = await this.ensureDefaultOrganization(userId);
    const plants = await this.plants(userId);
    const manual = await this.db.query(
      `SELECT task.id::TEXT, task.plant_id AS "plantId", plant.display_name AS "plantName",
              plant.plant_type AS "plantType", task.location_id AS "locationId",
              loc.name AS "locationName", task.assigned_user_id AS "assignedUserId",
              assigned.name AS "assignedUserName", assigned.email AS "assignedUserEmail",
              task.title, task.description, task.priority,
              task.kind, task.status, task.due_date AS "dueDate", task.repeat_rule AS "repeatRule",
              task.completed_at AS "completedAt", task.created_at AS "createdAt"
       FROM garden_tasks task
       LEFT JOIN user_garden_plants plant ON plant.id = task.plant_id
       LEFT JOIN garden_locations loc ON loc.id = task.location_id
       LEFT JOIN shop_users assigned ON assigned.id = task.assigned_user_id
       WHERE task.organization_id = $1
         AND ($2::INTEGER IS NULL OR EXTRACT(MONTH FROM task.due_date) = $2 OR task.due_date IS NULL)
       ORDER BY task.due_date NULLS LAST, task.created_at DESC`,
      [organization.id, month || null],
    );
    const activeTasks = plants.flatMap((plant: any) => {
      return TASKS
        .filter((task) => task.months.includes(month) && task.plantTypes.includes(plant.plantType))
        .map((task) => ({
          id: `${plant.id}-${task.kind}-${month}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          templateId: templateId(task),
          plantId: plant.id,
          plantName: plant.displayName,
          plantType: plant.plantType,
          month,
          title: task.title,
          description: task.description,
          priority: task.priority,
          kind: task.kind,
          status: "suggested",
          dueDate: null,
          source: "seasonal",
        }));
    });

    return {
      month,
      tasks: [...manual.rows.map((task) => ({ ...task, source: "manual" })), ...activeTasks]
        .sort((a: any, b: any) => priorityScore(b.priority) - priorityScore(a.priority)),
    };
  }

  async acceptSeasonalTask(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const plantId = Number(body?.plantId || body?.plant_id || 0);
    const month = Number(body?.month || new Date().getMonth() + 1);
    const id = String(body?.templateId || body?.template_id || "").trim();
    if (!plantId || !id) throw new BadRequestException("Brak danych rekomendacji");

    const plant = await this.plant(userId, plantId);
    const template = TASKS.find((task) =>
      templateId(task) === id &&
      task.months.includes(month) &&
      task.plantTypes.includes(plant.plantType),
    );
    if (!template) throw new NotFoundException("Nie znaleziono rekomendacji sezonowej");

    const year = new Date().getFullYear();
    const dueDate = body?.dueDate || body?.due_date || `${year}-${String(month).padStart(2, "0")}-01`;
    const existing = await this.db.query(
      `SELECT id::TEXT, plant_id AS "plantId", location_id AS "locationId", assigned_user_id AS "assignedUserId",
              title, description, kind, priority, status, due_date AS "dueDate", repeat_rule AS "repeatRule",
              created_at AS "createdAt"
       FROM garden_tasks
       WHERE organization_id = $1
         AND plant_id = $2
         AND title = $3
         AND kind = $4
         AND EXTRACT(MONTH FROM due_date) = $5
       LIMIT 1`,
      [organization.id, plant.id, template.title, template.kind, month],
    );
    if (existing.rows[0]) {
      return { ...existing.rows[0], source: "manual" };
    }

    const result = await this.db.query(
      `INSERT INTO garden_tasks (organization_id, plant_id, location_id, title, description, kind, priority, status, due_date, repeat_rule, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, 'seasonal', $9)
       RETURNING id::TEXT, plant_id AS "plantId", location_id AS "locationId", assigned_user_id AS "assignedUserId",
                 title, description, kind, priority, status, due_date AS "dueDate", repeat_rule AS "repeatRule",
                 created_at AS "createdAt"`,
      [
        organization.id,
        plant.id,
        plant.locationId || null,
        template.title,
        template.description,
        template.kind,
        template.priority,
        dueDate,
        userId,
      ],
    );
    return { ...result.rows[0], plantName: plant.displayName, plantType: plant.plantType, locationName: plant.locationName, source: "manual" };
  }

  async addTask(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const title = String(body?.title || "").trim();
    if (!title) throw new BadRequestException("Podaj nazwe zadania");
    const assignedUserId = await this.ensureAssignedMember(
      organization.id,
      body?.assignedUserId || body?.assigned_user_id ? Number(body?.assignedUserId || body?.assigned_user_id) : null,
    );

    const result = await this.db.query(
      `INSERT INTO garden_tasks (organization_id, plant_id, location_id, assigned_user_id, title, description, kind, priority, status, due_date, repeat_rule, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $10, $11)
       RETURNING id::TEXT, plant_id AS "plantId", location_id AS "locationId", assigned_user_id AS "assignedUserId", title, description, kind, priority, status,
                 due_date AS "dueDate", repeat_rule AS "repeatRule", created_at AS "createdAt"`,
      [
        organization.id,
        body?.plantId || body?.plant_id || null,
        body?.locationId || body?.location_id || null,
        assignedUserId,
        title,
        String(body?.description || "").trim(),
        String(body?.kind || "custom").trim() || "custom",
        String(body?.priority || "medium").trim() || "medium",
        body?.dueDate || body?.due_date || null,
        String(body?.repeatRule || body?.repeat_rule || "").trim(),
        userId,
      ],
    );
    const created = result.rows[0];
    if (!created.assignedUserId) return created;
    const member = await this.memberById(organization.id, Number(created.assignedUserId));
    return { ...created, assignedUserName: member.name, assignedUserEmail: member.email };
  }

  async task(userId: number, id: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT task.id::TEXT, task.plant_id AS "plantId", plant.display_name AS "plantName",
              plant.plant_type AS "plantType", task.location_id AS "locationId",
              loc.name AS "locationName", task.assigned_user_id AS "assignedUserId",
              assigned.name AS "assignedUserName", assigned.email AS "assignedUserEmail",
              task.title, task.description, task.priority,
              task.kind, task.status, task.due_date AS "dueDate", task.repeat_rule AS "repeatRule",
              task.completed_at AS "completedAt", task.created_at AS "createdAt",
              creator.name AS "createdByName"
       FROM garden_tasks task
       LEFT JOIN user_garden_plants plant ON plant.id = task.plant_id
       LEFT JOIN garden_locations loc ON loc.id = task.location_id
       LEFT JOIN shop_users assigned ON assigned.id = task.assigned_user_id
       LEFT JOIN shop_users creator ON creator.id = task.created_by
       WHERE task.organization_id = $1 AND task.id = $2
       LIMIT 1`,
      [organization.id, id],
    );
    if (!result.rows.length) throw new NotFoundException("Nie znaleziono zadania");
    return { ...result.rows[0], source: "manual" };
  }

  async updateTask(userId: number, id: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const status = String(body?.status || "").trim();
    if (status && !["open", "done", "skipped"].includes(status)) {
      throw new BadRequestException("Nieprawidlowy status zadania");
    }
    const hasAssignedUser = Object.prototype.hasOwnProperty.call(body || {}, "assignedUserId") || Object.prototype.hasOwnProperty.call(body || {}, "assigned_user_id");
    const assignedUserId = hasAssignedUser
      ? await this.ensureAssignedMember(organization.id, body?.assignedUserId || body?.assigned_user_id ? Number(body?.assignedUserId || body?.assigned_user_id) : null)
      : undefined;
    const result = await this.db.query(
      `UPDATE garden_tasks
       SET status = COALESCE(NULLIF($3, ''), status),
           assigned_user_id = CASE WHEN $4::BOOLEAN THEN $5 ELSE assigned_user_id END,
           completed_at = CASE WHEN COALESCE(NULLIF($3, ''), status) = 'done' THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE organization_id = $1 AND id = $2
       RETURNING id::TEXT, assigned_user_id AS "assignedUserId", status, completed_at AS "completedAt"`,
      [organization.id, id, status, hasAssignedUser, assignedUserId ?? null],
    );
    if (!result.rows.length) throw new NotFoundException("Nie znaleziono zadania");
    return result.rows[0];
  }

  async locations(userId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT id, name, kind, notes, created_at AS "createdAt"
       FROM garden_locations
       WHERE organization_id = $1
       ORDER BY name ASC`,
      [organization.id],
    );
    return result.rows;
  }

  async addLocation(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const name = String(body?.name || "").trim();
    if (!name) throw new BadRequestException("Podaj nazwe miejsca");
    const result = await this.db.query(
      `INSERT INTO garden_locations (organization_id, name, kind, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, kind, notes, created_at AS "createdAt"`,
      [organization.id, name, String(body?.kind || "garden").trim() || "garden", String(body?.notes || "").trim()],
    );
    return result.rows[0];
  }

  async journal(userId: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT entry.id, entry.plant_id AS "plantId", plant.display_name AS "plantName",
              entry.location_id AS "locationId", loc.name AS "locationName",
              entry.task_id AS "taskId", task.title AS "taskTitle",
              entry.author_user_id AS "authorUserId", author.name AS "authorName",
              entry.title, entry.body, entry.image_url AS "imageUrl",
              entry.happened_at AS "happenedAt", entry.created_at AS "createdAt"
       FROM garden_journal_entries entry
       LEFT JOIN user_garden_plants plant ON plant.id = entry.plant_id
       LEFT JOIN garden_locations loc ON loc.id = entry.location_id
       LEFT JOIN garden_tasks task ON task.id = entry.task_id
       LEFT JOIN shop_users author ON author.id = entry.author_user_id
       WHERE entry.organization_id = $1
       ORDER BY entry.happened_at DESC
       LIMIT 100`,
      [organization.id],
    );
    return result.rows;
  }

  async journalEntry(userId: number, id: number) {
    const organization = await this.ensureDefaultOrganization(userId);
    const result = await this.db.query(
      `SELECT entry.id, entry.plant_id AS "plantId", plant.display_name AS "plantName",
              entry.location_id AS "locationId", loc.name AS "locationName",
              entry.task_id AS "taskId", task.title AS "taskTitle",
              entry.author_user_id AS "authorUserId", author.name AS "authorName",
              entry.title, entry.body, entry.image_url AS "imageUrl",
              entry.happened_at AS "happenedAt", entry.created_at AS "createdAt"
       FROM garden_journal_entries entry
       LEFT JOIN user_garden_plants plant ON plant.id = entry.plant_id
       LEFT JOIN garden_locations loc ON loc.id = entry.location_id
       LEFT JOIN garden_tasks task ON task.id = entry.task_id
       LEFT JOIN shop_users author ON author.id = entry.author_user_id
       WHERE entry.organization_id = $1 AND entry.id = $2
       LIMIT 1`,
      [organization.id, id],
    );
    if (!result.rows.length) throw new NotFoundException("Nie znaleziono wpisu");
    return result.rows[0];
  }

  async addJournalEntry(userId: number, body: any) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    const title = String(body?.title || "").trim();
    if (!title) throw new BadRequestException("Podaj tytul wpisu");
    const taskId = body?.taskId || body?.task_id ? Number(body?.taskId || body?.task_id) : null;
    if (taskId) {
      const task = await this.db.query(
        `SELECT id FROM garden_tasks WHERE organization_id = $1 AND id = $2 LIMIT 1`,
        [organization.id, taskId],
      );
      if (!task.rows.length) throw new NotFoundException("Nie znaleziono zadania dla wpisu");
    }
    const result = await this.db.query(
      `INSERT INTO garden_journal_entries (organization_id, plant_id, location_id, task_id, author_user_id, title, body, image_url, happened_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))
       RETURNING id, plant_id AS "plantId", location_id AS "locationId", task_id AS "taskId", title, body, image_url AS "imageUrl",
                 happened_at AS "happenedAt", created_at AS "createdAt"`,
      [
        organization.id,
        body?.plantId || body?.plant_id || null,
        body?.locationId || body?.location_id || null,
        taskId,
        userId,
        title,
        String(body?.body || "").trim(),
        String(body?.imageUrl || body?.image_url || "").trim(),
        body?.happenedAt || body?.happened_at || null,
      ],
    );
    return result.rows[0];
  }

  async uploadJournalImage(userId: number, file?: Express.Multer.File) {
    const organization = await this.ensureDefaultOrganization(userId);
    this.assertCanWrite(organization);
    if (!file) {
      throw new BadRequestException("Brak pliku");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      throw new BadRequestException("Dozwolone sa tylko pliki JPG, PNG albo WebP");
    }

    const now = new Date();
    const monthPath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const relativeDir = `garden/org-${organization.id}/${monthPath}`;
    const uploadDir = join(process.cwd(), "uploads", relativeDir);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const outputPath = join(uploadDir, filename);
    await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    return {
      url: `/uploads/${relativeDir}/${filename}`,
      mimeType: "image/webp",
      size: file.size,
    };
  }

  async recommendations(userId: number) {
    const plants = await this.plants(userId);
    const plantTypes = Array.from(new Set(plants.map((plant: any) => plant.plantType)));
    const keywords = plantTypes.flatMap((type) => plantDefinitionForType(type)?.articleKeywords || []);

    if (!keywords.length) {
      const fallback = await this.db.query(
        `SELECT slug, title, topic, summary, reading_minutes AS "readingMinutes", cover_image AS "coverImage"
         FROM articles
         WHERE status = 'published'
         ORDER BY updated_at DESC
         LIMIT 5`,
      );
      return { articles: fallback.rows, matchedPlantTypes: [] };
    }

    const clauses: string[] = [];
    const values: string[] = [];
    keywords.forEach((keyword, index) => {
      values.push(`%${keyword}%`);
      clauses.push(`(slug ILIKE $${index + 1} OR title ILIKE $${index + 1} OR topic ILIKE $${index + 1} OR summary ILIKE $${index + 1})`);
    });

    const result = await this.db.query(
      `SELECT slug, title, topic, summary, reading_minutes AS "readingMinutes", cover_image AS "coverImage"
       FROM articles
       WHERE status = 'published'
         AND (${clauses.join(" OR ")})
       ORDER BY updated_at DESC
       LIMIT 6`,
      values,
    );
    return { articles: result.rows, matchedPlantTypes: plantTypes };
  }
}

function priorityScore(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}
