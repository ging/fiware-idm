-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: idm
-- ------------------------------------------------------
-- Server version 5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

-- CREATE DATABASE IF NOT EXISTS idm_test;
USE idm_test;

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('201802190000-CreateUserTable.js'),('201802190003-CreateUserRegistrationProfileTable.js'),('201802190005-CreateOrganizationTable.js'),('201802190008-CreateOAuthClientTable.js'),('201802190009-CreateUserAuthorizedApplicationTable.js'),('201802190010-CreateRoleTable.js'),('201802190015-CreatePermissionTable.js'),('201802190020-CreateRoleAssignmentTable.js'),('201802190025-CreateRolePermissionTable.js'),('201802190030-CreateUserOrganizationTable.js'),('201802190035-CreateIotTable.js'),('201802190040-CreatePepProxyTable.js'),('201802190045-CreateAuthZForceTable.js'),('201802190050-CreateAuthTokenTable.js'),('201802190060-CreateOAuthAuthorizationCodeTable.js'),('201802190065-CreateOAuthAccessTokenTable.js'),('201802190070-CreateOAuthRefreshTokenTable.js'),('201802190075-CreateOAuthScopeTable.js'),('20180405125424-CreateUserTourAttribute.js'),('20180612134640-CreateEidasTable.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_token`
--

DROP TABLE IF EXISTS `auth_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_token` (
  `access_token` varchar(255) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `pep_proxy_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`access_token`),
  UNIQUE KEY `access_token` (`access_token`),
  KEY `user_id` (`user_id`),
  KEY `pep_proxy_id` (`pep_proxy_id`),
  CONSTRAINT `auth_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auth_token_ibfk_2` FOREIGN KEY (`pep_proxy_id`) REFERENCES `pep_proxy` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_token`
--

LOCK TABLES `auth_token` WRITE;
/*!40000 ALTER TABLE `auth_token` DISABLE KEYS */;
INSERT INTO `auth_token` VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','2016-07-30 12:04:45',1,'aaaaaaaa-good-0000-0000-000000000000',NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','2016-07-30 12:38:13',1,'bbbbbbbb-good-0000-0000-000000000000',NULL),
('cccccccc-cccc-cccc-cccc-cccccccccccc','2016-07-31 09:36:13',1,'cccccccc-good-0000-0000-000000000000',NULL),
('51f2e380-c959-4dee-a0af-380f730137c3','2016-07-30 13:02:37',1,'admin',NULL);
/*!40000 ALTER TABLE `auth_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authzforce`
--

DROP TABLE IF EXISTS `authzforce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authzforce` (
  `az_domain` varchar(255) NOT NULL,
  `policy` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`az_domain`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `authzforce_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authzforce`
--

LOCK TABLES `authzforce` WRITE;
/*!40000 ALTER TABLE `authzforce` DISABLE KEYS */;
INSERT INTO `authzforce` VALUES
('NYP5CukQEei0BgJCrBIBDA','d72f7c1c-b250-431a-82c5-c3afe65a96e8',1,'tutorial-dckr-site-0000-xpresswebapp');
/*!40000 ALTER TABLE `authzforce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eidas_credentials`
--

DROP TABLE IF EXISTS `eidas_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eidas_credentials` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `support_contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_telephone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_telephone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_nif` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sp_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attributes_list` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `eidas_credentials_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eidas_credentials`
--

LOCK TABLES `eidas_credentials` WRITE;
/*!40000 ALTER TABLE `eidas_credentials` DISABLE KEYS */;
/*!40000 ALTER TABLE `eidas_credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iot`
--

DROP TABLE IF EXISTS `iot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iot` (
  `id` varchar(255) NOT NULL,
  `password` varchar(40) DEFAULT NULL,
  `salt` varchar(40) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `iot_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iot`
--

LOCK TABLES `iot` WRITE;
/*!40000 ALTER TABLE `iot` DISABLE KEYS */;
/*!40000 ALTER TABLE `iot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_token`
--

DROP TABLE IF EXISTS `oauth_access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_access_token` (
  `access_token` varchar(255) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `iot_id` varchar(255) DEFAULT NULL,
  `authorization_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`access_token`),
  UNIQUE KEY `access_token` (`access_token`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  KEY `iot_id` (`iot_id`),
  CONSTRAINT `oauth_access_token_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_access_token_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_access_token_ibfk_3` FOREIGN KEY (`iot_id`) REFERENCES `iot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_access_token`
--

LOCK TABLES `oauth_access_token` WRITE;
/*!40000 ALTER TABLE `oauth_access_token` DISABLE KEYS */;
INSERT INTO `oauth_access_token` VALUES
('15682667caa4bb5ac15056fee3836b2980288bf2','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'8ca60ce9-32f9-42d6-a013-a19b3af0c13d','admin',NULL,NULL),
('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','alice',NULL,NULL),
('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','bob',NULL,NULL),
('cccccccccccccccccccccccccccccccccccccccc','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'cccccccc-cccc-cccc-cccc-cccccccccccc','charlie',NULL,NULL),
('d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'d1d1d1d1-dddd-dddd-dddd-d1d1d1d1d1d1','detective1',NULL,NULL),
('d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'d2d2d2d2-dddd-dddd-dddd-d2d2d2d2d2d2','detective2',NULL,NULL),
('m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1m1','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'m1m1m1m1-mmmm-mmmm-mmmm-m1m1m1m1m1m1','manager1',NULL,NULL),
('m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2m2','2016-07-30 12:14:21',NULL,NULL,NULL,NULL,'m2m2m2m2-mmmm-mmmm-mmmm-m2m2m2m2m2m2','manager2',NULL,NULL),
('m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3m3','2216-07-30 12:14:21','bearer','r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3',1,NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000',NULL,NULL),
('m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4m4','2216-07-30 12:14:21','bearer','r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4',1,NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000',NULL,NULL);

/*!40000 ALTER TABLE `oauth_access_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_authorization_code`
--

DROP TABLE IF EXISTS `oauth_authorization_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_authorization_code` (
  `authorization_code` varchar(256) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `redirect_uri` varchar(2000) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`authorization_code`),
  UNIQUE KEY `authorization_code` (`authorization_code`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_authorization_code_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_authorization_code_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_authorization_code`
--

LOCK TABLES `oauth_authorization_code` WRITE;
/*!40000 ALTER TABLE `oauth_authorization_code` DISABLE KEYS */;
INSERT INTO `oauth_authorization_code` VALUES
('15682667caa4bb5ac15056fee3836b2980288bf2','2016-07-30 12:14:21',NULL,NULL,1,NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000'),
('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','2200-07-30 12:14:21',NULL,NULL,1,NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000');

/*!40000 ALTER TABLE `oauth_authorization_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_client`
--

DROP TABLE IF EXISTS `oauth_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_client` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `secret` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `url` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_uri` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_sign_out_uri` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  `grant_type` varchar(255) DEFAULT NULL,
  `response_type` varchar(255) DEFAULT NULL,
  `client_type` varchar(15) DEFAULT NULL,
  `scope` varchar(80) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `token_types` varchar(2000) DEFAULT 'bearer',
  `jwt_secret` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_client`
--

LOCK TABLES `oauth_client` WRITE;
/*!40000 ALTER TABLE `oauth_client` DISABLE KEYS */;
INSERT INTO `oauth_client` VALUES
('tutorial-dckr-site-0000-xpresswebapp','FIWARE Tutorial',
  'FIWARE Application protected by OAuth2 and Keyrock','tutorial-dckr-site-0000-clientsecret',
  'http://localhost:3000','http://localhost:3000/login',NULL,'default',
  'authorization_code,implicit,password,client_credentials,refresh_token','code',NULL,NULL,NULL,'bearer', NULL),
('tutorial-lcal-host-0000-xpresswebapp','localhost App',
  'Localhost Callback protected by OAuth2 and Keyrock','tutorial-lcal-host-0000-clientsecret',
  'http://localhost:3000','http://localhost:3000/login',NULL,'default',
  'authorization_code,implicit,password,client_credentials,refresh_token','code',NULL,NULL,NULL,'bearer', NULL);

/*!40000 ALTER TABLE `oauth_client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_refresh_token`
--

DROP TABLE IF EXISTS `oauth_refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_refresh_token` (
  `refresh_token` varchar(256) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `iot_id` varchar(255) DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `authorization_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`refresh_token`),
  UNIQUE KEY `refresh_token` (`refresh_token`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  KEY `iot_id` (`iot_id`),
  CONSTRAINT `oauth_refresh_token_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_refresh_token_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_refresh_token_ibfk_3` FOREIGN KEY (`iot_id`) REFERENCES `iot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_refresh_token`
--

LOCK TABLES `oauth_refresh_token` WRITE;
/*!40000 ALTER TABLE `oauth_refresh_token` DISABLE KEYS */;
INSERT INTO `oauth_refresh_token` VALUES
('4eb1f99f80f37c81a8ef85d92eae836919887e1e','2018-08-13 11:14:21',NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000',NULL,1,NULL),
('r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3r3','2218-08-13 11:14:21',NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000',NULL,1,NULL),
('r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4r4','2218-08-13 11:14:21',NULL,'tutorial-dckr-site-0000-xpresswebapp','aaaaaaaa-good-0000-0000-000000000000',NULL,1,NULL);
/*!40000 ALTER TABLE `oauth_refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_scope`
--

DROP TABLE IF EXISTS `oauth_scope`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_scope` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scope` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_scope`
--

LOCK TABLES `oauth_scope` WRITE;
/*!40000 ALTER TABLE `oauth_scope` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_scope` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` VALUES
('security-team-0000-0000-000000000000','Security','Security Group for Store Detectives',NULL,'default'),
('managers-team-0000-0000-000000000000','Management','Management Group for Store Managers',NULL,'default');
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pep_proxy`
--

DROP TABLE IF EXISTS `pep_proxy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pep_proxy` (
  `id` varchar(255) NOT NULL,
  `password` varchar(40) DEFAULT NULL,
  `salt` varchar(40) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `pep_proxy_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pep_proxy`
--

LOCK TABLES `pep_proxy` WRITE;
/*!40000 ALTER TABLE `pep_proxy` DISABLE KEYS */;
/*!40000 ALTER TABLE `pep_proxy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_internal` tinyint(1) DEFAULT '0',
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `is_regex` tinyint(1) NOT NULL DEFAULT '0',
  `authorization_service_header` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `use_authorization_service_header` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES
('1','Get and assign all internal application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),
('2','Manage the application',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),
('3','Manage roles',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),('4','Manage authorizations',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),
('5','Get and assign all public application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),
('6','Get and assign only public owned roles',NULL,1,NULL,NULL,NULL,'idm_admin_app', 0, NULL, 0),
('increase-stck-0000-0000-000000000000','Order Stock','Increase Stock Count',0,'GET','/app/order-stock',NULL,'tutorial-dckr-site-0000-xpresswebapp', 0, NULL, 0),
('entrance-open-0000-0000-000000000000','Unlock','Unlock main entrance',0,'POST','/door/unlock',NULL,'tutorial-dckr-site-0000-xpresswebapp', 0, NULL, 0),
('alrmbell-ring-0000-0000-000000000000','Ring Alarm Bell',NULL,0,'POST','/bell/ring',NULL,'tutorial-dckr-site-0000-xpresswebapp', 0, NULL, 0),
('pricechg-stck-0000-0000-000000000000','Access Price Changes',NULL,0,'GET','/app/price-change',NULL,'tutorial-dckr-site-0000-xpresswebapp', 0, NULL, 0);
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_internal` tinyint(1) DEFAULT '0',
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `role_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES
('security-role-0000-0000-000000000000','Security Team',0,'tutorial-dckr-site-0000-xpresswebapp'),
('managers-role-0000-0000-000000000000','Management',0,'tutorial-dckr-site-0000-xpresswebapp'),
('provider','Provider',1,'idm_admin_app'),('purchaser','Purchaser',1,'idm_admin_app');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_assignment`
--

DROP TABLE IF EXISTS `role_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_organization` varchar(255) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `role_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `role_id` (`role_id`),
  KEY `organization_id` (`organization_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `role_assignment_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_3` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_assignment`
--

LOCK TABLES `role_assignment` WRITE;
/*!40000 ALTER TABLE `role_assignment` DISABLE KEYS */;
INSERT INTO `role_assignment` VALUES
(1,NULL,'8ca60ce9-32f9-42d6-a013-a19b3af0c13d','provider',NULL,'96154659-cb3b-4d2d-afef-18d6aec0518e'),
(2,'member','8ca60ce9-32f9-42d6-a013-a19b3af0c13d','provider','74f5299e-3247-468c-affb-957cda03f0c4',NULL),
(3,NULL,'222eda27-958b-4f0c-a5cb-e4114fb170c3','provider',NULL,'admin'),
(4,NULL,'222eda27-958b-4f0c-a5cb-e4114fb170c3','provider',NULL,'96154659-cb3b-4d2d-afef-18d6aec0518e'),
(5,NULL,'tutorial-dckr-site-0000-xpresswebapp','provider',NULL,'aaaaaaaa-good-0000-0000-000000000000'),
(6,NULL,'tutorial-lcal-host-0000-xpresswebapp','provider',NULL,'aaaaaaaa-good-0000-0000-000000000000'),
(10,NULL,'tutorial-dckr-site-0000-xpresswebapp','security-role-0000-0000-000000000000',NULL,'cccccccc-good-0000-0000-000000000000'),
(11,'member','tutorial-dckr-site-0000-xpresswebapp','security-role-0000-0000-000000000000','security-team-0000-0000-000000000000',NULL),
(12,NULL,'tutorial-dckr-site-0000-xpresswebapp','managers-role-0000-0000-000000000000',NULL,'bbbbbbbb-good-0000-0000-000000000000'),
(13,'member','tutorial-dckr-site-0000-xpresswebapp','managers-role-0000-0000-000000000000','managers-team-0000-0000-000000000000',NULL);

/*!40000 ALTER TABLE `role_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `permission_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES
(1,'provider','1'),(2,'provider','2'),(3,'provider','3'),(4,'provider','4'),(5,'provider','5'),(6,'provider','6'),
(7,'purchaser','5'),
(8,'security-role-0000-0000-000000000000','alrmbell-ring-0000-0000-000000000000'),
(9,'security-role-0000-0000-000000000000','entrance-open-0000-0000-000000000000'),
(10,'managers-role-0000-0000-000000000000','alrmbell-ring-0000-0000-000000000000'),
(11,'managers-role-0000-0000-000000000000','increase-stck-0000-0000-000000000000'),
(12,'managers-role-0000-0000-000000000000','pricechg-stck-0000-0000-000000000000');




/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `trusted_application`
--

DROP TABLE IF EXISTS `trusted_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trusted_application` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `trusted_oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `trusted_oauth_client_id` (`trusted_oauth_client_id`),
  CONSTRAINT `trusted_application_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trusted_application_ibfk_2` FOREIGN KEY (`trusted_oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_application`
--

LOCK TABLES `trusted_application` WRITE;
/*!40000 ALTER TABLE `trusted_application` DISABLE KEYS */;
/*!40000 ALTER TABLE `trusted_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  `gravatar` tinyint(1) DEFAULT '0',
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(40) DEFAULT NULL,
  `salt` varchar(40) DEFAULT NULL,
  `date_password` datetime DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `admin` tinyint(1) DEFAULT '0',
  `extra` varchar(255) DEFAULT NULL,
  `scope` varchar(80) DEFAULT NULL,
  `starters_tour_ended` tinyint(1) DEFAULT '0',
  `eidas_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
('aaaaaaaa-good-0000-0000-000000000000','alice', 'Alice is the admin',NULL,'default',0,'alice-the-admin@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,1,NULL,NULL,0,NULL),
('bbbbbbbb-good-0000-0000-000000000000','bob','Bob is the regional manager',NULL,'default',0,'bob-the-manager@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('cccccccc-good-0000-0000-000000000000','charlie','Charlie is head of security',NULL,'default',0,'charlie-security@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('manager1-good-0000-0000-000000000000','manager1','Manager works for Bob',NULL,'default',0,'manager1@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('manager2-good-0000-0000-000000000000','manager2','Manager works for Bob',NULL,'default',0,'manager2@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('detective1-good-0000-0000-000000000000','detective1','Detective works for Charlie',NULL,'default',0,'detective1@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('detective2-good-0000-0000-000000000000','detective2','Detective works for Charlie',NULL,'default',0,'detective2@test.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('eve-evil-0000-0000-000000000000','eve','Eve the Eavesdropper',NULL,'default',0,'eve@example.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('mallory-evil-0000-0000-000000000000','mallory','Mallory the malicious attacker',NULL,'default',0,'mallory@example.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL),
('rob-evil-0000-0000-000000000000','rob','Rob the Robber' ,NULL,'default',0,'rob@example.com','89e48c55e4e4b3b86141fb15f5e6abf70f8c32c0', 'fbba54b6750b16e8', '2018-07-30 11:41:14',1,0,NULL,NULL,0,NULL);/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_authorized_application`
--

DROP TABLE IF EXISTS `user_authorized_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_authorized_application` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `shared_attributes` char(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `login_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `user_authorized_application_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_authorized_application_ibfk_2` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_authorized_application`
--

LOCK TABLES `user_authorized_application` WRITE;
/*!40000 ALTER TABLE `user_authorized_application` DISABLE KEYS */;
INSERT INTO `user_authorized_application` VALUES
(1,'admin','8ca60ce9-32f9-42d6-a013-a19b3af0c13d', NULL, NULL),
(2,'aaaaaaaa-good-0000-0000-000000000000','tutorial-dckr-site-0000-xpresswebapp', 'username,email', NULL);
/*!40000 ALTER TABLE `user_authorized_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_organization`
--

DROP TABLE IF EXISTS `user_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_organization` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(10) DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `user_organization_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_organization_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_organization`
--

LOCK TABLES `user_organization` WRITE;
/*!40000 ALTER TABLE `user_organization` DISABLE KEYS */;
INSERT INTO `user_organization` VALUES
(2,'owner', 'aaaaaaaa-good-0000-0000-000000000000','security-team-0000-0000-000000000000'),
(3,'owner', 'aaaaaaaa-good-0000-0000-000000000000','managers-team-0000-0000-000000000000'),
(4,'owner', 'bbbbbbbb-good-0000-0000-000000000000','managers-team-0000-0000-000000000000'),
(5,'member','manager1-good-0000-0000-000000000000','managers-team-0000-0000-000000000000'),
(6,'member','manager2-good-0000-0000-000000000000','managers-team-0000-0000-000000000000'),
(7,'owner', 'cccccccc-good-0000-0000-000000000000','security-team-0000-0000-000000000000'),
(8,'member','detective1-good-0000-0000-000000000000','security-team-0000-0000-000000000000'),
(9,'member','detective2-good-0000-0000-000000000000','security-team-0000-0000-000000000000');
/*!40000 ALTER TABLE `user_organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_registration_profile`
--

DROP TABLE IF EXISTS `user_registration_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_registration_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activation_key` varchar(255) DEFAULT NULL,
  `activation_expires` datetime DEFAULT NULL,
  `reset_key` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `verification_key` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  CONSTRAINT `user_registration_profile_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_registration_profile`
--

LOCK TABLES `user_registration_profile` WRITE;
/*!40000 ALTER TABLE `user_registration_profile` DISABLE KEYS */;
INSERT INTO `user_registration_profile` VALUES (1,'b26roiin0r','2018-07-31 10:03:53',NULL,NULL,NULL,NULL,'eve@test.com');
/*!40000 ALTER TABLE `user_registration_profile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-10  9:03:58
