-- CreateTable
CREATE TABLE `strategy_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `strategy_type` ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `sample_count` INTEGER NOT NULL DEFAULT 0,
    `win_count` INTEGER NOT NULL DEFAULT 0,
    `loss_count` INTEGER NOT NULL DEFAULT 0,
    `win_rate` DECIMAL(10, 4) NULL,
    `avg_win_r` DECIMAL(10, 4) NULL,
    `avg_loss_r` DECIMAL(10, 4) NULL,
    `expectancy` DECIMAL(10, 4) NULL,
    `profit_factor` DECIMAL(10, 4) NULL,
    `max_consecutive_loss` INTEGER NULL,
    `max_drawdown_r` DECIMAL(10, 4) NULL,
    `best_environment` ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
    `worst_environment` ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
    `status` ENUM('active', 'observation', 'paused', 'retired') NOT NULL DEFAULT 'active',
    `status_reason` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_strategy_stats_user_status`(`user_id`, `status`),
    UNIQUE INDEX `idx_strategy_stats_user_period`(`user_id`, `strategy_type`, `period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `strategy_stats` ADD CONSTRAINT `strategy_stats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
