-- CreateTable
CREATE TABLE `trade_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `transaction_id` BIGINT UNSIGNED NOT NULL,
    `market_environment` ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
    `key_levels` TEXT NULL,
    `news_events` TEXT NULL,
    `sector_context` TEXT NULL,
    `followed_plan` BOOLEAN NULL,
    `entry_quality` ENUM('good', 'acceptable', 'poor') NULL,
    `exit_quality` ENUM('good', 'acceptable', 'poor') NULL,
    `moved_stop_loss` BOOLEAN NULL,
    `added_position` BOOLEAN NULL,
    `chased_price` BOOLEAN NULL,
    `risk_per_trade` DECIMAL(20, 4) NULL,
    `account_risk_pct` DECIMAL(10, 4) NULL,
    `mae` DECIMAL(20, 8) NULL,
    `mfe` DECIMAL(20, 8) NULL,
    `r_multiple` DECIMAL(10, 4) NULL,
    `pre_trade_emotion` ENUM('calm', 'anxious', 'fomo', 'revenge', 'fatigued', 'overconfident') NULL,
    `post_trade_emotion` ENUM('calm', 'regret', 'relief', 'frustration', 'euphoria') NULL,
    `score_opportunity` SMALLINT NULL,
    `score_planning` SMALLINT NULL,
    `score_risk_control` SMALLINT NULL,
    `score_discipline` SMALLINT NULL,
    `score_psychology` SMALLINT NULL,
    `total_score` SMALLINT NULL,
    `trade_grade` ENUM('A', 'B', 'C') NULL,
    `strategy_type` ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NULL,
    `error_type` ENUM('none', 'chasing', 'stop_delay', 'oversize', 'early_profit', 'counter_trend', 'emotional', 'no_plan', 'revenge_trade', 'fomo_entry', 'news_gamble') NULL DEFAULT 'none',
    `profit_source` TEXT NULL,
    `loss_reason` TEXT NULL,
    `is_repeatable` BOOLEAN NULL,
    `hindsight_action` TEXT NULL,
    `exposes_pattern` BOOLEAN NULL,
    `include_in_sample` BOOLEAN NULL DEFAULT true,
    `next_action` TEXT NULL,
    `screenshots` JSON NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `trade_reviews_transaction_id_key`(`transaction_id`),
    INDEX `idx_trade_reviews_user_date`(`user_id`, `created_at`),
    INDEX `idx_trade_reviews_user_grade`(`user_id`, `trade_grade`),
    INDEX `idx_trade_reviews_user_strategy`(`user_id`, `strategy_type`),
    INDEX `idx_trade_reviews_user_error`(`user_id`, `error_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trade_reviews` ADD CONSTRAINT `trade_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trade_reviews` ADD CONSTRAINT `trade_reviews_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
