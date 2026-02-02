CREATE TYPE "public"."withdrawal_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_owner_id" uuid NOT NULL,
	"account_holder_name" varchar(255) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"bank_account_id" uuid NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"fee" numeric(20, 2) DEFAULT '0' NOT NULL,
	"net_amount" numeric(20, 2) NOT NULL,
	"status" "withdrawal_status" DEFAULT 'PENDING' NOT NULL,
	"reference_code" varchar(100),
	"processed_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "withdrawals_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_channel_owner_id_telegram_identity_id_fk" FOREIGN KEY ("channel_owner_id") REFERENCES "public"."telegram_identity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "owner_check" CHECK ((CASE 
        WHEN "wallets"."owner_type" = 'ADVERTISER' THEN "wallets"."owner_user_id" IS NOT NULL AND "wallets"."owner_telegram_id" IS NULL
        WHEN "wallets"."owner_type" = 'CHANNEL_OWNER' THEN "wallets"."owner_telegram_id" IS NOT NULL AND "wallets"."owner_user_id" IS NULL
      END));