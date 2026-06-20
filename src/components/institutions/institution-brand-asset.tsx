import { memo } from "react";

import { getInstitutionBrandAssetPath } from "@/lib/institutions/brand-assets-registry";
import { getInstitutionFallbackInitial } from "@/lib/institutions/logo-fallback";
import { cn } from "@/lib/utils";

/** Default picker row size (32×32). */
export const INSTITUTION_BRAND_ASSET_PICKER_SIZE = 32;

/** Account list row size — spans two text rows. */
export const INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE = 36;

/** Account details header — matches combined institution + name row height. */
export const INSTITUTION_BRAND_ASSET_DETAILS_HEADER_SIZE = 40;

/** Shared corner radius for brand asset containers. */
export const INSTITUTION_BRAND_ASSET_BORDER_RADIUS_PX = 8;

const loadedBrandAssetPaths = new Set<string>();

interface InstitutionBrandAssetProps {
  institutionId: string;
  /** Consumer-facing label for fallback initial derivation. */
  fallbackLabel: string;
  /** Container edge length in pixels. Defaults to picker size (32). */
  size?: number;
  className?: string;
}

export const InstitutionBrandAsset = memo(function InstitutionBrandAsset({
  institutionId,
  fallbackLabel,
  size = INSTITUTION_BRAND_ASSET_PICKER_SIZE,
  className,
}: InstitutionBrandAssetProps) {
  const assetPath = getInstitutionBrandAssetPath(institutionId);
  const initial = getInstitutionFallbackInitial(fallbackLabel);
  const isCached = assetPath ? loadedBrandAssetPaths.has(assetPath) : false;
  const useEagerLoad = size >= INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[8px] bg-muted",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {assetPath ? (
        // eslint-disable-next-line @next/next/no-img-element -- small static registry assets; native img avoids list scroll overhead.
        <img
          src={assetPath}
          alt=""
          width={size}
          height={size}
          loading={useEagerLoad ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={useEagerLoad ? "high" : "auto"}
          onLoad={(event) => {
            loadedBrandAssetPaths.add(assetPath);
            event.currentTarget.style.opacity = "1";
          }}
          className={cn(
            "size-full object-cover object-center transition-opacity duration-150",
            isCached ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <span
          className={cn(
            "flex size-full items-center justify-center font-semibold text-muted-foreground",
            size <= INSTITUTION_BRAND_ASSET_PICKER_SIZE
              ? "text-xs"
              : size <= INSTITUTION_BRAND_ASSET_DETAILS_HEADER_SIZE
                ? "text-sm"
                : "text-base",
          )}
        >
          {initial}
        </span>
      )}
    </span>
  );
});
