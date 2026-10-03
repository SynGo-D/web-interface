"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A contributor's avatar, derived rather than stored.
 *
 * GitHub serves any account's picture from its numeric id, which is
 * already kept with every analysis — so this costs no API call, needs no
 * extra column, and works for analyses attributed by the backfill just as
 * well as for new ones.
 *
 * GitLab has no equivalent stable URL from an id alone, so it falls back
 * to the initial until an avatar URL is carried through the webhook.
 */
export function avatarUrl(provider: string, providerUserId: string | null): string | null {
  if (!providerUserId) return null;

  if (provider === "github") {
    // No query string: next.config.ts pins these hosts with an empty
    // `search`, which is the strict form the Next docs recommend — the
    // permissive one lets anyone have the optimizer fetch URLs that were
    // never intended. next/image sizes the image itself, so the ?s=
    // parameter GitHub accepts is not needed anyway.
    return `https://avatars.githubusercontent.com/u/${encodeURIComponent(providerUserId)}`;
  }
  return null;
}

/**
 * The initial is not a loading state — it is the honest fallback for a
 * deleted account, a blocked image host, or a provider whose avatar URL
 * cannot be derived.
 */
export default function Avatar({
  username,
  url,
  size = 64,
}: {
  username: string;
  url: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
        className="flex shrink-0 items-center justify-center rounded-full bg-[#4338CA] font-semibold text-white"
      >
        {username.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      // Decorative: the name sits right beside it, so announcing the
      // avatar as well would only repeat it.
      aria-hidden="true"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-gray-100 object-cover"
    />
  );
}
