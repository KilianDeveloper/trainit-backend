DROP TABLE IF EXISTS `friendship` ;

CREATE TABLE IF NOT EXISTS `friendship` (
  `account_id_1` VARCHAR(48) NOT NULL,
  `account_id_2` VARCHAR(48) NOT NULL,
  `1_follows_2` VARCHAR(50) NULL,
  `2_follows_1` VARCHAR(50) NULL,
  PRIMARY KEY (`account_id_1`, `account_id_2`))
ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE friendship ADD CONSTRAINT `friendship_has_account_1` FOREIGN KEY (`account_id_1`) REFERENCES `account` (`id`);
ALTER TABLE friendship ADD CONSTRAINT `friendship_has_account_2` FOREIGN KEY (`account_id_2`) REFERENCES `account` (`id`);

ALTER TABLE account ADD COLUMN notifications JSON NOT NULL;
UPDATE account set notifications="[]" WHERE true;