-- AlterTable: add planId + dailyRiskTotal
ALTER TABLE `trade_reviews` ADD COLUMN `daily_risk_total` DECIMAL(20, 4) NULL,
    ADD COLUMN `plan_id` BIGINT UNSIGNED NULL;

-- Convert total_score into a STORED generated column (sum of the five score dimensions).
-- Prisma cannot express GENERATED columns, so this is hand-written. Drop-then-add is safe
-- because the trade_reviews table has no rows that need preserving at this point.
ALTER TABLE `trade_reviews` DROP COLUMN `total_score`;
ALTER TABLE `trade_reviews` ADD COLUMN `total_score` SMALLINT
    GENERATED ALWAYS AS (
        COALESCE(`score_opportunity`, 0)
        + COALESCE(`score_planning`, 0)
        + COALESCE(`score_risk_control`, 0)
        + COALESCE(`score_discipline`, 0)
        + COALESCE(`score_psychology`, 0)
    ) STORED;

-- Score-range CHECK constraints (0..max per dimension).
ALTER TABLE `trade_reviews`
    ADD CONSTRAINT `chk_score_opportunity` CHECK (`score_opportunity` IS NULL OR (`score_opportunity` BETWEEN 0 AND 25)),
    ADD CONSTRAINT `chk_score_planning` CHECK (`score_planning` IS NULL OR (`score_planning` BETWEEN 0 AND 25)),
    ADD CONSTRAINT `chk_score_risk_control` CHECK (`score_risk_control` IS NULL OR (`score_risk_control` BETWEEN 0 AND 20)),
    ADD CONSTRAINT `chk_score_discipline` CHECK (`score_discipline` IS NULL OR (`score_discipline` BETWEEN 0 AND 20)),
    ADD CONSTRAINT `chk_score_psychology` CHECK (`score_psychology` IS NULL OR (`score_psychology` BETWEEN 0 AND 10));
