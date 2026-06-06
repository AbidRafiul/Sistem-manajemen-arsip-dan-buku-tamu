  -- --------------------------------------------------------
  -- Host:                         127.0.0.1
  -- Server version:               8.0.30 - MySQL Community Server - GPL
  -- Server OS:                    Win64
  -- HeidiSQL Version:             12.1.0.6537
  -- --------------------------------------------------------

  /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
  /*!40101 SET NAMES utf8 */;
  /*!50503 SET NAMES utf8mb4 */;
  /*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
  /*!40103 SET TIME_ZONE='+00:00' */;
  /*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
  /*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
  /*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

  -- Dumping structure for table db_magang.access_token
  CREATE TABLE IF NOT EXISTS `access_token` (
    `ID` int NOT NULL AUTO_INCREMENT,
    `Token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `Expired` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
    `Datetime` datetime DEFAULT NULL,
    PRIMARY KEY (`ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.access_token: ~0 rows (approximately)

  -- Dumping structure for table db_magang.config
  CREATE TABLE IF NOT EXISTS `config` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Kode` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `Keterangan` text COLLATE utf8mb4_unicode_ci NOT NULL,
    PRIMARY KEY (`Id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.config: ~0 rows (approximately)

  -- Dumping structure for table db_magang.log
  CREATE TABLE IF NOT EXISTS `log` (
    `ID` bigint NOT NULL AUTO_INCREMENT,
    `Tgl` date DEFAULT NULL,
    `Controller` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `Function` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `Request` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `Response` text COLLATE utf8mb4_unicode_ci,
    `Stack` text COLLATE utf8mb4_unicode_ci,
    `User` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
    `DateTime` datetime DEFAULT NULL,
    PRIMARY KEY (`ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.log: ~0 rows (approximately)

  -- Dumping structure for table db_magang.mst_navigation
  CREATE TABLE IF NOT EXISTS `mst_navigation` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Menu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `Role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `CreatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`Id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.mst_navigation: ~0 rows (approximately)
  INSERT INTO `mst_navigation` (`Id`, `Menu`, `Role`, `CreatedAt`) VALUES
    (6, '[{"label":"HOME","items":[{"label":"Dashboard","icon":"pi pi-fw pi-home","to":"/dashboard"}]},{"label":"SETUP","items":[{"label":"Users","icon":"pi pi-fw pi-users","to":"/setup/users"},{"label":"Config","icon":"pi pi-fw pi-wrench","to":"/setup/config"}]}]', 'master', '2026-01-02 16:53:30');

  -- Dumping structure for table db_magang.nomor_faktur
  CREATE TABLE IF NOT EXISTS `nomor_faktur` (
    `Kode` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `Id` double DEFAULT NULL,
    PRIMARY KEY (`Kode`) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.nomor_faktur: ~0 rows (approximately)

  -- Dumping structure for table db_magang.user_credential
  CREATE TABLE IF NOT EXISTS `user_credential` (
    `Id` bigint NOT NULL AUTO_INCREMENT,
    `UniqueId` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `Username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `Fullname` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `Telp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `Role` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `Password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `Status` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
    `CreatedAt` timestamp NULL DEFAULT NULL,
    `UpdatedAt` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`Id`),
    CONSTRAINT `chk_status` CHECK ((`Status` in (_utf8mb4'0',_utf8mb4'1')))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.user_credential: ~0 rows (approximately)

  -- Dumping structure for table db_magang.user_navigation
  CREATE TABLE IF NOT EXISTS `user_navigation` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UniqueId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `Menu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `CreatedAt` datetime DEFAULT NULL,
    `UpdatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `uq_user_navigation_uniqueid` (`UniqueId`)
  ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- Dumping data for table db_magang.user_navigation: ~1 rows (approximately)
  INSERT INTO `user_navigation` (`Id`, `UniqueId`, `Menu`, `CreatedAt`, `UpdatedAt`) VALUES
    (1, 'USR000000', '[{"label":"HOME","items":[{"label":"Dashboard","icon":"pi pi-fw pi-home","to":"/dashboard"}]},{"label":"SETUP","items":[{"label":"Users","icon":"pi pi-fw pi-users","to":"/setup/users"},{"label":"Config","icon":"pi pi-fw pi-wrench","to":"/setup/config"}]}]', '2026-01-02 16:54:16', '2026-01-02 16:54:17');

  /*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
  /*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
  /*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
  /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
  /*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
