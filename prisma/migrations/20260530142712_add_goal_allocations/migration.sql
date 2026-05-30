-- CreateTable
CREATE TABLE `goal_allocations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `goal_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `percentage` DECIMAL(5, 2) NOT NULL,
    `target_amount` DECIMAL(30, 10) NOT NULL,
    `assets` VARCHAR(500) NULL,
    `role` VARCHAR(200) NULL,
    `sort_order` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_goal_allocations_goal_id`(`goal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `goal_allocations` ADD CONSTRAINT `goal_allocations_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
