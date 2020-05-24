DROP DATABASE IF EXISTS `InternetBanking_development`;
CREATE DATABASE `InternetBanking_development` /*!40100 COLLATE 'utf8mb4_0900_ai_ci' */;
USE `InternetBanking_development`;

-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.18 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table InternetBanking.accounts
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accountNumber` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `customerId` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  `currencyId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `statusId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accountNumber` (`accountNumber`),
  KEY `fk_accounts_account_types` (`typeId`),
  KEY `fk_accounts_currencies` (`currencyId`),
  KEY `fk_accounts_account_status` (`statusId`),
  CONSTRAINT `fk_accounts_account_status` FOREIGN KEY (`statusId`) REFERENCES `account_status` (`id`),
  CONSTRAINT `fk_accounts_account_types` FOREIGN KEY (`typeId`) REFERENCES `account_types` (`id`),
  CONSTRAINT `fk_accounts_currencies` FOREIGN KEY (`currencyId`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.accounts: ~5 rows (approximately)
DELETE FROM `accounts`;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` (`id`, `accountNumber`, `customerId`, `balance`, `currencyId`, `typeId`, `statusId`) VALUES
	(1, '1000000001', 1, 10000000, 1, 1, 1),
	(2, '2000000002', 1, 10000000, 1, 2, 1),
	(3, '1000000003', 2, 10000000, 1, 1, 1),
	(4, '1000000004', 3, 10000000, 1, 1, 1),
	(5, '1000000005', 1, 10000000, 1, 1, 1);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.account_status
DROP TABLE IF EXISTS `account_status`;
CREATE TABLE IF NOT EXISTS `account_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.account_status: ~0 rows (approximately)
DELETE FROM `account_status`;
/*!40000 ALTER TABLE `account_status` DISABLE KEYS */;
INSERT INTO `account_status` (`id`, `status`) VALUES
	(1, 'OPEN'),
	(2, 'CLOSED');
/*!40000 ALTER TABLE `account_status` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.account_types
DROP TABLE IF EXISTS `account_types`;
CREATE TABLE IF NOT EXISTS `account_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.account_types: ~2 rows (approximately)
DELETE FROM `account_types`;
/*!40000 ALTER TABLE `account_types` DISABLE KEYS */;
INSERT INTO `account_types` (`id`, `type`) VALUES
	(1, 'CURRENT'),
	(2, 'DEPOSIT');
/*!40000 ALTER TABLE `account_types` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.administrators
DROP TABLE IF EXISTS `administrators`;
CREATE TABLE IF NOT EXISTS `administrators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fullName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `refreshToken` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.administrators: ~1 rows (approximately)
DELETE FROM `administrators`;
/*!40000 ALTER TABLE `administrators` DISABLE KEYS */;
INSERT INTO `administrators` (`id`, `userName`, `password`, `fullName`, `email`, `refreshToken`) VALUES
	(1, 'truongchauhien', '$2b$12$sMCxa.E.fUEwlDhMSa64tuDpjqoLRd0hfFrYNPsqEzTFnesoaKwbK', 'Trương Châu Hiền', 'truongchauhien@gmail.com', 'e779a19eab528fda8aabfc2811819968fe62db8725581d57c1130345da3aef0622d9a196a16a97550695e0fa0339e47d0f6bc39eba6c1c3bc8535a58f20a2684');
/*!40000 ALTER TABLE `administrators` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.banks
DROP TABLE IF EXISTS `banks`;
CREATE TABLE IF NOT EXISTS `banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `nationalCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `internationalCode` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `hasApi` tinyint(1) NOT NULL DEFAULT '0',
  `partnerCode` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `secretKey` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partnerCode` (`partnerCode`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.banks: ~4 rows (approximately)
DELETE FROM `banks`;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` (`id`, `name`, `nationalCode`, `internationalCode`, `hasApi`, `partnerCode`, `secretKey`) VALUES
	(1, 'INTERNAL', NULL, NULL, 0, NULL, NULL),
	(2, 'BANK_X', NULL, NULL, 1, 'PARTNER_CODE_FOR_BANK_X', 'SECRET_KEY_FOR_BANK_X'),
	(3, 'BANK_Y', NULL, NULL, 1, 'PARTNER_CODE_FOR_BANK_Y', 'SECRET_KEY_FOR_BANK_Y');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.configurations
DROP TABLE IF EXISTS `configurations`;
CREATE TABLE IF NOT EXISTS `configurations` (
  `name` varchar(128) NOT NULL,
  `value` varchar(256) DEFAULT NULL,
  `type` varchar(64) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.configurations: ~2 rows (approximately)
DELETE FROM `configurations`;
/*!40000 ALTER TABLE `configurations` DISABLE KEYS */;
INSERT INTO `configurations` (`name`, `value`, `type`) VALUES
	('maxOTPAttempts', '3', 'Number'),
	('nextAccountNumber', '6', 'Number');
/*!40000 ALTER TABLE `configurations` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.contacts
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) NOT NULL,
  `accountNumber` varchar(12) NOT NULL,
  `bankId` int(11) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accountNumber_customerId_bankId` (`accountNumber`,`customerId`,`bankId`),
  KEY `fk_contacts_banks` (`bankId`),
  CONSTRAINT `fk_contacts_banks` FOREIGN KEY (`bankId`) REFERENCES `banks` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.contacts: ~3 rows (approximately)
DELETE FROM `contacts`;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` (`id`, `customerId`, `accountNumber`, `bankId`, `name`, `createdAt`) VALUES
	(1, 1, '1000000003', 1, 'Customer 02', '2020-04-19 18:01:55'),
	(2, 1, '1000000004', 1, 'Customer 03', '2020-04-21 09:53:40'),
	(3, 1, '700000000001', 2, 'Customer X', '2020-05-23 02:18:08');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.currencies
DROP TABLE IF EXISTS `currencies`;
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.currencies: ~1 rows (approximately)
DELETE FROM `currencies`;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
INSERT INTO `currencies` (`id`, `code`, `name`) VALUES
	(1, 'VND', 'Vietnamese đồng');
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fullName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(128) DEFAULT NULL,
  `otpSecret` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `refreshToken` varchar(128) DEFAULT NULL,
  `defaultCurrentAccountId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_customers_accounts` (`defaultCurrentAccountId`),
  CONSTRAINT `fk_customers_accounts` FOREIGN KEY (`defaultCurrentAccountId`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.customers: ~3 rows (approximately)
DELETE FROM `customers`;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` (`id`, `userName`, `password`, `fullName`, `email`, `phone`, `otpSecret`, `refreshToken`, `defaultCurrentAccountId`) VALUES
	(1, 'truongchauhien', '$2b$12$O3Rk5iEwrLwzYN4ygwIm3e5YpOHOlDeljo9li3UdLRnHeQSehJBK6', 'Trương Châu Hiền', 'truongchauhien@gmail.com', NULL, 'NG4ISNVES53UMRU7', '61300622f1074ca58c94b839d6510b065d695a4d0ab229f499340480620ab1d3c88c1957bdacd5eb350ba59d36134d7c105764202bd29fdc987219a0c0c9bd37', 1),
	(2, 'customer02', '$2b$12$1PYPvuLipOQ3yfuepKS4vu5hTgEg073eQDBYBWvajrq23sX4af0AS', 'Customer 02', 'customer02@gmail.com', NULL, 'NG4ISNVES53UMRU7', '5d052ae1dc2f41b4c2a7f5add080252eee79e10fc625479ff006e0353c66bab40922f7a183dbd964131e182b8fad04a4df453e5be9da27e05dba4811e928b355', 3),
	(3, 'customer03', '$2b$12$1PYPvuLipOQ3yfuepKS4vu5hTgEg073eQDBYBWvajrq23sX4af0AS', 'Customer 03', 'customer03@gmail.com', NULL, 'NG4ISNVES53UMRU7', 'e6b499162fa2e0907b7a42e6ede9894db57fcee6a6c00d0c6743a993f4d5269e1a8eb3acb57d5c764cf2e4b558a34eef197c855794510a6dc5017995550c0570', 4);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.debts
DROP TABLE IF EXISTS `debts`;
CREATE TABLE IF NOT EXISTS `debts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromCustomerId` int(11) NOT NULL,
  `toCustomerId` int(11) NOT NULL,
  `message` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT (_utf8mb4''),
  `canceledReason` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT (_utf8mb4''),
  `amount` int(11) NOT NULL,
  `currencyId` int(11) NOT NULL,
  `statusId` int(11) NOT NULL,
  `transferId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_debts_currencies` (`currencyId`),
  KEY `fk_debts_debt_status` (`statusId`),
  KEY `fk_debts_transfers` (`transferId`),
  CONSTRAINT `fk_debts_currencies` FOREIGN KEY (`currencyId`) REFERENCES `currencies` (`id`),
  CONSTRAINT `fk_debts_debt_status` FOREIGN KEY (`statusId`) REFERENCES `debt_status` (`id`),
  CONSTRAINT `fk_debts_transfers` FOREIGN KEY (`transferId`) REFERENCES `transfers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.debts: ~0 rows (approximately)
DELETE FROM `debts`;
/*!40000 ALTER TABLE `debts` DISABLE KEYS */;
/*!40000 ALTER TABLE `debts` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.debt_status
DROP TABLE IF EXISTS `debt_status`;
CREATE TABLE IF NOT EXISTS `debt_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.debt_status: ~4 rows (approximately)
DELETE FROM `debt_status`;
/*!40000 ALTER TABLE `debt_status` DISABLE KEYS */;
INSERT INTO `debt_status` (`id`, `status`) VALUES
	(1, 'NEW'),
	(2, 'CANCELED_BY_SENDER'),
	(3, 'CANCELED_BY_RECEIVER'),
	(4, 'PAID');
/*!40000 ALTER TABLE `debt_status` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.deposits
DROP TABLE IF EXISTS `deposits`;
CREATE TABLE IF NOT EXISTS `deposits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `currencyId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.deposits: ~0 rows (approximately)
DELETE FROM `deposits`;
/*!40000 ALTER TABLE `deposits` DISABLE KEYS */;
/*!40000 ALTER TABLE `deposits` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.employees
DROP TABLE IF EXISTS `employees`;
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fullName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `refreshToken` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.employees: ~1 rows (approximately)
DELETE FROM `employees`;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` (`id`, `userName`, `password`, `fullName`, `email`, `refreshToken`) VALUES
	(1, 'truongchauhien', '$2b$12$sMCxa.E.fUEwlDhMSa64tuDpjqoLRd0hfFrYNPsqEzTFnesoaKwbK', 'Trương Châu Hiền -_-', 'truongchauhien@gmail.com', 'ebc908d17ceb71d5a64ecc658410997a6707ed651b95b5ad8aba711f6f68912b6bee0f4a7e3af6867537016ed781ccb9018328461108abe7458b2284d6eb7d7b');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.exchange_rates
DROP TABLE IF EXISTS `exchange_rates`;
CREATE TABLE IF NOT EXISTS `exchange_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromCurrencyId` int(11) NOT NULL,
  `toCurrencyId` int(11) NOT NULL,
  `exchangeRate` decimal(10,5) NOT NULL,
  `fromDate` timestamp NOT NULL,
  `toDate` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exchange_rates_currencies_1` (`fromCurrencyId`),
  KEY `fk_exchange_rates_currencies_2` (`toCurrencyId`),
  CONSTRAINT `fk_exchange_rates_currencies_1` FOREIGN KEY (`fromCurrencyId`) REFERENCES `currencies` (`id`),
  CONSTRAINT `fk_exchange_rates_currencies_2` FOREIGN KEY (`toCurrencyId`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.exchange_rates: ~0 rows (approximately)
DELETE FROM `exchange_rates`;
/*!40000 ALTER TABLE `exchange_rates` DISABLE KEYS */;
INSERT INTO `exchange_rates` (`id`, `fromCurrencyId`, `toCurrencyId`, `exchangeRate`, `fromDate`, `toDate`) VALUES
	(1, 1, 1, 1.00000, '2020-05-20 00:00:00', '2037-05-20 00:00:00');
/*!40000 ALTER TABLE `exchange_rates` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.fees
DROP TABLE IF EXISTS `fees`;
CREATE TABLE IF NOT EXISTS `fees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `amount` int(11) DEFAULT NULL,
  `currencyId` int(11) DEFAULT NULL,
  `percent` decimal(3,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `FK_fees_currencies` (`currencyId`),
  CONSTRAINT `FK_fees_currencies` FOREIGN KEY (`currencyId`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.fees: ~2 rows (approximately)
DELETE FROM `fees`;
/*!40000 ALTER TABLE `fees` DISABLE KEYS */;
INSERT INTO `fees` (`id`, `name`, `amount`, `currencyId`, `percent`) VALUES
	(1, 'INTRA_BANK_TRANSFER', 1000, 1, NULL),
	(2, 'INTER_BANK_TRANSFER', 2000, 1, NULL);
/*!40000 ALTER TABLE `fees` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) NOT NULL,
  `title` mediumtext NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `typeId` int(11) NOT NULL,
  `statusId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_notification_types` (`typeId`),
  KEY `fk_notifications_notification_status` (`statusId`),
  CONSTRAINT `fk_notifications_notification_status` FOREIGN KEY (`statusId`) REFERENCES `notification_status` (`id`),
  CONSTRAINT `fk_notifications_notification_types` FOREIGN KEY (`typeId`) REFERENCES `notification_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.notifications: ~0 rows (approximately)
DELETE FROM `notifications`;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.notification_status
DROP TABLE IF EXISTS `notification_status`;
CREATE TABLE IF NOT EXISTS `notification_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.notification_status: ~3 rows (approximately)
DELETE FROM `notification_status`;
/*!40000 ALTER TABLE `notification_status` DISABLE KEYS */;
INSERT INTO `notification_status` (`id`, `status`) VALUES
	(1, 'UNREAD'),
	(2, 'READ'),
	(3, 'HIDDEN');
/*!40000 ALTER TABLE `notification_status` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.notification_types
DROP TABLE IF EXISTS `notification_types`;
CREATE TABLE IF NOT EXISTS `notification_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.notification_types: ~5 rows (approximately)
DELETE FROM `notification_types`;
/*!40000 ALTER TABLE `notification_types` DISABLE KEYS */;
INSERT INTO `notification_types` (`id`, `type`) VALUES
	(1, 'GENERIC'),
	(2, 'DEBT_CREATED'),
	(3, 'DEBT_CANCELED_BY_SENDER'),
	(4, 'DEBT_CANCELED_BY_RECEIVER'),
	(5, 'DEBT_PAID');
/*!40000 ALTER TABLE `notification_types` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.reconciliations
DROP TABLE IF EXISTS `reconciliations`;
CREATE TABLE IF NOT EXISTS `reconciliations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromTime` timestamp NOT NULL,
  `toTime` timestamp NOT NULL,
  `withBankId` int(11) DEFAULT NULL,
  `isGenerating` tinyint(1) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reconciliations_banks` (`withBankId`),
  CONSTRAINT `fk_reconciliations_banks` FOREIGN KEY (`withBankId`) REFERENCES `banks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.reconciliations: ~0 rows (approximately)
DELETE FROM `reconciliations`;
/*!40000 ALTER TABLE `reconciliations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reconciliations` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `currencyId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_transactions_transaction_types` (`typeId`),
  KEY `fk_transactions_currencies` (`currencyId`),
  CONSTRAINT `fk_transactions_currencies` FOREIGN KEY (`currencyId`) REFERENCES `currencies` (`id`),
  CONSTRAINT `fk_transactions_transaction_types` FOREIGN KEY (`typeId`) REFERENCES `transaction_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.transactions: ~45 rows (approximately)
DELETE FROM `transactions`;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.transaction_types
DROP TABLE IF EXISTS `transaction_types`;
CREATE TABLE IF NOT EXISTS `transaction_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.transaction_types: ~11 rows (approximately)
DELETE FROM `transaction_types`;
/*!40000 ALTER TABLE `transaction_types` DISABLE KEYS */;
INSERT INTO `transaction_types` (`id`, `type`) VALUES
	(1, 'INTRABANK_TRANSFER'),
	(2, 'INTRABANK_RECEIVE'),
	(3, 'INTRABANK_TRANSFER_FEE'),
	(4, 'INTERBANK_TRANSFER'),
	(5, 'INTERBANK_RECEIVE'),
	(6, 'INTERBANK_TRANSFER_FEE'),
	(7, 'DEPOSIT'),
	(8, 'PAY_DEBT_TRANSFER'),
	(9, 'PAY_DEBT_RECEIVE'),
	(10, 'CLOSE_ACCOUNT_TRANSFER'),
	(11, 'CLOSE_ACCOUNT_RECEIVE');
/*!40000 ALTER TABLE `transaction_types` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.transfers
DROP TABLE IF EXISTS `transfers`;
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromCustomerId` int(11) DEFAULT NULL,
  `toCustomerId` int(11) DEFAULT NULL,
  `fromAccountNumber` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `toAccountNumber` varchar(32) NOT NULL,
  `fromBankId` int(11) NOT NULL DEFAULT (1),
  `toBankId` int(11) NOT NULL DEFAULT (1),
  `fromCurrencyId` int(11) NOT NULL,
  `toCurrencyId` int(11) NOT NULL,
  `fromAmount` decimal(20,5) NOT NULL,
  `toAmount` decimal(20,5) NOT NULL,
  `fromFee` decimal(20,5) NOT NULL,
  `toFee` decimal(20,5) NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT (_utf8mb4''),
  `otp` int(11) DEFAULT NULL,
  `otpAttempts` int(11) DEFAULT NULL,
  `statusId` int(11) NOT NULL,
  `typeId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comfirmedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_transfers_transfer_status` (`statusId`),
  KEY `FK_transfers_transfer_types` (`typeId`),
  KEY `FK_transfers_currencies_2` (`toCurrencyId`),
  KEY `FK_transfers_currencies_1` (`fromCurrencyId`),
  CONSTRAINT `FK_transfers_currencies_1` FOREIGN KEY (`fromCurrencyId`) REFERENCES `currencies` (`id`),
  CONSTRAINT `FK_transfers_currencies_2` FOREIGN KEY (`toCurrencyId`) REFERENCES `currencies` (`id`),
  CONSTRAINT `FK_transfers_transfer_status` FOREIGN KEY (`statusId`) REFERENCES `transfer_status` (`id`),
  CONSTRAINT `FK_transfers_transfer_types` FOREIGN KEY (`typeId`) REFERENCES `transfer_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.transfers: ~29 rows (approximately)
DELETE FROM `transfers`;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfers` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.transfer_status
DROP TABLE IF EXISTS `transfer_status`;
CREATE TABLE IF NOT EXISTS `transfer_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.transfer_status: ~6 rows (approximately)
DELETE FROM `transfer_status`;
/*!40000 ALTER TABLE `transfer_status` DISABLE KEYS */;
INSERT INTO `transfer_status` (`id`, `status`) VALUES
	(1, 'PENDING_CONFIRMATION'),
	(2, 'OVERTIME'),
	(3, 'REJECTED'),
	(4, 'REJECTED_BY_TARGET_BANK'),
	(5, 'CANCELED'),
	(6, 'COMFIRMED');
/*!40000 ALTER TABLE `transfer_status` ENABLE KEYS */;

-- Dumping structure for table InternetBanking.transfer_types
DROP TABLE IF EXISTS `transfer_types`;
CREATE TABLE IF NOT EXISTS `transfer_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table InternetBanking.transfer_types: ~3 rows (approximately)
DELETE FROM `transfer_types`;
/*!40000 ALTER TABLE `transfer_types` DISABLE KEYS */;
INSERT INTO `transfer_types` (`id`, `type`) VALUES
	(1, 'INTRABANK_TRANSFER'),
	(2, 'INTERBANK_TRANSFER'),
	(3, 'PAY_DEBT_TRANSFER');
/*!40000 ALTER TABLE `transfer_types` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
