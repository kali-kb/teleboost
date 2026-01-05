// Enums (Must be exported first to avoid hoisting issues)
export * from './enums/advertiser_types';
export * from './enums/campaign_placement_status';
export * from './enums/campaign_status';
export * from './enums/payment_status';
export * from './enums/wallet_owner_type';
export * from './enums/transaction_type';
export * from './enums/dispute_status';
export * from './enums/user_role';

// Root Tables (No dependencies on other tables)
export * from './telegram_identities';
export * from './payment_methods';

// Core Tables
export * from './auth'; // Depends on user_role enum
export * from './wallets'; // Depends on users, telegram_identities
export * from './telegram_channels'; // Depends on telegram_identities

// Profile Tables
export * from './advertiser_profiles'; // Depends on users
export * from './admin_profiles'; // Depends on users
export * from './admin_logs'; // Depends on users

// Dependent Tables (Order matters for clarity, though ESM handles it)
export * from './channel_audience'; // Depends on telegram_channels
export * from './channel_stats_history'; // Depends on telegram_channels
export * from './campaigns'; // Depends on users

// Relational Tables
export * from './campaign_placements'; // Depends on campaigns, telegram_channels
export * from './campaign_posts'; // Depends on campaign_placements
export * from './payments'; // Depends on campaign_placements
export * from './disputes'; // Depends on campaign_placements
export * from './payment_receipts'; // Depends on payments
export * from './transactions'; // Depends on wallets
