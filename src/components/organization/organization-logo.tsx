"use client";

import type { Organization } from "better-auth/plugins/organization";
import { BuildingIcon } from "lucide-react";
import { type ComponentProps, useContext, useMemo } from "react";

import { AuthUIContext } from "../../lib/auth-ui-provider";
import { cn } from "../../lib/utils";
import type { AuthLocalization } from "../../localization/auth-localization";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import ColorHash from "color-hash";

const colorHash = new ColorHash({ saturation: 1.0 });

export const stringToColour = (s: string) => colorHash.hex(s);

export const generateColours = (s: string) => {
  const s1 = s.substring(0, s.length / 2);
  const s2 = s.substring(s.length / 2);
  const c1 = stringToColour(s1);
  const c2 = stringToColour(s2);

  return [c1, c2];
};

export const generateSVG = (s: string, size = 256) => {
  const [c1, c2] = generateColours(s);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${
        size / 2
      }" fill="url(#gradient)" />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
          <stop stop-color="${c1}" />
          <stop offset="1" stop-color="${c2}" />
        </linearGradient>
      </defs>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export interface OrganizationLogoClassNames {
  base?: string;
  image?: string;
  fallback?: string;
  fallbackIcon?: string;
  skeleton?: string;
}

export interface OrganizationLogoProps {
  classNames?: OrganizationLogoClassNames;
  isPending?: boolean;
  size?: "sm" | "default" | "lg" | "xl" | null;
  organization?: Partial<Organization> | null;
  /**
   * @default authLocalization
   * @remarks `AuthLocalization`
   */
  localization?: AuthLocalization;
}

/**
 * Displays an organization logo with image and fallback support
 *
 * Renders an organization's logo image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Falls back to a building icon when no logo is available
 */
export function OrganizationLogo({
  className,
  classNames,
  isPending,
  size,
  organization,
  localization: propLocalization,
  ...props
}: OrganizationLogoProps & ComponentProps<typeof Avatar>) {
  const { localization: contextLocalization, avatar } =
    useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...propLocalization }),
    [contextLocalization, propLocalization]
  );

  const name = organization?.name;
  const src = organization?.logo;

  if (isPending) {
    return (
      <Skeleton
        className={cn(
          "shrink-0 rounded-full",
          size === "sm"
            ? "size-6"
            : size === "lg"
              ? "size-10"
              : size === "xl"
                ? "size-12"
                : "size-8",
          className,
          classNames?.base,
          classNames?.skeleton
        )}
      />
    );
  }

  return (
    <Avatar
      className={cn(
        "bg-muted",
        size === "sm"
          ? "size-6"
          : size === "lg"
            ? "size-10"
            : size === "xl"
              ? "size-12"
              : "size-8",
        className,
        classNames?.base
      )}
      {...props}
    >
      {avatar?.Image ? (
        <avatar.Image
          alt={name || localization?.ORGANIZATION}
          className={classNames?.image}
          src={src || ""}
        />
      ) : (
        <AvatarImage
          alt={name || localization?.ORGANIZATION}
          className={classNames?.image}
          src={src || undefined}
        />
      )}

      <AvatarFallback
        className={cn("text-foreground", classNames?.fallback)}
        delayMs={src ? 600 : undefined}
      >
        <img
          src={generateSVG(name ? name.slice(0, 2) : "Animation API", 32)}
          className=" size-full"
        />
      </AvatarFallback>
    </Avatar>
  );
}
