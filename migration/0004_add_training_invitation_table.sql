CREATE TABLE IF NOT EXISTS `training_invitation` (
  `invited_account_id` VARCHAR(50) NOT NULL,
  `sending_account_id` VARCHAR(50) NOT NULL,
  `calendar_training_id` BINARY(16) NOT NULL,
  `created_on` DATETIME NOT NULL DEFAULT (NOW()),
  PRIMARY KEY (`invited_account_id`, `sending_account_id`, `calendar_training_id`),
  CONSTRAINT `fk_account_is_invited`
    FOREIGN KEY (`invited_account_id`)
    REFERENCES `account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_account_invited_others`
    FOREIGN KEY (`sending_account_id`)
    REFERENCES `account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;