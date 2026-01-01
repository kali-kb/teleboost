// Enums (Must be exported first to avoid hoisting issues)
export * from "./enums/advertiser_types.js";
export * from "./enums/campaign_placement_status.js";
export * from "./enums/campaign_status.js";
export * from "./enums/payment_status.js";
export * from "./enums/wallet_owner_type.js";
export * from "./enums/transaction_type.js";
export * from "./enums/dispute_status.js";
export * from "./enums/user_role.js";

// Root Tables (No dependencies on other tables)
export * from "./telegram_identities.js";
export * from "./payment_methods.js";

// Core Tables
export * from "./auth.js"; // Depends on user_role enum
export * from "./wallets.js"; // Depends on users, telegram_identities
export * from "./telegram_channels.js"; // Depends on telegram_identities

// Profile Tables
export * from "./advertiser_profiles.js"; // Depends on users
export * from "./admin_profiles.js"; // Depends on users
export * from "./admin_logs.js"; // Depends on users

// Dependent Tables (Order matters for clarity, though ESM handles it)
export * from "./channel_audience.js"; // Depends on telegram_channels
export * from "./channel_stats_history.js"; // Depends on telegram_channels
export * from "./campaigns.js"; // Depends on users

// Relational Tables
export * from "./campaign_placements.js"; // Depends on campaigns, telegram_channels
export * from "./campaign_posts.js"; // Depends on campaign_placements
export * from "./payments.js"; // Depends on campaign_placements
export * from "./disputes.js"; // Depends on campaign_placements
export * from "./payment_receipts.js"; // Depends on payments
export * from "./transactions.js"; // Depends on wallets
