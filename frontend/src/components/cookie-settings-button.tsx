"use client";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={() => window.dispatchEvent(new Event("ogrodio:open-cookie-settings"))}
      type="button"
    >
      Ustawienia cookies
    </button>
  );
}
