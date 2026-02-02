# Wallet and Payment System Improvement Plan

## Overview

This plan outlines improvements to the current wallet and payment system to properly support:

- **Advertisers**: Store funds for publishing advertisements
- **Channel Owners**: Track earnings and manage withdrawals to bank accounts

## Current State Analysis

### Existing Tables

- `wallets` - Stores wallet data with owner_type enum (ADVERTISER, CHANNEL_OWNER)
- `transactions` - Records wallet transactions (CREDIT, DEBIT)
- `payments` - Tracks payments between advertisers and channel owners

### Identified Issues

1. **Data Integrity**: No constraints ensuring wallet ownership matches owner_type
2. **Missing Withdrawal Support**: No table to track channel owner withdrawal requests
3. **Payment-Wallet Integration**: Payments don't automatically create wallet transactions
4. **Bank Account Storage**: No place to store channel owner bank details for withdrawals

---

## Implementation Plan

### Phase 1: Data Integrity Constraints

**Objective**: Ensure wallet ownership is consistent with owner_type

#### Tasks:

1. **Add CHECK constraint to wallets table**
   - When `owner_type = 'ADVERTISER'`: `owner_user_id` must be NOT NULL, `owner_telegram_id` must be NULL
   - When `owner_type = 'CHANNEL_OWNER'`: `owner_telegram_id` must be NOT NULL, `owner_user_id` must be NULL
2. **Update existing data** (if any inconsistencies exist)
   - Verify all wallets have proper ownership fields populated
   - Fix any orphaned or inconsistent records

#### Files to Modify:

- `drizzle/db/schema/wallets.ts`
- Create migration file for constraint

---

### Phase 2: Bank Account Management

**Objective**: Allow channel owners to store bank account details for withdrawals

#### Tasks:

1. **Create new table: `bank_accounts`**

   ```typescript
   Fields:
   - id: uuid (primary key)
   - channel_owner_id: uuid (references telegram_identities.id)
   - account_holder_name: varchar (not null)
   - bank_name: varchar (not null)
   - account_number: varchar (not null)
   - is_default: boolean (default false)
   - is_verified: boolean (default false)
   - created_at: timestamp
   - updated_at: timestamp
   ```

2. **Add relations**
   - Link bank_accounts to telegram_identities
   - Ensure one channel owner can have multiple accounts but only one default

#### Files to Create:

- `drizzle/db/schema/bank_accounts.ts`

#### Files to Modify:

- `drizzle/db/schema/index.ts` - export new table
- `drizzle/db/schema/telegram_identities.ts` - add relations

---

### Phase 3: Withdrawal System

**Objective**: Enable channel owners to request and track withdrawals

#### Tasks:

1. **Create new enum: `withdrawal_status`**
   Values: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED

2. **Create new table: `withdrawals`**

   ```typescript
   Fields:
   - id: uuid (primary key)
   - wallet_id: uuid (references wallets.id, not null)
   - bank_account_id: uuid (references bank_accounts.id, not null)
   - amount: decimal (not null)
   - fee: decimal (default '0')
   - net_amount: decimal (not null)
   - status: withdrawal_status (not null)
   - reference_code: varchar (unique, for tracking)
   - processed_at: timestamp (nullable)
   - failure_reason: text (nullable)
   - created_at: timestamp
   - updated_at: timestamp
   ```

3. **Add relations**
   - Link withdrawals to wallets
   - Link withdrawals to bank_accounts

#### Files to Create:

- `drizzle/db/schema/enums/withdrawal_status.ts`
- `drizzle/db/schema/withdrawals.ts`

#### Files to Modify:

- `drizzle/db/schema/index.ts` - export new enum and table
- `drizzle/db/schema/wallets.ts` - add relations
- `drizzle/db/schema/bank_accounts.ts` - add relations

---

### Phase 4: Payment-Wallet Integration

**Objective**: Automatically create wallet transactions when payments are processed

#### Tasks:

1. **Update payment status enum** (if needed)
   - Ensure it includes: PENDING, PROCESSING, COMPLETED, FAILED

2. **Create payment processing logic**
   When payment status changes to COMPLETED:
   - Create DEBIT transaction on advertiser's wallet
   - Create CREDIT transaction on channel owner's wallet (net amount after platform fee)
   - Update wallet balances accordingly

3. **Add transaction reference fields** (optional enhancement)
   - Add `wallet_transaction_id` to payments table to link payment to its transactions

#### Files to Modify:

- `drizzle/db/schema/payments.ts` - add optional transaction reference
- Service layer: Create payment processing service

---

### Phase 5: Service Layer Implementation

**Objective**: Create business logic services for wallet operations

#### Tasks:

1. **Create WalletService**
   Methods:
   - `getBalance(walletId)` - Get current balance
   - `deductFunds(walletId, amount, reference)` - Deduct for ad placement
   - `addFunds(walletId, amount, reference)` - Add earnings
   - `lockFunds(walletId, amount)` - Lock funds for pending campaigns
   - `unlockFunds(walletId, amount)` - Unlock if campaign cancelled

2. **Create WithdrawalService**
   Methods:
   - `requestWithdrawal(channelOwnerId, amount, bankAccountId)` - Create withdrawal request
   - `processWithdrawal(withdrawalId)` - Mark as processing
   - `completeWithdrawal(withdrawalId, referenceCode)` - Mark as completed
   - `failWithdrawal(withdrawalId, reason)` - Mark as failed
   - `getWithdrawalHistory(channelOwnerId)` - List withdrawals

3. **Create PaymentProcessingService**
   Methods:
   - `processPayment(paymentId)` - Handle payment completion
   - `createPaymentTransaction(payment)` - Create wallet transactions
   - `calculateFees(amount)` - Calculate platform fees

#### Files to Create:

- `src/wallet/wallet.service.ts`
- `src/wallet/wallet.module.ts`
- `src/withdrawals/withdrawal.service.ts`
- `src/withdrawals/withdrawal.module.ts`
- `src/payments/payment-processing.service.ts`

---

### Phase 6: API Endpoints

**Objective**: Expose wallet and withdrawal functionality via REST API

#### Tasks:

1. **Wallet Controller**
   Endpoints:
   - `GET /wallets/:id/balance` - Get wallet balance
   - `GET /wallets/:id/transactions` - Get transaction history
   - `POST /wallets/:id/deposit` - Add funds (advertisers)

2. **Withdrawal Controller**
   Endpoints:
   - `POST /withdrawals` - Request withdrawal
   - `GET /withdrawals` - List user's withdrawals
   - `GET /withdrawals/:id` - Get withdrawal details
   - `POST /withdrawals/:id/cancel` - Cancel pending withdrawal

3. **Bank Account Controller**
   Endpoints:
   - `POST /bank-accounts` - Add bank account
   - `GET /bank-accounts` - List bank accounts
   - `PUT /bank-accounts/:id` - Update bank account
   - `DELETE /bank-accounts/:id` - Remove bank account
   - `POST /bank-accounts/:id/set-default` - Set as default

#### Files to Create:

- `src/wallet/wallet.controller.ts`
- `src/withdrawals/withdrawal.controller.ts`
- `src/bank-accounts/bank-account.controller.ts`
- `src/bank-accounts/bank-account.service.ts`
- `src/bank-accounts/bank-account.module.ts`

---

### Phase 7: Database Migrations

**Objective**: Create and run all necessary database migrations

#### Tasks:

1. Generate migration for Phase 1 (constraints)
2. Generate migration for Phase 2 (bank_accounts table)
3. Generate migration for Phase 3 (withdrawals table)
4. Generate migration for Phase 4 (payment updates)
5. Run all migrations in order
6. Verify schema integrity

#### Commands:

```bash
# Generate migrations
npx drizzle-kit generate:pg

# Run migrations
npx drizzle-kit migrate
```

---

## Data Flow Examples

### Advertiser Publishing Ad

1. Advertiser creates campaign
2. System locks funds in advertiser's wallet (locked_balance)
3. Campaign runs on channel
4. Payment created with PENDING status
5. When verified, payment marked COMPLETED
6. System creates:
   - DEBIT transaction on advertiser wallet (gross_amount)
   - CREDIT transaction on channel owner wallet (net_amount)
7. Wallet balances updated

### Channel Owner Withdrawal

1. Channel owner requests withdrawal
2. System validates:
   - Sufficient available balance
   - Valid bank account
3. Withdrawal record created with PENDING status
4. Funds locked in wallet
5. Admin reviews and processes withdrawal
6. System marks withdrawal PROCESSING
7. External bank transfer executed
8. On success:
   - Mark COMPLETED
   - Create DEBIT transaction
   - Deduct from wallet balance
9. On failure:
   - Mark FAILED with reason
   - Unlock funds

---

## Testing Checklist

- [ ] Wallet constraints prevent invalid ownership combinations
- [ ] Advertiser can deposit funds
- [ ] Advertiser funds deducted when ad published
- [ ] Channel owner earnings credited to wallet
- [ ] Channel owner can add bank accounts
- [ ] Channel owner can request withdrawal
- [ ] Insufficient balance prevents withdrawal
- [ ] Withdrawal status transitions work correctly
- [ ] Payment completion creates correct transactions
- [ ] Platform fees calculated correctly
- [ ] Transaction history accurate

---

## Security Considerations

1. **Validate ownership** - Users can only access their own wallets
2. **Transaction atomicity** - Use database transactions for payment processing
3. **Idempotency** - Prevent duplicate withdrawals or payments
4. **Audit logging** - Log all financial operations
5. **Rate limiting** - Limit withdrawal requests
6. **Input validation** - Validate all amounts and bank details

---

## Next Steps

1. Review this plan with stakeholders
2. Prioritize phases based on business needs
3. Assign implementation to development team
4. Set up testing environment
5. Implement in order: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
6. Run full test suite after each phase
7. Deploy to staging for integration testing
8. Deploy to production with monitoring
