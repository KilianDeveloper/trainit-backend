DROP TABLE IF EXISTS `group` ;

CREATE TABLE IF NOT EXISTS `group` (
  `id` BINARY(16) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `is_invitation_enabled` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `account` ;

CREATE TABLE IF NOT EXISTS `account` (
  `id` VARCHAR(48) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `is_profile_public` TINYINT NOT NULL DEFAULT 1,
  `personal_records` JSON NOT NULL,
  `weight_unit` VARCHAR(5) NULL,
  `average_set_duration` INT(5) NOT NULL DEFAULT 90,
  `average_set_rest_duration` INT(5) NOT NULL DEFAULT 90,
  `training_plan_id` BINARY(16) NOT NULL,
  `calendar_trainings` JSON NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `training_plan`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `training_plan` ;

CREATE TABLE IF NOT EXISTS `training_plan` (
  `id` BINARY(16) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `days` JSON NULL,
  `created_on` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `account_id` VARCHAR(48) NOT NULL,
  PRIMARY KEY (`id`, `account_id`))
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE account ADD CONSTRAINT `fk_account_training1` FOREIGN KEY (`training_plan_id`) REFERENCES `training_plan` (`id`);

-- -----------------------------------------------------
-- Table `group_has_account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `group_has_account` ;

CREATE TABLE IF NOT EXISTS `group_has_account` (
  `group_id` BINARY(16) NOT NULL,
  `account_id` VARCHAR(48) NOT NULL,
  `privileges` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`group_id`, `account_id`),
  INDEX `fk_group_has_account_account1_idx` (`account_id` ASC) VISIBLE,
  INDEX `fk_group_has_account_group1_idx` (`group_id` ASC) VISIBLE,
  CONSTRAINT `fk_group_has_account_group1`
    FOREIGN KEY (`group_id`)
    REFERENCES `group` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_group_has_account_account1`
    FOREIGN KEY (`account_id`)
    REFERENCES `account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci






