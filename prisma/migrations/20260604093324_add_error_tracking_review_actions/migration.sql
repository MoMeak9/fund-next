-- CreateTable
CREATE TABLE `error_tracking` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `error_type` ENUM('none', 'chasing', 'stop_delay', 'oversize', 'early_profit', 'counter_trend', 'emotional', 'no_plan', 'revenge_trade', 'fomo_entry', 'news_gamble') NOT NULL,
    `occurrence_count` INTEGER NOT NULL DEFAULT 0,
    `total_loss_r` DECIMAL(10, 4) NOT NULL DEFAULT 0,
    `typical_conditions` TEXT NULL,
    `trigger_emotion` TEXT NULL,
    `prevention_rule` TEXT NULL,
    `tracking_start` DATE NULL,
    `tracking_end` DATE NULL,
    `is_improving` BOOLEAN NULL,
    `improvement_notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_error_tracking_user_improving`(`user_id`, `is_improving`),
    UNIQUE INDEX `idx_error_tracking_user_error`(`user_id`, `error_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_actions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `source_type` ENUM('trade_review', 'daily_review', 'weekly_review', 'monthly_review') NOT NULL,
    `source_id` BIGINT UNSIGNED NULL,
    `problem` TEXT NOT NULL,
    `rule` TEXT NOT NULL,
    `tracking_days` INTEGER NULL,
    `metric` TEXT NULL,
    `status` ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
    `result` TEXT NULL,
    `started_at` DATE NULL,
    `completed_at` DATE NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_review_actions_user_status`(`user_id`, `status`),
    INDEX `idx_review_actions_user_source`(`user_id`, `source_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `error_tracking` ADD CONSTRAINT `error_tracking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_actions` ADD CONSTRAINT `review_actions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
