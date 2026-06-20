import { getInstitutionBrandAssetPath } from "@/lib/institutions/brand-assets-registry";
import { getInstitutionFallbackInitial } from "@/lib/institutions/logo-fallback";
import { cn } from "@/lib/utils";

/** Default picker row size (32×32). */
export const INSTITUTION_BRAND_ASSET_PICKER_SIZE = 32;

interface InstitutionBrandAssetProps {
  institutionId: string;
  /** Consumer-facing label for fallback initial derivation. */
  fallbackLabel: string;
  /** Container edge length in pixels. Defaults to picker size (32). */
  size?: number;
  className?: string;
}

export function InstitutionBrandAsset({
  institutionId,
  fallbackLabel,
  size = INSTITUTION_BRAND_ASSET_PICKER_SIZE,
  className,
}: InstitutionBrandAssetProps) {
  const assetPath = getInstitutionBrandAssetPath(institutionId);
  const initial = getInstitutionFallbackInitial(fallbackLabel);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[10px] bg-muted",
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
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-center"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
          {initial}
        </span>
      )}
    </span>
  );
}
