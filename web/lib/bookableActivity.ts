import { isUseExistingAppDataAsReal } from "@/lib/integrationConfig";
import { normalizeActivity } from "@/lib/normalize";

type BookableActivityInput = {
  activityId: string;
  partnerId: string;
  categorySlug: string;
  title: string;
  dateISO: string;
  time: string;
  credits: number;
  spots: number;
  location?: string;
};

export function isBookableActivity(
  input: BookableActivityInput,
  options?: { useExistingAppDataAsReal?: boolean }
): boolean {
  const normalized = normalizeActivity({
    activityId: input.activityId,
    partnerClientSlug: input.partnerId,
    categorySlug: input.categorySlug,
    title: input.title,
    dateISO: input.dateISO,
    time: input.time,
    credits: input.credits,
    spots: input.spots,
    location: input.location,
  });

  const hasStableId = normalized.appStableKey.length > 0;
  const hasPartner = normalized.partnerClientSlug.length > 0;
  const useExisting =
    options?.useExistingAppDataAsReal ?? isUseExistingAppDataAsReal();
  const looksMongoId = /^[a-f0-9]{24}$/i.test(normalized.appStableKey);

  if (useExisting) {
    return hasStableId && hasPartner;
  }
  return looksMongoId && hasPartner;
}

