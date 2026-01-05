import { pgEnum } from "drizzle-orm/pg-core";

export const campaign_placement_status_enum = pgEnum("campaign_placement_status", [
  "PENDING_PAYMENT", "PAID", "APPROVED", "REJECTED", "POSTED", "COMPLETED", "DISPUTED", "CANCELLED"
]);
export enum CampaignPlacementStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  POSTED = 'POSTED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}
