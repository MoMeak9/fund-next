-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(64) NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `uk_users_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_assets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `asset_type` VARCHAR(32) NOT NULL,
    `symbol` VARCHAR(64) NULL,
    `asset_name` VARCHAR(255) NOT NULL,
    `market` VARCHAR(32) NULL,
    `currency` VARCHAR(16) NOT NULL DEFAULT 'CNY',
    `quantity` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `avg_cost` DECIMAL(30, 10) NULL,
    `current_price` DECIMAL(30, 10) NULL,
    `cost_amount` DECIMAL(30, 10) NULL,
    `market_value` DECIMAL(30, 10) NULL,
    `remark` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_user_assets_user_id`(`user_id`),
    INDEX `idx_user_assets_symbol`(`symbol`),
    INDEX `idx_user_assets_type`(`asset_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `asset_id` BIGINT UNSIGNED NOT NULL,
    `transaction_type` VARCHAR(32) NOT NULL,
    `quantity` DECIMAL(30, 10) NOT NULL,
    `price` DECIMAL(30, 10) NOT NULL,
    `fee` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `currency` VARCHAR(16) NOT NULL DEFAULT 'CNY',
    `transaction_amount` DECIMAL(30, 10) NOT NULL,
    `transaction_time` DATETIME(0) NOT NULL,
    `reason` TEXT NULL,
    `emotion_tag` VARCHAR(64) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_transactions_user_id`(`user_id`),
    INDEX `idx_transactions_asset_id`(`asset_id`),
    INDEX `idx_transactions_time`(`transaction_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `goal_name` VARCHAR(255) NOT NULL,
    `target_amount` DECIMAL(30, 10) NOT NULL,
    `target_date` DATE NOT NULL,
    `initial_principal` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `include_profit` BOOLEAN NOT NULL DEFAULT false,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_goals_user_id`(`user_id`),
    INDEX `idx_goals_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fund_holdings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fund_symbol` VARCHAR(64) NOT NULL,
    `fund_name` VARCHAR(255) NULL,
    `holding_symbol` VARCHAR(64) NOT NULL,
    `holding_name` VARCHAR(255) NOT NULL,
    `holding_market` VARCHAR(32) NULL,
    `industry` VARCHAR(128) NULL,
    `weight` DECIMAL(10, 6) NOT NULL,
    `report_date` DATE NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_fund_holdings_fund_symbol`(`fund_symbol`),
    INDEX `idx_fund_holdings_holding_symbol`(`holding_symbol`),
    INDEX `idx_fund_holdings_report_date`(`report_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_prices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(64) NOT NULL,
    `asset_type` VARCHAR(32) NOT NULL,
    `market` VARCHAR(32) NULL,
    `currency` VARCHAR(16) NOT NULL DEFAULT 'CNY',
    `price` DECIMAL(30, 10) NOT NULL,
    `price_time` DATETIME(0) NOT NULL,
    `source` VARCHAR(64) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_asset_prices_symbol_time`(`symbol`, `price_time`),
    INDEX `idx_asset_prices_type`(`asset_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `watchlists` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `asset_type` VARCHAR(32) NOT NULL,
    `symbol` VARCHAR(64) NOT NULL,
    `asset_name` VARCHAR(255) NOT NULL,
    `market` VARCHAR(32) NULL,
    `currency` VARCHAR(16) NOT NULL DEFAULT 'CNY',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_watchlists_user_id`(`user_id`),
    UNIQUE INDEX `uk_watchlists_user_symbol`(`user_id`, `symbol`, `asset_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_daily_snapshots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `snapshot_date` DATE NOT NULL,
    `total_asset_value` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `total_cost` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `total_profit` DECIMAL(30, 10) NOT NULL DEFAULT 0,
    `total_profit_rate` DECIMAL(10, 6) NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_snapshot_user_id`(`user_id`),
    UNIQUE INDEX `uk_snapshot_user_date`(`user_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_assets` ADD CONSTRAINT `user_assets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `user_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watchlists` ADD CONSTRAINT `watchlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_daily_snapshots` ADD CONSTRAINT `asset_daily_snapshots_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
