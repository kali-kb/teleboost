import { pgEnum } from "drizzle-orm/pg-core";

export const campaign_status_enum = pgEnum("campaign_status", ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]);
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
