-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: office_automation
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `ifsc_code` varchar(255) NOT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES (1,'Federal Bank','Essar Engineers','17160100001984','FDRL0001617','Kakkanad','vishnuvox','qr-1778135118470.png',1,'2026-05-07 06:25:18','2026-05-07 06:25:18');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `billing_type` enum('fixed','hourly') DEFAULT 'fixed',
  `invoice_number` varchar(255) DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `notes` text,
  `due_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `invoice_prefix` varchar(255) DEFAULT 'vox',
  `invoice_no` varchar(255) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `po_no` varchar(255) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `payment_terms` varchar(255) DEFAULT NULL,
  `sales_person` varchar(255) DEFAULT NULL,
  `items` json DEFAULT NULL,
  `shipping_charges` decimal(10,2) DEFAULT '0.00',
  `discount_total` decimal(10,2) DEFAULT '0.00',
  `custom_amount` decimal(10,2) DEFAULT '0.00',
  `advance_payment` decimal(10,2) DEFAULT '0.00',
  `terms_conditions` text,
  `private_notes` text,
  `sub_total` decimal(10,2) DEFAULT '0.00',
  `cgst` decimal(10,2) DEFAULT '0.00',
  `sgst` decimal(10,2) DEFAULT '0.00',
  `rounding` decimal(10,2) DEFAULT '0.00',
  `cgst_percent` decimal(5,2) DEFAULT '9.00',
  `sgst_percent` decimal(5,2) DEFAULT '9.00',
  `bank_account_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  UNIQUE KEY `invoice_number_2` (`invoice_number`),
  UNIQUE KEY `invoice_number_3` (`invoice_number`),
  UNIQUE KEY `invoice_number_4` (`invoice_number`),
  UNIQUE KEY `invoice_number_5` (`invoice_number`),
  UNIQUE KEY `invoice_number_6` (`invoice_number`),
  UNIQUE KEY `invoice_number_7` (`invoice_number`),
  UNIQUE KEY `invoice_number_8` (`invoice_number`),
  UNIQUE KEY `invoice_number_9` (`invoice_number`),
  UNIQUE KEY `invoice_number_10` (`invoice_number`),
  UNIQUE KEY `invoice_number_11` (`invoice_number`),
  UNIQUE KEY `invoice_number_12` (`invoice_number`),
  UNIQUE KEY `invoice_number_13` (`invoice_number`),
  UNIQUE KEY `invoice_number_14` (`invoice_number`),
  UNIQUE KEY `invoice_number_15` (`invoice_number`),
  UNIQUE KEY `invoice_number_16` (`invoice_number`),
  UNIQUE KEY `invoice_number_17` (`invoice_number`),
  UNIQUE KEY `invoice_number_18` (`invoice_number`),
  UNIQUE KEY `invoice_number_19` (`invoice_number`),
  UNIQUE KEY `invoice_number_20` (`invoice_number`),
  UNIQUE KEY `invoice_number_21` (`invoice_number`),
  UNIQUE KEY `invoice_number_22` (`invoice_number`),
  UNIQUE KEY `invoice_number_23` (`invoice_number`),
  UNIQUE KEY `invoice_number_24` (`invoice_number`),
  UNIQUE KEY `invoice_number_25` (`invoice_number`),
  UNIQUE KEY `invoice_number_26` (`invoice_number`),
  UNIQUE KEY `invoice_number_27` (`invoice_number`),
  UNIQUE KEY `invoice_number_28` (`invoice_number`),
  UNIQUE KEY `invoice_number_29` (`invoice_number`),
  UNIQUE KEY `invoice_number_30` (`invoice_number`),
  UNIQUE KEY `invoice_number_31` (`invoice_number`),
  UNIQUE KEY `invoice_number_32` (`invoice_number`),
  UNIQUE KEY `invoice_number_33` (`invoice_number`),
  UNIQUE KEY `invoice_number_34` (`invoice_number`),
  KEY `task_id` (`task_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `billing_ibfk_67` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `billing_ibfk_68` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing`
--

LOCK TABLES `billing` WRITE;
/*!40000 ALTER TABLE `billing` DISABLE KEYS */;
INSERT INTO `billing` VALUES (1,2,1,0.00,'fixed','INV-202604-6232','pending','test','2026-04-21','2026-04-21 11:40:18','2026-04-22 09:43:11','vox',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,0.00,NULL,NULL,0.00,0.00,0.00,0.00,9.00,9.00,NULL),(2,NULL,2,2360.00,'fixed','ESSAR-1001','pending','','2026-05-08','2026-05-12 15:36:03','2026-05-12 15:36:03','ESSAR','1001','2026-05-12',NULL,NULL,NULL,NULL,'[{\"mrp\": \"2500.00\", \"qty\": 1, \"name\": \"Axiostat Military 5x5\", \"price\": \"2000.00\", \"total\": \"2000.00\", \"hsn_code\": \"3005\"}]',0.00,0.00,0.00,0.00,'1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days',NULL,2000.00,180.00,180.00,0.00,9.00,9.00,1),(3,NULL,2,2566.00,'fixed','ESSAR-1002','pending','','2026-05-08','2026-05-12 15:38:39','2026-05-12 15:38:39','ESSAR','1002','2026-05-12',NULL,NULL,NULL,NULL,'[{\"mrp\": \"715.00\", \"qty\": 1, \"name\": \"Biofil Particles 10ml\", \"price\": \"544.76\", \"total\": \"544.76\", \"hsn_code\": \"30061010\"}, {\"mrp\": \"827.00\", \"qty\": 1, \"name\": \"Biofil Sponge 10x10cm\", \"price\": \"630.10\", \"total\": \"630.10\", \"hsn_code\": \"30061010\"}, {\"mrp\": \"1250.00\", \"qty\": 1, \"name\": \"Biofil 6x6\", \"price\": \"1000.00\", \"total\": \"1000.00\", \"hsn_code\": \"3005\"}]',0.00,0.00,0.00,0.00,'1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days',NULL,2174.86,195.74,195.74,-0.33,9.00,9.00,1);
/*!40000 ALTER TABLE `billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES ('05f5c31e-ecd3-4041-9373-8ae56d71622a','Hydrofil','Hydrofil brand products','2026-03-20 11:39:14','2026-03-20 11:39:14'),('09c53851-dd7d-4ddd-ae41-912002ce6513','Kollagen-D','Kollagen-D brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('0e46357f-4731-475d-8f06-4acf3f717012','Sanyrene','Sanyrene brand products','2026-03-20 04:56:38','2026-03-20 04:56:38'),('171bb6a0-d070-42ef-9d85-b6cfc8330188','Velox care','Velox care brand products','2026-03-20 04:56:38','2026-03-20 04:56:38'),('2b40ff62-b245-4ee3-9666-9057fe9b445d','Urgostart','Urgostart brand products','2026-03-20 07:41:24','2026-03-20 07:41:24'),('30783824-2632-405d-a046-aad64dc4b0c1','Axiostat','Axiostat brand products','2026-03-20 11:39:14','2026-03-20 11:39:14'),('5f2f3bd7-82d2-4d5c-b6e7-6406f62795f4','Dermifill','Dermifill brand products','2026-03-20 11:39:14','2026-03-20 11:39:14'),('62c0e706-6d87-42ce-ba9c-62d20dca5466','Kollagen','Kollagen brand products','2026-03-20 04:56:38','2026-03-20 04:56:38'),('6fec9fbe-dfda-4723-87b2-360eb134f362','Neuskin','Neuskin brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('7c0b71fb-5809-4b13-8d3b-dbb512e04923','Kollagen-M','Kollagen-M brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('7c13f187-14a9-476b-9ad2-6ba11f30f2d7','NoWound','NoWound brand products','2026-03-20 04:56:38','2026-03-20 04:56:38'),('89d5a7b0-cb0a-419b-870a-9669293cfc27','Sybograf','Sybograf brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('93fef7e5-bcef-43b1-b940-43f127cec975','Lysil','Lysil brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('94997a64-bc9b-40fc-b60b-142e454a2767','Urgo','Urgo brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('984c7b95-46b8-4cd8-b32b-2b28e5b844f6','Collafill','Collafill brand products','2026-03-20 11:39:14','2026-03-20 11:39:14'),('9ac3c91a-1361-4e9a-9de2-57cd8c9ca97f','Surgifill','Surgifill brand products','2026-03-20 11:39:14','2026-03-20 11:39:14'),('9c5523a9-8d93-461d-9cd7-00f32b808bbb','Biofil','Biofil brand products','2026-03-20 04:56:38','2026-03-20 04:56:38'),('bb89663e-137f-41b5-8297-8a695400778c','Periocol-GTR','Periocol-GTR brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('d3e6dfef-70a7-4a7d-9ad7-df489e554d77','Urgotul','Urgotul brand products','2026-03-20 07:41:24','2026-03-20 07:41:24'),('d5177530-2089-4636-b55c-6fcdde9f36f5','Neuskin-F','Neuskin-F brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('f55c8763-f83f-4983-bda5-b2d4b39671f5','Biofil-AB','Biofil-AB brand products','2026-03-20 07:41:23','2026-03-20 07:41:23'),('fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','Gelspon','Gelspon brand products','2026-03-20 04:56:38','2026-03-20 04:56:38');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('08a3d281-b4e9-49f7-ad45-c012aaf908f1','Skin Care','Skin Care category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('1e06c5b7-4bc4-444f-bbcc-3d0256bad637','Surgical Hemostat','Surgical Hemostat category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('249d9e61-f56c-49c5-b5f1-8d7c77dcde31','Therapy Bag','Therapy Bag category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('4da9cb0b-9ba4-48e1-a572-084239011aac','Bone Graft','Bone Graft category','2026-03-20 07:41:23','2026-03-20 07:41:23'),('6a8eedc4-95f5-4a72-9653-05ed00af0339','Hemostat','Hemostat category','2026-03-20 11:39:14','2026-03-20 11:39:14'),('87702d87-3b82-4000-9272-115169d2a4ab','Wound Care','Wound Care category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('936a287d-7d48-421c-a5bc-51e9f239e46f','NPWT Dressing','NPWT Dressing category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e','Advanced Dressing','Advanced Dressing category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('a142235b-7e74-4e94-aa9f-86415fd1bec6','Oxygen Therapy','Oxygen Therapy category','2026-03-20 11:39:14','2026-03-20 11:39:14'),('e6fbeee7-ba72-4cf2-8a9c-947d982e66b3','GTR Membrane','GTR Membrane category','2026-03-20 07:41:23','2026-03-20 07:41:23'),('ec9a05b8-47ed-4c9c-b06c-fd28cc56a18d','NPWT Canister','NPWT Canister category','2026-03-20 04:56:38','2026-03-20 04:56:38'),('f2784a42-324b-47db-869f-41e3559c6dc6','NPWT','NPWT category','2026-03-20 11:39:14','2026-03-20 11:39:14'),('fddf1c50-1f81-4f30-8ac5-065da8cf08e3','VAC DRESSING (NPWT)','VAC DRESSING (NPWT) category','2026-04-13 08:16:23','2026-04-13 08:16:23');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'Santhamma','9048402911','santhavox@gmail.com','P221 DLF','test','2026-04-21 04:12:10','2026-04-21 04:12:10'),(2,'Vishnu','9497332344','vishnuvox@gmail.com','P221 DLF\n',NULL,'2026-04-21 04:12:45','2026-04-21 04:12:45');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `pin_code` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `service_tax_no` varchar(255) DEFAULT NULL,
  `tax_inclusive_rates` tinyint(1) DEFAULT '0',
  `default_currency` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `address_line_1` varchar(255) DEFAULT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `taxation_type` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profiles`
--

LOCK TABLES `company_profiles` WRITE;
/*!40000 ALTER TABLE `company_profiles` DISABLE KEYS */;
INSERT INTO `company_profiles` VALUES (1,'Essar Engineers','India','Kochin','685581','info@essarengineers.co.in','9497332344','',0,'INR','Kerala','P221 DLF New Highlight','','essarengineers.co.in','GST','Sonal','logo-1778254158461.png','2026-05-07 10:19:01','2026-05-08 15:29:18'),(2,'','','','','','','',0,'INR','','','','','','',NULL,'2026-05-07 10:19:01','2026-05-07 10:19:01');
/*!40000 ALTER TABLE `company_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_name` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `hospital_id` int DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `address` text,
  PRIMARY KEY (`id`),
  KEY `hospital_id` (`hospital_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'Jimmy Mathew',NULL,NULL,'9446545001',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','404, NATIONAL EXCELLENCY, KALAVATH ROAD, Palarivattam'),(2,'Aniraj R',NULL,1,'9447304576',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Professor, Dept of Plastic Surgery, Govt Medical College, Thiruvananthapuram'),(3,'PRINCE HP',NULL,2,'9656091375',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','DEPT OF PLASTIC SURGERY, ELITE MISSION HOSPITAL,KOORKENCHERY ,THRISSUR'),(4,'Dr Ajai kumar kamath',NULL,NULL,'9447302078',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Akarshan, green acres , parolickal ettumanoor'),(5,'Dr Kunhambu Nambiar',NULL,3,'9447088931',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Lakshmi,13/834A, chemmattamvayal, BALLA POST, KANHANGAD , Kasaragod671532'),(6,'Dr.DURGA M.L.S',NULL,4,'9966998890',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Amritha medical college i,ponnekara, kochi'),(7,'DR JOSE THARAYIL',NULL,NULL,'9946444391',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','.,MUTTATHIL LANE, KADAVANVTHARA, KOCHI 682020'),(8,'Pradeep Kumar',NULL,NULL,'09845470297',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','A 1141 , sobha topaz , sobha city , thrissur , kerala. 680553'),(9,'Priyavrata Rajasubramanian',NULL,5,'7760008166',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Department of Plastic Surgery, Government Medical College, Kozhikode'),(10,'Dr. VINU ROY',NULL,6,'9447780729',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Villa no:41,Haritha homes,Vadookkara,Thrissur'),(11,'DR P KISHORE',NULL,7,'9349254003',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Amritahyanam, 31/514, AKG ROAD, EDAPPALLY PO, Pin 682024, Ernakulam'),(12,'CHARLES JUDE ANTO',NULL,NULL,'9446340304',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Thettayil house, Konni P.O., Pathanamthitta district. Pin - 689691'),(13,'Dr Cyril Joseph',NULL,NULL,'9495329520',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','The Dream , Kudakasseril House, Kattode, Manjadi. PO, Thiruvalla, Kerala-689105'),(14,'NANDAKUMAR. U. R',NULL,NULL,'9447131454',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','TC 26/1731, \"Lakshmi\", Vadayakkad Jn., Vanchiyoor P. O, Trivandrum - 695035'),(15,'Patrick Paul',NULL,8,'9526100384',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Room 19, Doctors Quarters, Travancore Medicity, Kollam.'),(16,'LINTO T. MATHEW',NULL,9,'9497392255',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','SENIOR RESIDENT, DEPARTMENT OF PLASTIC AND RECONSTRUCTIVE SURGERY, GOVT.'),(17,'Paul Joyce',NULL,NULL,'7507296474',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Payyapilly house, Eden 10, Kavaraparambu, Nayathode PO, Angamaly, Kerala.'),(18,'Sri Valli Vemulapalli',NULL,10,'9876074894',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Dept of plastic surgery, Amrita institute of medical science, edappally, kochi'),(19,'Greshma T R',NULL,NULL,'9074922823',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','W/o Jose paul.43-F,STP pipeline road,elamkulam,682020'),(20,'Sannia Salim',NULL,NULL,'9495761029',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Valanjambalam pallimukku kochi'),(21,'DR AJAI K S',NULL,2,'9915817073',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','DEPT OF PLASTIC SURGERY ,KOORKENCHERY,ELITE MISSION HOSPITAL'),(22,'RANITHA RAVINDRAN',NULL,11,'9496347070',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','\"Lakshmi Smrithi\", Minalur P.O, Mulakunnathukavu Via, Thrissur 680581'),(23,'Alexander G',NULL,12,'9847139470',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','EMC Hospital, kochi, kerala , India'),(24,'Anoop S.',NULL,13,'9496815905',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Department of Plastic Surgery, MOSC Medical College, Kolenchery, Ernakulam. 682311'),(25,'ATHIRA C',NULL,14,'9388848555',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Senior resident, department of plastic and reconstructive surgery, GMC, TVM'),(26,'Akshaya M',NULL,5,'9562477907',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Senior Resident, Government Medical College, Kozhikode'),(27,'AMAL T S',NULL,NULL,'9567667762',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','SAAJ BHAVAN, PATTANAKKAD P O, CHERTHALA, ALAPPUZHA, 688531'),(28,'AKSHAI GEORGE PAUL',NULL,15,'9605747584',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','3rd year Plastic surgery ResidentDepartment of Plastic SurgeryAster MIMS Calicut'),(29,'Steve Reji Thomas',NULL,NULL,'9995071060',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Amayil house, Nannuvacadu, Pathanamthitta, Kerala, 689645'),(30,'Shubha Lakshmi Kadukk',NULL,16,'8309673838',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Amrita hospital, ponnekara road Edappally, Ernakulam kochi, Kerala.'),(31,'Sheyon Yohannan',NULL,NULL,'+917876369980',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Kolangara MansionNear Christ College Junction, Thrissur Shornur Road, Irinjalakuda, Thrissur'),(32,'Thomas Punnoose',NULL,NULL,'9495682845',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Pulimoottil House, Kunnamthanam P.O, Pathanamthitta Dt, 689581'),(33,'JAGADEESH SREENIVA',NULL,NULL,'+919895342522',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Indeevaram, Near Nelliekodu housing colony, Kavu bus stop,Chevayour P OCalicut. Pin 673017'),(34,'Nidhi Miriam Eapen',NULL,NULL,'8289982700',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Kochuveettil Bethel, Kozhencherry East (PO), Pathanamthitta -689641'),(35,'DR DRISHYA DEVASIA',NULL,NULL,'7012888654',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','ALRA 11B, Ashramam Lane, Azad Road, Kaloor, Kochi 682017'),(36,'DEEPAK ARAVIND',NULL,NULL,'9447453525',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Dhwani,Behind Orchid Cafe,BETHELPADI,KUTTAPUZHA P O,THIRUVALLA, PATHANAMTHIT'),(37,'Sreelal Sreedharan',NULL,NULL,'9846266067',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','TC3/502(10),sandhram, GSN77,Gandhismaraka nagar,muttada.p.o,Trivandrum 695025'),(38,'Dr. Sharika Chandran',NULL,NULL,'8884407632',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','ARA 117, Athani Lane, Vanchiyur, Trivandrum'),(39,'AARATHI ANTHARJAN',NULL,17,'9746652958',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','SENIOR CONSULTANT PLASTIC SURGERYBABY MEMORIAL HOSPITAL KANNUR'),(40,'THUSHARA K R',NULL,NULL,'9895513445',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','T C- 43/510(2), Ariyan kuzhi, Manacaud. P.O, Trivandrum,  695009, Kerala'),(41,'Subramania Iyer',NULL,NULL,'9447108842',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Tower 2 17c tritvam apartment marine drive extension kochi 682018'),(42,'Lekshmi M',NULL,14,'9446065454',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Prof &HOD, Dept of Plastic Surgery, GMC Kottayam'),(43,'Jyoshid R Balan',NULL,18,'8113005557',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Villa 18, Elite Meadows, Amalanagar'),(44,'Sharun Abey Kurian',NULL,14,'8075433603',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Dept of Plastic Surgery, GMC Kottayam'),(45,'Aswathy Chandran',NULL,NULL,'7022604724',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat number 7F, Skyline grace apartment, Cathedral church road,Pala, Kottayam'),(46,'Dr.Faiyaz Abdul Jabbar',NULL,19,'8904535223',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Flat:8B,  KMP Swapnapuri, Chembukkavu, Thrissur - 680020'),(47,'R. Jayakumar',NULL,20,'9446077148',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Specialists hospital, Kochi'),(48,'Deepak Shanbhag',NULL,21,'9008416686',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','4A Si Coral crest, SRM road, Ernakulum north'),(49,'ABHIJITH ANTONY',NULL,NULL,'8089807859',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat No 5103, Tower 5, Prestige Hillside Gateway, Infopark Road Kakkanad , Kalappurakkal,'),(50,'Sarath TS',NULL,NULL,'9447122369',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat no 3E ArtechPalmgrove , Polayathodu,Kollam'),(51,'DIVYA SYAM',NULL,22,'8971045643',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','3C, DD WEST WINDS, LISIE HOSPITAL ROAD, KACHERIPADY, KOCHI'),(52,'Joyal Jose',NULL,NULL,'9400355717',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Eluvathingal, Anakkal, Kanjirapally, Kottayam'),(53,'Aneesh Joseph',NULL,NULL,'9496336445',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Punnolikunnel house, Thankamany P O, idukki 685584'),(54,'Renji Issac james',NULL,NULL,'7034884629',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Puliyunnil house, kanjar p o'),(55,'Sankar Das',NULL,23,'08547884761',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Shivashakthi (Karottu), GP Road,Near mariyamman Kovil'),(56,'Dr Hemang Arvindkuma',NULL,NULL,'9833654291',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','6c mulberry mystic rose St Christopher lane Kizhakkumpattukara near nirmalamata school thris'),(57,'Pradeoth Mukundan Ko',NULL,24,'9048935409',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Villa no.2, Confident aries, Vilvattom, Kuriachira  P.O. Thrissur, Kerala 680006'),(58,'Dr Sheeja Rajan TM',NULL,NULL,'9747001136',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Shrirang, Chevayur, Kozhikode'),(59,'Dr.S.Zuveriya Zasreen',NULL,NULL,'6304145853',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat no 402 Prasanna Vihar Army flat AWHO ,Marine drive,Kochi ,Kerala 682018'),(60,'Dr. Navien Issac John',NULL,25,'8872375699',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Dept.of plastic surgery, Jubilee Mission Medical College, Thrissur'),(61,'MANOJ KUSHRA R',NULL,NULL,'9447289106',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Srishti TRRA 135C Chalkavattom Vennala PO. Ernakulam 682028'),(62,'P K MOHANAN',NULL,26,'9847035840',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Dept.of Surgery, Amala Medical College, Thrissur'),(63,'Sreelesh Sreedhar',NULL,NULL,'+919745005017',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Thaara House, Nanminda P O, Kozhikode 673613'),(64,'Dr Bhaskara k g',NULL,27,'09895545828',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Medical trust Hospital kochi'),(65,'Shaji Mathew',NULL,28,'9847450785',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Plot-17, Yasoram Garden phase-1, Ollur P. O, Thrissur, PIN 680306'),(66,'M.V.Raman',NULL,NULL,'9847306650',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Maheswari, 134 - Westhill,Thrissur PIN 680006'),(67,'DEEPAK B',NULL,29,'9446467898',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Almas hospital, Kottakal'),(68,'Jayakrishnan kolady',NULL,30,'9847875758',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Amala HospitalTrissur'),(69,'Dinkar Sreekumar',NULL,NULL,'7259360930',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat No. 7G, 7th Floor, Soubhagya Apartments,Indira Gandhi Road,Puthiyara PO, Kozhikode'),(70,'Akhila Mohan',NULL,31,'9656397983',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Travancore meridian,kannammoola P.O,Trivandrum'),(71,'Sabu C.P.',NULL,32,'9446428094',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','SARAL NLRA 6 Neerazhi lane Ulloor Medical College P O Trivandrum'),(72,'John Oommen',NULL,NULL,'9947334427',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','30, Kanniya nagar TVS nagar road Koundampalayam, Coimbatore 641030'),(73,'James Roy Kanjoor',NULL,NULL,'9994430707',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','No 20 MTP road Coimbatore 641043'),(74,'Helen Mary Titus',NULL,NULL,'8075046713',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Kalathiparambil house,palliport po ,ernakulam'),(75,'Gigv Raj Kulangara',NULL,33,'8921398507',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Rajagiri Hospital, Aluva'),(76,'Dr Abraham G Thomas',NULL,NULL,'+918054800989',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Gracefield, Thamarassery 673573'),(77,'BINOD PRABHAKARAN',NULL,NULL,'9446504396',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','TC 4/883 MOKKATIL KOWDIAR TRIVANDRUM'),(78,'Praveen A J',NULL,34,'08284807604',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','11b, Asset silverstreak apartments, Keezhmad, KUTTAMASSERY, Ernakulam, 683105'),(79,'Sanju Samuel',NULL,NULL,'8056190899',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Edapally,kochi'),(80,'Asish George Daniel',NULL,35,'9446358887',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Shelumiel, SRA-22, Sreemoolam road, Kumarapuram, Medical College PO, Thiruvananthapura'),(81,'Philip Philip Puthumana',NULL,NULL,'9847054883',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Puthumana, I.T.I junction, Chengannur P.O,PIN 689121'),(82,'Dr Suneesh P J',NULL,NULL,'9447313278',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Pulikottil House, Harmony lane, Laloor road, Thrissur'),(83,'Anjith V G',NULL,NULL,'9847165925',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Gangothri Unity Nagar Kuriachira Thrissur 680008'),(84,'Rohit S.',NULL,NULL,'9480188500',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Puthenpurayil House, kavitha road , Murattupuzha'),(85,'Arjun asokan',NULL,36,'09442850682',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Villa 28, Grand County Villas, kakkanad'),(86,'Thomas M David',NULL,37,'8281864295',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Mundackal, Near CMS College, Kottayam 686001'),(87,'Sam Thomas',NULL,NULL,'9496835972',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Flat no 112, Metroparadise Apartment, edayakunnam kappela, cheranelloor, ernakulam'),(88,'Dinesh Kadam',NULL,NULL,'9886312711',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Mangalore'),(89,'Dr. Joseph Thomas',NULL,38,'+919995783582',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Dept of Plastic Surgery, KMC Manipal, Udupi, Karnataka 576104'),(90,'FIRAS MOHAMMED A',NULL,15,'9447785627',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','Department of Plastic Surgery,Aster MIMS, Kottakkal, Malappuram'),(91,'Nibu Kuttappan',NULL,NULL,'9446470368',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Misty meadows villa c10 chala kannur kerala'),(92,'Dr Hari Venkatramani',NULL,39,'9842202422',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','3B Mayflower Woodside , Bharathi Park Main road , Saibaba Colony , Coimbatore 6410143'),(93,'Dr Nitin Mokal',NULL,40,'09820016700',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','SUSHRUT-7,MBPT Hospital Campus Wadala East Mumbai 400037'),(94,'DR JITEN KULKARNI',NULL,41,'9822017579',NULL,'2026-04-13 07:34:34','2026-04-13 07:44:16','NIRMITI HOSPITAL, 4, ASHOK NAGAR, GARKHEDA, AURANGABAD'),(95,'Dinesh Thekkinkattil',NULL,NULL,'+447912383436',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','44, Soothern Lane, Lincoln, Lincolnshire. LN2 2QJ. UK'),(96,'Achyutha Krishna Anum',NULL,NULL,'9113679515',NULL,'2026-04-13 07:34:34','2026-04-13 07:34:34','Sree Poomakripa 51/2757 Beside Poonithura Kottaram temple, Marad 682038');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,'test',456.00,'Other','2026-04-21','test',1,'2026-04-21 11:39:34','2026-04-21 11:39:34');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_name` varchar(255) NOT NULL,
  `location` text,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `hospitals_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitals`
--

LOCK TABLES `hospitals` WRITE;
/*!40000 ALTER TABLE `hospitals` DISABLE KEYS */;
INSERT INTO `hospitals` VALUES (1,'Govt Medical College','Thiruvananthapuram',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(2,'ELITE MISSION HOSPITAL','KOORKENCHERY ,THRISSUR',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(3,'Lakshmi','13/834A, chemmattamvayal, BALLA POST, KANHANGAD , Kasaragod671532',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(4,'Amritha Medical College','ponnekara, kochi',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(5,'Government Medical College','Kozhikode',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(6,'Villa no:41,Haritha homes','Vadookkara,Thrissur',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(7,'Amritahyanam','31/514, AKG ROAD, EDAPPALLY PO, Pin 682024, Ernakulam',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(8,'Travancore Medicity','Room 19, Doctors Quarters, Kollam.',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(9,'GOVT','SENIOR RESIDENT, DEPARTMENT OF PLASTIC AND RECONSTRUCTIVE SURGERY',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(10,'Amrita Institute of Medical Science','edappally, kochi',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(11,'Lakshmi Smrithi','Minalur P.O, Mulakunnathukavu Via, Thrissur 680581',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(12,'EMC Hospital','kochi, kerala , India',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(13,'MOSC Medical College','Kolenchery, Ernakulam. 682311',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(14,'GMC','TVM',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(15,'Aster MIMS','Calicut',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(16,'Amrita hospital','ponnekara road Edappally, Ernakulam kochi, Kerala.',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(17,'BABY MEMORIAL HOSPITAL','KANNUR',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(18,'Elite Meadows','Amalanagar',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(19,'KMP Swapnapuri','Chembukkavu, Thrissur - 680020',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(20,'Specialists hospital','Kochi',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(21,'4A Si Coral crest','SRM road, Ernakulum north',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(22,'LISIE HOSPITAL','3C, DD WEST WINDS, ROAD, KACHERIPADY, KOCHI',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(23,'Shivashakthi','GP Road,Near mariyamman Kovil',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(24,'Confident aries','Villa no.2, Vilvattom, Kuriachira  P.O. Thrissur, Kerala 680006',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(25,'Jubilee Mission Medical College','Thrissur',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(26,'Amala Medical College','Thrissur',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(27,'Medical trust Hospital','kochi',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(28,'Yasoram Garden','Plot-17, phase-1, Ollur P. O, Thrissur, PIN 680306',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(29,'Almas hospital','Kottakal',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(30,'Amala Hospital','Trissur',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(31,'Travancore meridian','kannammoola P.O,Trivandrum',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(32,'Ulloor Medical College','SARAL NLRA 6 Neerazhi lane P O Trivandrum',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(33,'Rajagiri Hospital','Aluva',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(34,'Asset silverstreak apartments','11b, Keezhmad, KUTTAMASSERY, Ernakulam, 683105',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(35,'Medical College','Shelumiel, SRA-22, Sreemoolam road, Kumarapuram, PO, Thiruvananthapura',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(36,'Grand County Villas','Villa 28, kakkanad',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(37,'CMS College','Mundackal, Near Kottayam 686001',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(38,'KMC','Manipal, Udupi, Karnataka 576104',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(39,'Mayflower Woodside','3B , Bharathi Park Main road , Saibaba Colony , Coimbatore 6410143',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(40,'MBPT Hospital','SUSHRUT-7, Campus Wadala East Mumbai 400037',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16'),(41,'NIRMITI HOSPITAL','4, ASHOK NAGAR, GARKHEDA, AURANGABAD',NULL,NULL,NULL,'2026-04-13 07:44:16','2026-04-13 07:44:16');
/*!40000 ALTER TABLE `hospitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `product_code` varchar(255) NOT NULL,
  `hsn_code` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `units_per_box` int DEFAULT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `ptr` decimal(10,2) DEFAULT NULL,
  `pts` decimal(10,2) DEFAULT NULL,
  `ptd` decimal(10,2) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `current_stock` int DEFAULT '0',
  `reorder_level` int DEFAULT '10',
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `brand_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_code` (`product_code`),
  UNIQUE KEY `product_code_2` (`product_code`),
  UNIQUE KEY `product_code_3` (`product_code`),
  UNIQUE KEY `product_code_4` (`product_code`),
  UNIQUE KEY `product_code_5` (`product_code`),
  UNIQUE KEY `product_code_6` (`product_code`),
  UNIQUE KEY `product_code_7` (`product_code`),
  UNIQUE KEY `product_code_8` (`product_code`),
  UNIQUE KEY `product_code_9` (`product_code`),
  UNIQUE KEY `product_code_10` (`product_code`),
  UNIQUE KEY `product_code_11` (`product_code`),
  UNIQUE KEY `product_code_12` (`product_code`),
  UNIQUE KEY `product_code_13` (`product_code`),
  UNIQUE KEY `product_code_14` (`product_code`),
  UNIQUE KEY `product_code_15` (`product_code`),
  UNIQUE KEY `product_code_16` (`product_code`),
  UNIQUE KEY `product_code_17` (`product_code`),
  UNIQUE KEY `product_code_18` (`product_code`),
  UNIQUE KEY `product_code_19` (`product_code`),
  UNIQUE KEY `product_code_20` (`product_code`),
  UNIQUE KEY `product_code_21` (`product_code`),
  UNIQUE KEY `product_code_22` (`product_code`),
  UNIQUE KEY `product_code_23` (`product_code`),
  UNIQUE KEY `product_code_24` (`product_code`),
  UNIQUE KEY `product_code_25` (`product_code`),
  UNIQUE KEY `product_code_26` (`product_code`),
  UNIQUE KEY `product_code_27` (`product_code`),
  UNIQUE KEY `product_code_28` (`product_code`),
  UNIQUE KEY `product_code_29` (`product_code`),
  UNIQUE KEY `product_code_30` (`product_code`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_59` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_60` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('01523a2c-bd2c-49b9-91b0-b9565a22c082','Biofil 6x6','BF-66','3005',NULL,5,1250.00,1000.00,0.00,0.00,12.00,15,10,'ACTIVE','2026-03-20 11:39:14','2026-05-06 17:15:49','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('05586794-8bc4-499c-aeff-49cb58c2250b','Periocol-GTR 25x30mm','PGMS 1001','30061010',NULL,5,1787.00,1361.52,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','bb89663e-137f-41b5-8297-8a695400778c','e6fbeee7-ba72-4cf2-8a9c-947d982e66b3'),('05ea6ee9-e9fa-48ec-91fb-670225acabe2','Axiostat Surgical 8x8','AX-SUR-88','3005',NULL,1,3000.00,2400.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','30783824-2632-405d-a046-aad64dc4b0c1','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('05ea8bc9-ec52-4396-b988-c5a53ab88b2c','Lysil 10x10cm','LSFF 1004','30051090',NULL,1,2333.00,1777.52,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('065c65c2-c2ca-406b-a22b-2353a0d5d0b3','Biofil 2x2','BF-22','3005',NULL,5,450.00,360.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('0800f31b-b681-4517-b1f5-57bcf84ef807','NPWT Canister 600 ML','NOW-NPWT-C600',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,10,'ACTIVE','2026-04-13 08:16:23','2026-04-13 08:16:23','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','fddf1c50-1f81-4f30-8ac5-065da8cf08e3'),('080222fb-dd1c-4f27-833c-2bec2e309b01','Urgostart Contact 5x7cm','754122','30051090',NULL,10,454.00,345.90,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('0ef186aa-6c01-445e-9a25-237ed2b1208a','Biofil 10x10','BF-1010','3005',NULL,5,2250.00,1800.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('127878ff-120e-4951-bf28-6415b276ed3a','NPWT Dressing Kit - Small','NW-DK-S','9018',NULL,1,6500.00,5200.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','f2784a42-324b-47db-869f-41e3559c6dc6'),('16f70903-8aed-4c42-934e-851bc45a8f90','Urgostart Border 8x8cm','601392','30051020',NULL,10,797.00,607.24,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('17a25175-6ddf-480f-934e-704311909a7a','Urgostart Micro Adhesive 10x10cm(MDD)','601598','30051090',NULL,10,984.00,749.71,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('18e8b6ee-1dda-4369-b3d4-e73294b5ee37','Kollagen-M 20x40cm','KGMS 1006','30061010',NULL,2,2694.00,2052.57,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','7c0b71fb-5809-4b13-8d3b-dbb512e04923','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('1a05587c-d7d2-4a84-b404-2ee34b385333','Urgostart Micro Adhesive 6x6cm','601597','30051090',NULL,10,701.00,534.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('1b8b4da0-071d-40e9-9d4a-6adcad28bdd0','Sanyrene-50ml','604056','33049990','50ml',1,1390.00,942.37,0.00,0.00,18.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','0e46357f-4731-475d-8f06-4acf3f717012','08a3d281-b4e9-49f7-ad45-c012aaf908f1'),('1d77567c-5e2c-4101-91b6-98d902bd7845','Urgotul 20x30cm','552514','30051090',NULL,5,617.00,470.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('1f504645-f138-4484-8159-be69e1f59267','Urgotul Absorb Border Sacrum 20x20cm','552516','30051020',NULL,5,1125.00,857.14,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('24f57126-9183-465f-b80d-b5487c7f7a96','Biofil Particles 10ml','BFPP 1003','30061010','10ml',2,715.00,544.76,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-24 05:45:24','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('25173fe2-fe68-449c-8cab-0a54b1b87727','NPWT Dressing Kit - Small','NOW-NPWT-S',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,10,'ACTIVE','2026-04-13 08:16:23','2026-04-13 08:16:23','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','fddf1c50-1f81-4f30-8ac5-065da8cf08e3'),('25d2c6fd-3d4c-4d03-a4a5-e32f9827d84b','Topical Warm Oxygen Therapy Bag','VC-TWOTB','9018',NULL,1,12000.00,9600.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','171bb6a0-d070-42ef-9d85-b6cfc8330188','a142235b-7e74-4e94-aa9f-86415fd1bec6'),('2986f732-8a59-4284-95ad-a134d49cc619','Lysil 40x40cm','LSFF 1007','30051090',NULL,1,28768.00,21918.48,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('2ab48e7b-076a-4a71-b62b-a34a01ee388a','Periocol-GTR 15x15mm','PGMS 1002','30061010',NULL,5,1378.00,1049.90,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','bb89663e-137f-41b5-8297-8a695400778c','e6fbeee7-ba72-4cf2-8a9c-947d982e66b3'),('2afb8b57-dee1-44f7-9481-f50adb655e19','Urgostart Contact 15x20cm','754157','30051090',NULL,10,1753.00,1335.62,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('2b98f9fd-9f72-41c1-930e-c2ec7a048f39','Biofil-AB Particles 10ml','BMPP 1003','30051090','10ml',2,1060.00,807.62,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('2ea12a0a-6aa4-4eda-b4b5-b3ad5156130f','Sybograf - Plus (600-700 Microns) 0.5gms','SGPP 1002','30064000',NULL,4,866.00,659.81,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','89d5a7b0-cb0a-419b-870a-9669293cfc27','4da9cb0b-9ba4-48e1-a572-084239011aac'),('33040ca4-00b7-4623-8f5c-db562080d242','Urgo Clean Ag 10x10cm','600411','30051090',NULL,10,804.00,612.57,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','94997a64-bc9b-40fc-b60b-142e454a2767','87702d87-3b82-4000-9272-115169d2a4ab'),('34696e23-e108-4e3e-b845-cd7ba8f7a5a5','Axiostat Surgical 5x5','AX-SUR-55','3005',NULL,1,2000.00,1600.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','30783824-2632-405d-a046-aad64dc4b0c1','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('34dc5540-d0af-4b73-b2ce-46a392a6ed7d','Urgotul Absorb Border 8x8cm','552521','30051020',NULL,10,300.00,228.57,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('39545d61-2866-4239-b347-d9c7d3999fa8','Urgostart Border 10x10cm','601434','30051020',NULL,10,1289.00,982.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('3a2061d8-0927-4dd5-a143-8a9a1c68542c','Kollagen-M 15x30cm','KGMS 1005','30061010',NULL,2,1779.00,1355.43,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','7c0b71fb-5809-4b13-8d3b-dbb512e04923','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('3ccfd99b-403d-4623-b23f-afdb465d8e27','Collafill 5ml','CF-5','300610',NULL,1,750.00,600.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','984c7b95-46b8-4cd8-b32b-2b28e5b844f6','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('3dff4ae4-504a-4a2a-b2ee-013d0b6f0a6e','Urgotul Absorb Border 15x20cm','552518','30051020',NULL,10,1031.00,785.52,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('3eb7a429-fc59-4a59-a326-0e0313daaa36','Axiostat Military 5x5','AX-MIL-55','3005',NULL,1,2500.00,2000.00,0.00,0.00,12.00,10,10,'ACTIVE','2026-03-20 11:39:14','2026-05-06 16:30:28','30783824-2632-405d-a046-aad64dc4b0c1','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('3f2ad516-7d0f-4e7b-b3db-4a1041e710e5','Biofil 4x4','BF-44','3005',NULL,5,850.00,680.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('42b28562-9572-4619-985c-7629f8486b07','NPWT Dressing Kit - Medium','NOW-NPWT-M',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,10,'ACTIVE','2026-04-13 08:16:23','2026-04-13 08:16:23','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','fddf1c50-1f81-4f30-8ac5-065da8cf08e3'),('449062c3-78c2-4601-9907-f342d59aba3b','NPWT Dressing Kit - Medium','NW-DK-M','9018',NULL,1,7500.00,6000.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','f2784a42-324b-47db-869f-41e3559c6dc6'),('45207692-855e-492f-b48f-3acbf5dd60f2','NPWT Canister 600 ML','NPWT-C-600','3005','600ML',1,0.00,0.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','ec9a05b8-47ed-4c9c-b06c-fd28cc56a18d'),('46f1c258-4cf9-4935-b8f1-50d6872f8c16','Urgostart Micro Adhesive 15x20cm','601599','30051090',NULL,10,2109.00,1606.86,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('49000ca0-36b5-45ca-b244-24839be2b734','Hydrofil 2x2','HF-22','3005',NULL,5,550.00,440.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','05f5c31e-ecd3-4041-9373-8ae56d71622a','87702d87-3b82-4000-9272-115169d2a4ab'),('49d7ef0f-5879-4526-ad50-3c3c31eeb01a','Urgostart Border 15x20cm','601393','30051020',NULL,10,2391.00,1821.71,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('4c484196-8a2d-4d72-9d84-56e01842333c','Kollagen-M 10x10cm','KGMS 1002','30061010',NULL,5,404.00,307.81,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','7c0b71fb-5809-4b13-8d3b-dbb512e04923','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('4fa8cae0-1735-49c3-a4fe-ff6b6eb8b52f','Periocol-GTR 10x18mm','PGMS 1003','30061010',NULL,5,984.00,749.71,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','bb89663e-137f-41b5-8297-8a695400778c','e6fbeee7-ba72-4cf2-8a9c-947d982e66b3'),('5017e817-5c0a-43cf-bcd9-3348e96acd42','Gelspon-P Film 200x70x0.5mm','GSPS 1021','30061020',NULL,10,284.00,216.36,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','1e06c5b7-4bc4-444f-bbcc-3d0256bad637'),('520090a6-fb13-4bc6-8869-827178566cf9','Gelspon-P Standard-80x50x10mm','GSPS 1002','30061020','80x50x10mm',10,258.00,196.57,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','1e06c5b7-4bc4-444f-bbcc-3d0256bad637'),('593ca92b-678f-498a-bb32-de8cbf226d97','Urgotul Absorb Border 13x13cm','552519','30051020',NULL,10,656.00,499.81,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('5bb95110-7f5a-41bd-9a17-8f2e789445bb','Kollagen-D 10x10cm','KGDS 1001','30061010',NULL,5,495.00,377.14,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','09c53851-dd7d-4ddd-ae41-912002ce6513','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('5d5246cf-f806-4351-95ba-70cd617a7b26','Urgo Clean Ag 15x20cm','600412','30051090',NULL,5,1856.00,1414.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','94997a64-bc9b-40fc-b60b-142e454a2767','87702d87-3b82-4000-9272-115169d2a4ab'),('5fe26e7e-08ab-43ef-88e6-9412523eeada','Urgotul 15x20cm','552513','30051090',NULL,10,385.00,293.33,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('613c52b9-a412-4499-b549-622a55f38b44','Kollagen 15x30cm','KGNS 1011','30061010',NULL,2,1779.00,1355.43,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','62c0e706-6d87-42ce-ba9c-62d20dca5466','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('6a7a5b05-c800-4146-b98c-23c9e759c357','Urgotul Ag Silver 20x40cm','601255','30051090',NULL,5,2609.00,1987.81,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('720bc7ed-a1e5-4f45-898b-88b8799bd8fa','Biofil Sponge 10x10cm','BFPS 1002','30061010','10x10cm',5,827.00,630.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('73e8acae-982a-4fe4-be85-5391ac2b7e91','Lysil 12x6cm','LSFF 1009','30051090',NULL,3,1679.00,1279.24,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('7cc445d4-8607-4395-bd5b-ef6d9f826460','Lysil Gel - 10gm','LSLG 1001','30051090',NULL,10,941.00,716.95,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('800180ad-4324-43b4-abad-9a6fd2ca8d57','Neuskin 15x30cm','NSND 1006','30061010',NULL,5,1861.00,1417.90,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','6fec9fbe-dfda-4723-87b2-360eb134f362','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('82431660-5f82-408c-9a7d-840ef22c13ec','Urgostart Border Sacrum 20x20cm','601394','30051020',NULL,5,2991.00,2278.86,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('87948783-0d17-47f9-8301-d87748fea7b2','Neuskin 10x10cm','NSND 1002','30061010',NULL,5,428.00,326.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','6fec9fbe-dfda-4723-87b2-360eb134f362','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('88311cbc-2601-477a-8f41-ef912fbfbc7c','Sybograf (600-700 Microns) 0.5gms','SGFP 1003','30064000',NULL,4,866.00,659.81,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','89d5a7b0-cb0a-419b-870a-9669293cfc27','4da9cb0b-9ba4-48e1-a572-084239011aac'),('888d7571-babd-463d-8224-c28cebf8492e','Urgostart Contact 10x10cm','754129','30051090',NULL,10,712.00,542.48,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','2b40ff62-b245-4ee3-9666-9057fe9b445d','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('8896390b-b242-4481-a139-9a090927b335','Gelspon-P Anal 80xdia30mm','GSPS 1008','30061020',NULL,5,486.00,370.29,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','1e06c5b7-4bc4-444f-bbcc-3d0256bad637'),('88b7ff6c-5153-4af2-9f7e-8809cd70cc3e','Kollagen 10x20cm','KGNS 1007','30061010','10x20cm',2,806.00,614.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','62c0e706-6d87-42ce-ba9c-62d20dca5466','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('88d3726f-333d-463f-ba51-2329fda9da2c','Biofil Particles 5ml','BFPP 1002','30061010','5ml',5,408.00,310.86,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('8a0e6493-5b90-48e9-a4ca-e5ec24d9408b','Topical Warm Oxygen Therapy Bag','TWOT-B','3005','Standard',1,0.00,0.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','171bb6a0-d070-42ef-9d85-b6cfc8330188','249d9e61-f56c-49c5-b5f1-8d7c77dcde31'),('8a60c8db-4f66-456b-93b2-923191b6def0','Kollagen 20x40cm','KGNS 1014','30061010',NULL,2,2694.00,2052.57,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','62c0e706-6d87-42ce-ba9c-62d20dca5466','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('8bd69a78-4de0-465a-b517-3d38e5ddbcf8','NPWT Dressing Kit - Large','NW-DK-L','9018',NULL,1,8500.00,6800.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','f2784a42-324b-47db-869f-41e3559c6dc6'),('8d6668e7-d22e-4706-bafc-bd5dddebf53e','Hydrofil 4x4','HF-44','3005',NULL,5,1050.00,840.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','05f5c31e-ecd3-4041-9373-8ae56d71622a','87702d87-3b82-4000-9272-115169d2a4ab'),('8e437527-2950-46d5-8cc0-3df1cdcd2de8','Urgotul 10x10cm','552512','30051090',NULL,10,136.00,103.62,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('8efa55ee-147d-4fff-a3a3-0c46549b86a7','Kollagen 10x10cm','KGNS 1005','30061010',NULL,5,410.00,312.38,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','62c0e706-6d87-42ce-ba9c-62d20dca5466','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('90de6e6c-130b-454f-bd97-a47c18d96c90','Kollagen-D 6\"x8\"','KGDS 1009','30061010',NULL,2,1206.00,918.86,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','09c53851-dd7d-4ddd-ae41-912002ce6513','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('920920a0-7351-4009-a58e-195a6af6cc94','NPWT Dressing Kit - Large','NOW-NPWT-L',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,10,'ACTIVE','2026-04-13 08:16:23','2026-04-13 08:16:23','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','fddf1c50-1f81-4f30-8ac5-065da8cf08e3'),('9404eef3-128d-49c9-b80d-a4386e07daa4','Sanyrene-20ml','604055','33049990','20ml',1,690.00,467.80,0.00,0.00,18.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','0e46357f-4731-475d-8f06-4acf3f717012','08a3d281-b4e9-49f7-ad45-c012aaf908f1'),('9df9c303-2954-4844-b369-0a2e2d3944d4','Sanyrene-10ml','604054','33049990','10ml',1,480.00,325.42,0.00,0.00,18.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','0e46357f-4731-475d-8f06-4acf3f717012','08a3d281-b4e9-49f7-ad45-c012aaf908f1'),('a5dff944-e660-4455-9e41-4b00e032609e','Lysil 5x5cm','LSFF 1003','30051090',NULL,5,681.00,518.86,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('a8542537-7043-4f27-ae0d-ab0c9d8c3281','Urgotul Absorb Border 10x25cm','552520','30051090',NULL,10,938.00,714.67,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('a8afa605-b50e-4f3b-ac33-63146a61342f','NPWT Dressing Kit - Small','NPWT-K-S','3005','Small',1,0.00,0.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','936a287d-7d48-421c-a5bc-51e9f239e46f'),('a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5','Axiostat Dental 1x1','AX-DEN-11','3005',NULL,1,500.00,400.00,0.00,0.00,12.00,39,10,'ACTIVE','2026-03-20 11:39:14','2026-05-06 16:53:49','30783824-2632-405d-a046-aad64dc4b0c1','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('ac5f977e-7c11-45bc-a32d-458f0a971bed','Urgotul Ag Silver 10x12cm','552510','30051090',NULL,16,283.00,215.62,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('b69d9df3-d6e9-4903-8f2c-bbb22c037421','NPWT Dressing Kit - Large','NPWT-K-L','3005','Large',1,0.00,0.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','936a287d-7d48-421c-a5bc-51e9f239e46f'),('b785d06e-fa9d-4744-8971-23f44a2682f7','Axiostat Military 8x8','AX-MIL-88','3005',NULL,1,3500.00,2800.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','30783824-2632-405d-a046-aad64dc4b0c1','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('b98fe9fb-b9e4-447f-98df-c179cd589c08','Urgotul Absorb Border 6.5x10cm','552517','30051020',NULL,10,422.00,321.52,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('ba20e959-d56e-44ef-832a-62a868254bd4','Hydrofil 6x6','HF-66','3005',NULL,5,1550.00,1240.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','05f5c31e-ecd3-4041-9373-8ae56d71622a','87702d87-3b82-4000-9272-115169d2a4ab'),('bdaebb4a-26b2-4ce6-8915-ced4ae99c92f','Dermifill 10ml','DF-10','300610',NULL,1,1150.00,920.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','5f2f3bd7-82d2-4d5c-b6e7-6406f62795f4','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('bdb17148-23ce-4d1e-9987-e88d5c42aca9','Lysil 20x20cm','LSFF 1005','30051090',NULL,1,8479.00,6460.19,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','93fef7e5-bcef-43b1-b940-43f127cec975','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('be1f2e0b-1d24-4ee9-b772-07aab9f469a9','Surgifill 10ml','SF-10','300610',NULL,1,950.00,760.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','9ac3c91a-1361-4e9a-9de2-57cd8c9ca97f','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('be4a61a3-301f-489d-af87-45dc2ef837cf','Urgotul Ag Silver 15x20cm','552511','30051090',NULL,16,710.00,540.95,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('c3afad07-0622-4d3b-846e-23c4e5263b67','Urgotul Absorb Border 8x15cm(MDD)','552515','30051090',NULL,10,609.00,464.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','d3e6dfef-70a7-4a7d-9ad7-df489e554d77','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('c8d43871-baa3-499b-9639-f508e274b4f4','Biofil Sponge 5x5cm','BFPS 1001','30061010',NULL,5,319.00,243.05,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','9c5523a9-8d93-461d-9cd7-00f32b808bbb','87702d87-3b82-4000-9272-115169d2a4ab'),('cad3dc6a-9fdd-47ae-a5ea-2e7a6489077d','Gelspon Dental 10x10x10mm','GSES 1013','30061020','10x10x10mm',100,17.00,12.95,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','1e06c5b7-4bc4-444f-bbcc-3d0256bad637'),('d05f3b90-6dcc-42ca-a464-68a9c18f82e4','Collafill 10ml','CF-10','300610',NULL,1,1350.00,1080.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','984c7b95-46b8-4cd8-b32b-2b28e5b844f6','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('d225bcda-2193-482a-919c-0a67dd5297ec','Kollagen-D 8\"x12\"','KGDS 1011','30061010',NULL,2,2768.00,2108.95,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','09c53851-dd7d-4ddd-ae41-912002ce6513','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('db6d97ce-30fc-453d-a851-7ca797de46db','Surgifill 5ml','SF-5','300610',NULL,1,550.00,440.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','9ac3c91a-1361-4e9a-9de2-57cd8c9ca97f','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('dda6922f-d86d-4ed5-8a19-96e8a907bf92','Kollagen-M 10x20cm','KGMS 1003','30061010',NULL,2,798.00,608.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','7c0b71fb-5809-4b13-8d3b-dbb512e04923','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('de790ccf-368a-4043-9dfb-dc9058e82202','NPWT Dressing Kit - Medium','NPWT-K-M','3005','Medium',1,0.00,0.00,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','936a287d-7d48-421c-a5bc-51e9f239e46f'),('e1132d50-20be-40f7-b1b8-30767d175158','Biofil-AB Particles 5ml','BMPP 1002','30051090',NULL,5,584.00,444.95,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','f55c8763-f83f-4983-bda5-b2d4b39671f5','87702d87-3b82-4000-9272-115169d2a4ab'),('e18a1925-fc83-49be-aba3-16a17bf5b7a0','Kollagen 5x5cm','KGNS 1001','30061010','5x5cm',5,155.00,118.10,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 04:56:38','2026-03-20 04:56:38','62c0e706-6d87-42ce-ba9c-62d20dca5466','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('e289aa77-2b89-4f55-b123-0a221cd44a2a','Dermifill 5ml','DF-5','300610',NULL,1,650.00,520.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','5f2f3bd7-82d2-4d5c-b6e7-6406f62795f4','6a8eedc4-95f5-4a72-9653-05ed00af0339'),('e2efa638-8947-4b9d-8fb6-884970c075ab','Neuskin 10x20cm','NSND 1004','30061010',NULL,5,844.00,643.05,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','6fec9fbe-dfda-4723-87b2-360eb134f362','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e'),('e6bcf112-f180-409d-b823-00479ba2920e','Gelspon-P Dental-10x10x10mm','GSPS 1013','30061020',NULL,100,19.00,14.48,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','fd386c42-7859-4d0b-94c4-6dcc0fb18fd7','1e06c5b7-4bc4-444f-bbcc-3d0256bad637'),('ecadabf2-38bc-46c3-a06f-346df994fabd','NPWT Canister 600 ML','NW-CAN-600','9018',NULL,1,3500.00,2800.00,0.00,0.00,12.00,0,10,'ACTIVE','2026-03-20 11:39:14','2026-03-20 11:39:14','7c13f187-14a9-476b-9ad2-6ba11f30f2d7','f2784a42-324b-47db-869f-41e3559c6dc6'),('eddac6b3-0cb7-41ee-976f-2963a1395db5','Urgo Clean Ag 6x6cm','600083','30051090',NULL,10,485.00,369.52,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:24','2026-03-20 07:41:24','94997a64-bc9b-40fc-b60b-142e454a2767','87702d87-3b82-4000-9272-115169d2a4ab'),('eed40fde-8a86-4b41-a969-bb263fb39102','Neuskin-F 10x10cm','NSNF 1005','30061010',NULL,5,790.00,601.90,0.00,0.00,5.00,0,10,'ACTIVE','2026-03-20 07:41:23','2026-03-20 07:41:23','d5177530-2089-4636-b55c-6fcdde9f36f5','9cc1bcb3-88cd-4e8a-8cbf-f7df3cc16f1e');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proforma_invoice_items`
--

DROP TABLE IF EXISTS `proforma_invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proforma_invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proforma_invoice_id` int NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `quantity` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `hsn_code` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `proforma_invoice_id` (`proforma_invoice_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `proforma_invoice_items_ibfk_1` FOREIGN KEY (`proforma_invoice_id`) REFERENCES `proforma_invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `proforma_invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proforma_invoice_items`
--

LOCK TABLES `proforma_invoice_items` WRITE;
/*!40000 ALTER TABLE `proforma_invoice_items` DISABLE KEYS */;
INSERT INTO `proforma_invoice_items` VALUES (1,1,'3eb7a429-fc59-4a59-a326-0e0313daaa36',1,2000.00,2500.00,'3005',2000.00),(2,2,'24f57126-9183-465f-b80d-b5487c7f7a96',1,544.76,715.00,'30061010',544.76),(3,3,'b785d06e-fa9d-4744-8971-23f44a2682f7',1,2800.00,3500.00,'3005',2800.00),(4,4,'24f57126-9183-465f-b80d-b5487c7f7a96',1,544.76,715.00,'30061010',544.76),(5,4,'05ea6ee9-e9fa-48ec-91fb-670225acabe2',1,2400.00,3000.00,'3005',2400.00),(6,4,'24f57126-9183-465f-b80d-b5487c7f7a96',1,544.76,715.00,'30061010',544.76),(11,6,'24f57126-9183-465f-b80d-b5487c7f7a96',1,544.76,715.00,'30061010',544.76),(12,6,'720bc7ed-a1e5-4f45-898b-88b8799bd8fa',1,630.10,827.00,'30061010',630.10),(13,6,'01523a2c-bd2c-49b9-91b0-b9565a22c082',1,1000.00,1250.00,'3005',1000.00);
/*!40000 ALTER TABLE `proforma_invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proforma_invoices`
--

DROP TABLE IF EXISTS `proforma_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proforma_invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) NOT NULL,
  `client_id` int NOT NULL,
  `date` datetime NOT NULL,
  `valid_until` datetime DEFAULT NULL,
  `po_number` varchar(255) DEFAULT NULL,
  `sub_total` decimal(10,2) DEFAULT '0.00',
  `cgst` decimal(10,2) DEFAULT '0.00',
  `sgst` decimal(10,2) DEFAULT '0.00',
  `rounding` decimal(10,2) DEFAULT '0.00',
  `grand_total` decimal(10,2) DEFAULT '0.00',
  `notes` text,
  `terms_conditions` text,
  `status` enum('Draft','Sent','Approved','Expired','Converted to Invoice') DEFAULT 'Draft',
  `bank_account_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `client_id` (`client_id`),
  KEY `bank_account_id` (`bank_account_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `proforma_invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `proforma_invoices_ibfk_2` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `proforma_invoices_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proforma_invoices`
--

LOCK TABLES `proforma_invoices` WRITE;
/*!40000 ALTER TABLE `proforma_invoices` DISABLE KEYS */;
INSERT INTO `proforma_invoices` VALUES (1,'PI-1001',2,'2026-05-07 00:00:00','2026-05-08 00:00:00','78',2000.00,180.00,180.00,0.00,2360.00,'','1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days','Converted to Invoice',1,1,'2026-05-07 06:26:01','2026-05-12 15:36:03'),(2,'PI-1002',1,'2026-05-07 00:00:00','2026-05-09 00:00:00','5665',544.76,49.03,49.03,0.18,643.00,'','1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days','Draft',1,1,'2026-05-07 10:22:14','2026-05-07 10:22:14'),(3,'PI-1003',2,'2026-05-07 00:00:00','2026-05-08 00:00:00','5555',2800.00,252.00,252.00,0.00,3304.00,'','1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days','Draft',1,1,'2026-05-07 10:32:29','2026-05-07 10:32:29'),(4,'PI-1004',2,'2026-05-07 00:00:00','2026-05-08 00:00:00','2323',3489.52,314.06,314.06,0.37,4118.00,'','1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days','Draft',1,1,'2026-05-07 10:34:17','2026-05-07 10:34:17'),(6,'PI-1005',2,'2026-05-07 00:00:00','2026-05-08 00:00:00','909090',2174.86,195.74,195.74,-0.33,2566.00,'','1. Payment terms: 100% Advance\n2. Validity: 15 days from the date of Proforma Invoice\n3. Delivery: Within 7 working days','Converted to Invoice',1,1,'2026-05-07 12:38:03','2026-05-12 15:38:39');
/*!40000 ALTER TABLE `proforma_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remarks`
--

DROP TABLE IF EXISTS `remarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remarks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `remark` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `remarks_ibfk_67` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `remarks_ibfk_68` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remarks`
--

LOCK TABLES `remarks` WRITE;
/*!40000 ALTER TABLE `remarks` DISABLE KEYS */;
INSERT INTO `remarks` VALUES (1,3,3,'Testing updates','2026-05-12 16:02:31','2026-05-12 16:02:31');
/*!40000 ALTER TABLE `remarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `permissions` json NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Full system access','[\"dashboard_view\", \"tasks_view\", \"tasks_create\", \"tasks_edit\", \"tasks_delete\", \"clients_view\", \"clients_create\", \"clients_edit\", \"clients_delete\", \"hospitals_view\", \"hospitals_create\", \"hospitals_edit\", \"hospitals_delete\", \"doctors_view\", \"doctors_create\", \"doctors_edit\", \"doctors_delete\", \"work_updates_view\", \"work_updates_create\", \"work_updates_edit\", \"work_updates_delete\", \"time_tracking_view\", \"time_tracking_manage\", \"billing_view\", \"billing_manage\", \"expenses_view\", \"expenses_manage\", \"stock_view\", \"stock_manage\", \"reports_view\", \"settings_view\", \"roles_manage\", \"users_manage\"]','2026-03-20 15:07:41','2026-03-20 15:07:41'),(2,'Manager','Management access','[\"dashboard_view\", \"tasks_view\", \"tasks_create\", \"tasks_edit\", \"clients_view\", \"clients_create\", \"clients_edit\", \"hospitals_view\", \"hospitals_create\", \"hospitals_edit\", \"doctors_view\", \"doctors_create\", \"doctors_edit\", \"work_updates_view\", \"work_updates_create\", \"work_updates_edit\", \"time_tracking_view\", \"billing_view\", \"expenses_view\", \"stock_view\", \"reports_view\"]','2026-03-20 15:07:41','2026-03-20 15:07:41'),(3,'Staff','Standard employee access','[\"dashboard_view\", \"tasks_view\", \"work_updates_view\", \"work_updates_create\", \"time_tracking_view\"]','2026-03-20 15:07:41','2026-03-20 15:07:41');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statuses`
--

DROP TABLE IF EXISTS `statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#9e9e9e',
  `is_system` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statuses`
--

LOCK TABLES `statuses` WRITE;
/*!40000 ALTER TABLE `statuses` DISABLE KEYS */;
INSERT INTO `statuses` VALUES (1,'pending','Pending','#ff9800',1,'2026-04-21 04:32:12','2026-04-21 04:32:12'),(2,'in_progress','In Progress','#03a9f4',1,'2026-04-21 04:32:12','2026-04-21 04:32:12'),(3,'completed','Completed','#4caf50',1,'2026-04-21 04:32:12','2026-04-21 04:32:12'),(4,'on_hold','On Hold','#00fcff',1,'2026-04-21 04:32:12','2026-04-21 05:00:08');
/*!40000 ALTER TABLE `statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` enum('IN','OUT','ADJUSTMENT') NOT NULL,
  `quantity` int NOT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stock_transactions_ibfk_59` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `stock_transactions_ibfk_60` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
INSERT INTO `stock_transactions` VALUES ('27c0107a-c648-4a9d-bc1c-f6c737fdc467','OUT',1,'','MANUAL','','2026-03-24 05:45:12','2026-03-24 05:45:12','24f57126-9183-465f-b80d-b5487c7f7a96',1),('288b64ed-8424-4dc7-81b3-31daa9c54886','OUT',1,'2','TASK_PRODUCT','Fulfilled for Task #3','2026-05-06 16:53:49','2026-05-06 16:53:49','a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1),('2bb06902-bee1-485b-8495-deb30fb70ebc','IN',1,'','MANUAL','','2026-03-23 17:27:01','2026-03-23 17:27:01','24f57126-9183-465f-b80d-b5487c7f7a96',1),('37ea3f23-5f29-4d76-9491-eb661357841d','ADJUSTMENT',20,'','MANUAL','','2026-03-20 15:52:10','2026-03-20 15:52:10','a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1),('481ff6fa-d15c-40d2-99ca-6a325955d1ae','OUT',3,'','MANUAL','','2026-03-20 15:51:52','2026-03-20 15:51:52','a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1),('72e0d26d-8093-44cb-92ea-805c887e6362','OUT',1,'','MANUAL','','2026-03-24 05:44:46','2026-03-24 05:44:46','24f57126-9183-465f-b80d-b5487c7f7a96',1),('ae445019-a04a-450a-85ae-e4e64e5bebfd','IN',20,'','MANUAL','','2026-03-24 05:45:04','2026-03-24 05:45:04','24f57126-9183-465f-b80d-b5487c7f7a96',1),('c17d01c6-6cff-43b0-b8a6-d3546c90251b','ADJUSTMENT',40,'','MANUAL','','2026-03-20 15:52:32','2026-03-20 15:52:32','a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1),('df217654-9902-4f01-88da-5b9dbd42b308','ADJUSTMENT',15,'','MANUAL','','2026-05-06 17:15:49','2026-05-06 17:15:49','01523a2c-bd2c-49b9-91b0-b9565a22c082',1),('e43b3c07-ac77-4894-96d7-36bb088e9acd','IN',10,'','MANUAL','','2026-05-06 16:30:28','2026-05-06 16:30:28','3eb7a429-fc59-4a59-a326-0e0313daaa36',1),('eb16183e-7c44-419c-b2a2-9b05bf165a95','OUT',19,'','MANUAL','','2026-03-24 05:45:24','2026-03-24 05:45:24','24f57126-9183-465f-b80d-b5487c7f7a96',1),('f3c24c7f-e81b-4d5b-af11-e8686d6660cc','IN',15,'','MANUAL','','2026-03-20 15:51:42','2026-03-20 15:51:42','a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1);
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_products`
--

DROP TABLE IF EXISTS `task_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `quantity_required` int NOT NULL DEFAULT '1',
  `quantity_fulfilled` int NOT NULL DEFAULT '0',
  `status` enum('pending','fulfilled','backordered') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `task_products_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `task_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_products`
--

LOCK TABLES `task_products` WRITE;
/*!40000 ALTER TABLE `task_products` DISABLE KEYS */;
INSERT INTO `task_products` VALUES (1,3,'3f2ad516-7d0f-4e7b-b3db-4a1041e710e5',1,0,'backordered','2026-05-06 16:53:24','2026-05-06 16:53:24'),(2,3,'a9b9d12d-ecf9-4fd6-9bb2-898cedfffdc5',1,1,'fulfilled','2026-05-06 16:53:49','2026-05-06 16:53:49');
/*!40000 ALTER TABLE `task_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `client_id` int DEFAULT NULL,
  `hospital_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `status` enum('pending','in_progress','completed','on_hold') DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_by` int DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_166` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_167` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_168` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_169` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_ibfk_170` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Axiostat Dental 1x1','test',2,28,65,2,'pending','high',1,'2026-04-21 00:00:00','2026-04-21 04:17:48','2026-04-22 09:48:21'),(2,'Biofil 10x10','qwerty',1,27,64,2,'on_hold','urgent',1,'2026-04-21 00:00:00','2026-04-21 05:00:54','2026-04-22 09:47:59'),(3,'NPWT Dressing Kit - Small','\n?\\][p;.opm,j -98un 098j',2,13,24,3,'in_progress','urgent',1,'2026-04-23 00:00:00','2026-04-22 09:50:57','2026-05-12 16:02:00');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_logs`
--

DROP TABLE IF EXISTS `time_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_hours` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `is_manual` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `time_logs_ibfk_67` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `time_logs_ibfk_68` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_logs`
--

LOCK TABLES `time_logs` WRITE;
/*!40000 ALTER TABLE `time_logs` DISABLE KEYS */;
INSERT INTO `time_logs` VALUES (1,1,1,'2026-04-21 11:37:43','2026-04-21 11:37:57',0.00,'test',0,'2026-04-21 11:37:43','2026-04-21 11:37:57'),(2,3,3,'2026-05-12 16:04:55','2026-05-12 16:05:43',0.01,'testing',0,'2026-05-12 16:04:55','2026-05-12 16:05:43'),(3,3,3,'2026-05-12 21:35:00','2026-05-12 02:35:00',-19.00,'testing',1,'2026-05-12 16:05:26','2026-05-12 16:05:26');
/*!40000 ALTER TABLE `time_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('admin','manager','staff') DEFAULT 'staff',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@office.com','$2b$12$VQ64G6WwHWG8O5xsEzGTIe.r2DkZ28TsDGBxVuInn5GZjMLPDBofW',NULL,'admin','active','2026-03-17 03:17:26','2026-05-12 16:27:50',1),(2,'Hari','hari@gmail.com','$2b$12$gqTT36k.JQkJoldwUxFlLOnVhd2p7j3re6M7e2kQTkA4.MbGw1fJm','9497332344','manager','active','2026-04-21 04:17:07','2026-05-12 16:27:50',2),(3,'Vishnu','vishnu@voxinnov.com','$2b$12$MzR9frVWAgH9B/EjyH0S4elAq9Aq.I8Pqft/o8x4HcQgByGmv2ybO','9497332344','staff','active','2026-05-12 15:40:05','2026-05-12 16:27:50',3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_updates`
--

DROP TABLE IF EXISTS `work_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `update_note` text,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `update_date` date DEFAULT NULL,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `location_address` text,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `work_updates_ibfk_67` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `work_updates_ibfk_68` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_updates`
--

LOCK TABLES `work_updates` WRITE;
/*!40000 ALTER TABLE `work_updates` DISABLE KEYS */;
INSERT INTO `work_updates` VALUES (2,1,'23','R34','test',1,'2026-04-21 11:37:14','2026-04-21 11:37:14','2026-04-21',NULL,NULL,NULL),(3,3,'','','uighiubouih ',1,'2026-04-22 09:52:07','2026-04-22 09:52:07','2026-04-22',NULL,NULL,NULL),(4,3,'','','890uju8jn08',1,'2026-04-22 09:52:22','2026-04-22 09:52:22','2026-04-23',NULL,NULL,NULL),(5,3,NULL,NULL,'    Test',3,'2026-05-12 16:38:36','2026-05-12 16:38:36','2026-05-12','10.00927340295942','76.34604210768774','DLF City,  Kakkanad,  Ernakulam'),(6,3,'Test','test','testing',3,'2026-05-12 16:40:05','2026-05-12 16:40:05','2026-05-12','10.009320871845762','76.34600204190446','DLF City,  Kakkanad,  Ernakulam'),(7,3,'Test','test','testing',3,'2026-05-12 16:40:05','2026-05-12 16:40:05','2026-05-12','10.009320871845762','76.34600204190446','DLF City,  Kakkanad,  Ernakulam');
/*!40000 ALTER TABLE `work_updates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19 15:36:25
