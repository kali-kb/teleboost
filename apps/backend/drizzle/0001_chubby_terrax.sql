ALTER TABLE "channel_audience" DROP CONSTRAINT "channel_audience_channel_id_telegram_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "channel_audience" ADD CONSTRAINT "channel_audience_channel_id_telegram_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."telegram_channel"("id") ON DELETE cascade ON UPDATE no action;