/**
 * @deprecated Use `SearchBottomSheet` — Foundation v1 picker/search sheet.
 * Re-exported for import compatibility during migration.
 */
export {
  SearchBottomSheet as SelectionBottomSheet,
  type SearchBottomSheetProps as SelectionBottomSheetProps,
  type SearchBottomSheetSearchConfig as SelectionBottomSheetSearchConfig,
} from "@/components/ui/search-bottom-sheet";

/** @deprecated No longer used — search sheets use fixed immersive height. */
export const SELECTION_SHEET_HEADER_HEIGHT_PX = 56;
