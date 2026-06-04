-- CreateTable
CREATE TABLE `trade_plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `asset_id` BIGINT UNSIGNED NULL,
    `hypothesis` TEXT NOT NULL,
    `market_environment` ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NOT NULL,
    `timeframe` VARCHAR(20) NULL,
    `entry_trigger` TEXT NOT NULL,
    `entry_price` DECIMAL(20, 8) NULL,
    `stop_loss` DECIMAL(20, 8) NULL,
    `take_profit` DECIMAL(20, 8) NULL,
    `position_size` DECIMAL(20, 8) NULL,
    `risk_amount` DECIMAL(20, 4) NULL,
    `expected_rr` DECIMAL(10, 2) NULL,
    `invalidation` TEXT NULL,
    `strategy_type` ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NOT NULL,
    `status` ENUM('draft', 'active', 'executed', 'cancelled', 'expired') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_trade_plans_user_status`(`user_id`, `status`),
    INDEX `idx_trade_plans_user_strategy`(`user_id`, `strategy_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `review_date` DATE NOT NULL,
    `best_trade_id` BIGINT UNSIGNED NULL,
    `best_trade_reason` TEXT NULL,
    `worst_trade_id` BIGINT UNSIGNED NULL,
    `worst_trade_reason` TEXT NULL,
    `tomorrow_improvement` TEXT NULL,
    `total_trades` INTEGER NULL,
    `net_r` DECIMAL(10, 4) NULL,
    `win_count` INTEGER NULL,
    `loss_count` INTEGER NULL,
    `plan_adherence_pct` DECIMAL(10, 2) NULL,
    `market_summary` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `idx_daily_reviews_user_date`(`user_id`, `review_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trade_reviews` ADD CONSTRAINT `trade_reviews_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `trade_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_plans` ADD CONSTRAINT `trade_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_plans` ADD CONSTRAINT `trade_plans_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `user_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_reviews` ADD CONSTRAINT `daily_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
