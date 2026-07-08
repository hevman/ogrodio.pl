"use client";

import { FormEvent, useEffect, useState } from "react";
import { Settings, Trash2, UserRound, UsersRound } from "lucide-react";
import { WeatherLocationPicker } from "@/components/app/weather-location-picker";
import { AppPageHeader } from "@/components/app/app-page-header";
import { AppShell } from "@/components/app/app-shell";
import { t } from "@/i18n";
import { me, type ShopUser } from "@/lib/auth-api";
import {
  acceptGardenInvitation,
  cancelGardenInvitation,
  createGardenInvitation,
  fetchGardenOrganization,
  fetchGardenOrganizationInvitations,
  fetchGardenMembers,
  fetchMyGardenInvitations,
  fetchGardenProfile,
  removeGardenMember,
  updateGardenMember,
  updateGardenOrganization,
  updateGardenProfile,
  type GardenInvitation,
  type GardenMember,
  type GardenOrganization,
  type GardenProfile,
} from "@/lib/garden-api";
import { canManageGardenOrganization, isBusinessGarden, roleLabel } from "@/lib/garden-permissions";

const emptyProfile: GardenProfile = {
  city: "",
  region: "",
  climateZone: "",
  soilType: "",
  latitude: null,
  longitude: null,
  weeklyDigestEnabled: true,
};

export default function SettingsPage() {
  const [user, setUser] = useState<ShopUser | null>(null);
  const [organization, setOrganization] = useState<GardenOrganization | null>(null);
  const [members, setMembers] = useState<GardenMember[]>([]);
  const [organizationInvitations, setOrganizationInvitations] = useState<GardenInvitation[]>([]);
  const [myInvitations, setMyInvitations] = useState<GardenInvitation[]>([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"worker" | "viewer">("worker");
  const [profile, setProfile] = useState<GardenProfile>(emptyProfile);
  const [status, setStatus] = useState(t("settings.loading"));
  const [isSaving, setIsSaving] = useState(false);
  const canManageOrganization = canManageGardenOrganization(organization);
  const businessGarden = isBusinessGarden(organization);

  useEffect(() => {
    Promise.all([
      me(),
      fetchGardenProfile(),
      fetchGardenOrganization(),
      fetchGardenMembers(),
      fetchMyGardenInvitations(),
      fetchGardenOrganizationInvitations().catch(() => ({ invitations: [] })),
    ])
      .then(([userData, profileData, organizationData, memberData, myInvitationData, organizationInvitationData]) => {
        setUser(userData.user);
        setProfile(profileData);
        setOrganization(organizationData);
        setMembers(memberData.members);
        setMyInvitations(myInvitationData.invitations);
        setOrganizationInvitations(organizationInvitationData.invitations);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("settings.loadFailed")));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    try {
      const saved = await updateGardenProfile(profile);
      setProfile(saved);
      setStatus(t("settings.saved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) return;
    setIsSaving(true);
    setStatus("");
    try {
      const saved = await updateGardenOrganization({
        name: organization.name,
        type: organization.type,
      });
      setOrganization(saved);
      setStatus(t("settings.organizationSaved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.organizationSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function refreshMembers() {
    const [data, myInvitationData, organizationInvitationData] = await Promise.all([
      fetchGardenMembers(),
      fetchMyGardenInvitations(),
      fetchGardenOrganizationInvitations().catch(() => ({ invitations: [] })),
    ]);
    setMembers(data.members);
    setMyInvitations(myInvitationData.invitations);
    setOrganizationInvitations(organizationInvitationData.invitations);
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    try {
      await createGardenInvitation({ email: memberEmail, role: memberRole });
      setMemberEmail("");
      setMemberRole("worker");
      await refreshMembers();
      setStatus(t("settings.invitationCreated"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.invitationCreateFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function acceptInvitation(invitation: GardenInvitation) {
    setStatus("");
    try {
      await acceptGardenInvitation(invitation.id);
      await refreshMembers();
      setStatus(t("settings.invitationAccepted"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.invitationAcceptFailed"));
    }
  }

  async function cancelInvitation(invitation: GardenInvitation) {
    setStatus("");
    try {
      await cancelGardenInvitation(invitation.id);
      await refreshMembers();
      setStatus(t("settings.invitationCancelled"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.invitationCancelFailed"));
    }
  }

  async function changeMemberRole(member: GardenMember, role: "worker" | "viewer") {
    setStatus("");
    try {
      await updateGardenMember(member.id, { role });
      await refreshMembers();
      setStatus(t("settings.memberRoleSaved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.memberRoleSaveFailed"));
    }
  }

  async function deleteMember(member: GardenMember) {
    setStatus("");
    try {
      await removeGardenMember(member.id);
      await refreshMembers();
      setStatus(t("settings.memberRemoved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("settings.memberRemoveFailed"));
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px]">
        <AppPageHeader badge={t("app.nav.settings")} subtitle={t("settings.pageSubtitle")} title={t("settings.pageTitle")} />
        <div className="grid gap-5">
        <article className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <UserRound className="h-4 w-4" />
            {t("settings.profile")}
          </p>
          <h1 className="mt-3 text-2xl font-black">{user?.name || t("settings.userFallback")}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">{user?.email}</p>
          {user?.phone ? <p className="mt-1 text-sm font-semibold text-slate-500">{user.phone}</p> : null}
        </article>

        <form className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm" onSubmit={saveOrganization}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <Settings className="h-4 w-4" />
            {t("settings.organization")}
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase text-slate-500">{t("settings.yourRole")}</p>
              <p className="mt-1 text-sm font-black text-slate-950">{roleLabel(organization?.role)}</p>
            </div>
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-500" disabled={!canManageOrganization} onChange={(event) => organization ? setOrganization({ ...organization, name: event.target.value }) : undefined} placeholder={t("settings.organizationNamePlaceholder")} value={organization?.name || ""} />
            <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-500" disabled={!canManageOrganization} onChange={(event) => organization ? setOrganization({ ...organization, type: event.target.value as "private" | "business" }) : undefined} value={organization?.type || "private"}>
              <option value="private">{t("settings.orgTypePrivate")}</option>
              <option value="business">{t("settings.orgTypeBusiness")}</option>
            </select>
            {!businessGarden ? (
              <p className="text-xs font-bold leading-5 text-slate-500">{t("settings.privateGardenHint")}</p>
            ) : null}
          </div>
          <button className="mt-4 h-11 w-full rounded-lg bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50" disabled={isSaving || !organization || !canManageOrganization} type="submit">
            {t("settings.saveOrganization")}
          </button>
          {!canManageOrganization ? <p className="mt-3 text-sm font-bold text-slate-500">{t("settings.ownerOnlyHint")}</p> : null}
        </form>

        <form className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm" onSubmit={saveProfile}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <Settings className="h-4 w-4" />
            {t("settings.gardenSettings")}
          </p>
          <div className="mt-4 grid gap-3">
            <WeatherLocationPicker
              onChange={(location) => setProfile({
                ...profile,
                city: location.city,
                region: location.region,
                latitude: location.latitude,
                longitude: location.longitude,
              })}
              value={{
                city: profile.city,
                region: profile.region,
                latitude: profile.latitude ?? null,
                longitude: profile.longitude ?? null,
              }}
            />
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setProfile({ ...profile, climateZone: event.target.value })} placeholder={t("settings.climatePlaceholder")} value={profile.climateZone} />
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setProfile({ ...profile, soilType: event.target.value })} placeholder={t("settings.soilPlaceholder")} value={profile.soilType} />
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <input
                checked={profile.weeklyDigestEnabled !== false}
                className="mt-1 h-4 w-4 rounded border-slate-300"
                onChange={(event) => setProfile({ ...profile, weeklyDigestEnabled: event.target.checked })}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-black text-slate-950">{t("settings.weeklyDigestLabel")}</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">{t("settings.weeklyDigestHint")}</span>
              </span>
            </label>
          </div>
          <button className="mt-4 h-11 w-full rounded-lg bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50" disabled={isSaving} type="submit">
            {t("common.save")}
          </button>
          {status ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-950">{status}</p> : null}
        </form>

        {businessGarden ? (
        <section className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <UsersRound className="h-4 w-4" />
            {t("settings.team")}
          </p>
          {canManageOrganization ? (
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={inviteMember}>
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setMemberEmail(event.target.value)} placeholder={t("settings.memberEmailPlaceholder")} value={memberEmail} />
            <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-600" onChange={(event) => setMemberRole(event.target.value as "worker" | "viewer")} value={memberRole}>
              <option value="worker">{t("app.roles.worker")}</option>
              <option value="viewer">{t("app.roles.viewer")}</option>
            </select>
            <button className="h-11 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-50" disabled={isSaving || !memberEmail} type="submit">
              {t("app.common.add")}
            </button>
          </form>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-600">
              {t("settings.viewerRoleHint", { role: roleLabel(organization?.role).toLowerCase() })}
            </p>
          )}

          {myInvitations.length ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-black uppercase text-amber-900">{t("settings.myInvitations")}</p>
              <div className="mt-3 grid gap-2">
                {myInvitations.map((invitation) => (
                  <article className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-3" key={invitation.id}>
                    <div>
                      <p className="text-sm font-black text-slate-950">{invitation.organizationName}</p>
                      <p className="text-xs font-bold uppercase text-slate-500">{roleLabel(invitation.role)}</p>
                    </div>
                    <button className="h-9 rounded-lg bg-emerald-700 px-3 text-xs font-black text-white" onClick={() => acceptInvitation(invitation)} type="button">
                      {t("settings.acceptInvitation")}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3">{t("settings.person")}</th>
                  <th className="border-b border-slate-200 px-4 py-3">{t("auth.email")}</th>
                  <th className="border-b border-slate-200 px-4 py-3">{t("app.common.role", { role: "" }).replace(/:\s*$/, "")}</th>
                  <th className="border-b border-slate-200 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr className="bg-white" key={member.id}>
                    <td className="border-b border-slate-100 px-4 py-3 font-black text-slate-950">{member.name}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-600">{member.email}</td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      {member.role === "owner" || !canManageOrganization ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black uppercase text-emerald-900">{roleLabel(member.role)}</span>
                      ) : (
                        <select className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold" onChange={(event) => changeMemberRole(member, event.target.value as "worker" | "viewer")} value={member.role}>
                          <option value="worker">{t("app.roles.worker")}</option>
                          <option value="viewer">{t("app.roles.viewer")}</option>
                        </select>
                      )}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-right">
                      {member.role !== "owner" && canManageOrganization ? (
                        <button aria-label={t("settings.removeMember")} className="inline-grid h-9 w-9 place-items-center rounded-lg text-red-700 hover:bg-red-50" onClick={() => deleteMember(member)} type="button">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {organizationInvitations.length && canManageOrganization ? (
            <div className="mt-5 rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase text-slate-500">{t("settings.orgInvitations")}</p>
              </div>
              <div className="grid divide-y divide-slate-100">
                {organizationInvitations.map((invitation) => (
                  <article className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={invitation.id}>
                    <div>
                      <p className="text-sm font-black text-slate-950">{invitation.email}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                        {roleLabel(invitation.role)} · {invitation.status === "pending" ? t("settings.pending") : invitation.status}
                      </p>
                    </div>
                    {invitation.status === "pending" ? (
                      <button className="h-9 rounded-lg border border-red-200 px-3 text-xs font-black text-red-700 hover:bg-red-50" onClick={() => cancelInvitation(invitation)} type="button">
                        {t("settings.cancel")}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        ) : null}
        </div>
      </div>
    </AppShell>
  );
}
