import { pgEnum } from "drizzle-orm/pg-core";

export const advertiser_type_enum = pgEnum("advertiser_type", ["INDIVIDUAL", "ENTERPRISE"]);
export enum AdvertiserType {
  INDIVIDUAL = 'INDIVIDUAL',
  ENTERPRISE = 'ENTERPRISE',
}
