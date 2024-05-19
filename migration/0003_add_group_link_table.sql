CREATE TABLE IF NOT EXISTS `group_invitation_tokens` (
  `group_id` BINARY(16) NOT NULL,
  `token` VARCHAR(50) NOT NULL,
  `created_on` DATETIME NOT NULL DEFAULT (NOW()),
  PRIMARY KEY (`group_id`, `token`),
  INDEX `fk_group_invitation` (`group_id` ASC) VISIBLE,
  CONSTRAINT `fk_group_has_invitation_tokens`
    FOREIGN KEY (`group_id`)
    REFERENCES `group` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;