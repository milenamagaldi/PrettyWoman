-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: power_soccer
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `atletas`
--

DROP TABLE IF EXISTS `atletas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atletas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `numero_camisa` int DEFAULT NULL,
  `equipe_id` int DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipe_id` (`equipe_id`),
  CONSTRAINT `atletas_ibfk_1` FOREIGN KEY (`equipe_id`) REFERENCES `equipes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atletas`
--

LOCK TABLES `atletas` WRITE;
/*!40000 ALTER TABLE `atletas` DISABLE KEYS */;
INSERT INTO `atletas` VALUES (1,'Lucas',10,1,NULL),(3,'Pedro',5,1,NULL),(4,'Marcos',8,1,NULL),(6,'Pelé',10,1,'/uploads/1775563087763.png'),(7,'Romário',11,1,'/uploads/1775587430909.jpg'),(8,'Socrates',86,1,'/uploads/1775588394177.jpg'),(9,'Goianesio',44,1,'/uploads/1776013451021.png'),(10,'superman',99,1,'/uploads/1776684935787.jpg');
/*!40000 ALTER TABLE `atletas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipes`
--

DROP TABLE IF EXISTS `equipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipes`
--

LOCK TABLES `equipes` WRITE;
/*!40000 ALTER TABLE `equipes` DISABLE KEYS */;
INSERT INTO `equipes` VALUES (1,'Seleção Brasileira');
/*!40000 ALTER TABLE `equipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos_scout`
--

DROP TABLE IF EXISTS `eventos_scout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_scout` (
  `id` int NOT NULL AUTO_INCREMENT,
  `partida_id` int DEFAULT NULL,
  `atleta_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `periodo` varchar(20) DEFAULT NULL,
  `minuto_video` varchar(10) DEFAULT NULL,
  `tipo_acao` varchar(50) DEFAULT NULL,
  `coord_x` float DEFAULT NULL,
  `coord_y` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `jogador_entrou_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partida_id` (`partida_id`),
  KEY `atleta_id` (`atleta_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `eventos_scout_ibfk_1` FOREIGN KEY (`partida_id`) REFERENCES `partidas` (`id`),
  CONSTRAINT `eventos_scout_ibfk_2` FOREIGN KEY (`atleta_id`) REFERENCES `atletas` (`id`),
  CONSTRAINT `eventos_scout_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=258 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos_scout`
--

LOCK TABLES `eventos_scout` WRITE;
/*!40000 ALTER TABLE `eventos_scout` DISABLE KEYS */;
INSERT INTO `eventos_scout` VALUES (242,14,1,4,'1º Tempo','00:00','Passe Errado',5.65,61.42,'2026-04-20 12:25:47',NULL),(243,14,1,4,'1º Tempo','00:10','Passe Errado',2.65,47.82,'2026-04-20 12:25:49',NULL),(244,14,1,4,'1º Tempo','00:56','Passe Errado',7.15,50.82,'2026-04-20 12:25:53',NULL),(245,14,1,4,'1º Tempo','01:15','Passe Errado',14.4,47.62,'2026-04-20 12:25:56',NULL),(246,14,1,4,'1º Tempo','03:19','Passe Errado',8.78,65.82,'2026-04-20 12:25:58',NULL),(247,14,1,4,'1º Tempo','04:28','Substituição',NULL,NULL,'2026-04-20 12:26:04',6),(249,14,6,4,'1º Tempo','04:52','Gol',81.41,47.82,'2026-04-20 12:26:14',NULL),(250,14,6,4,'1º Tempo','05:52','Gol',82.53,59.22,'2026-04-20 12:26:27',NULL),(251,14,6,4,'1º Tempo','06:38','Gol',85.66,50.02,'2026-04-20 12:26:30',NULL),(252,14,6,4,'1º Tempo','08:33','Gol',85.91,39.82,'2026-04-20 12:26:34',NULL),(253,14,6,4,'1º Tempo','08:52','Gol',82.66,33.22,'2026-04-20 12:26:45',NULL),(254,14,6,4,'1º Tempo','10:05','Substituição',NULL,NULL,'2026-04-20 12:27:15',1),(255,14,1,4,'1º Tempo','10:42','Passe Errado',78.41,51.22,'2026-04-20 12:27:23',NULL),(256,14,1,4,'1º Tempo','11:47','Passe Errado',78.16,43.62,'2026-04-20 12:27:26',NULL),(257,14,1,4,'1º Tempo','12:47','Passe Errado',77.66,63.82,'2026-04-20 12:27:28',NULL);
/*!40000 ALTER TABLE `eventos_scout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partidas`
--

DROP TABLE IF EXISTS `partidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_jogo` datetime DEFAULT NULL,
  `adversario` varchar(100) DEFAULT NULL,
  `escalacao` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partidas`
--

LOCK TABLES `partidas` WRITE;
/*!40000 ALTER TABLE `partidas` DISABLE KEYS */;
INSERT INTO `partidas` VALUES (12,'2026-04-12 20:44:00','partida1','{\"reservas\": [{\"id\": 6, \"foto\": \"/uploads/1775563087763.png\", \"nome\": \"Pelé\", \"equipe_id\": 1, \"numero_camisa\": \"9\"}, {\"id\": 7, \"foto\": \"/uploads/1775587430909.jpg\", \"nome\": \"Romário\", \"equipe_id\": 1, \"numero_camisa\": \"11\"}, {\"id\": 8, \"foto\": \"/uploads/1775588394177.jpg\", \"nome\": \"Socrates\", \"equipe_id\": 1, \"numero_camisa\": \"86\"}, {\"id\": 9, \"foto\": \"/uploads/1776013451021.png\", \"nome\": \"Goianesio\", \"equipe_id\": 1, \"numero_camisa\": \"44\"}], \"titulares\": [{\"id\": 1, \"foto\": null, \"nome\": \"Lucas\", \"equipe_id\": 1, \"numero_camisa\": \"10\"}, {\"id\": 2, \"foto\": null, \"nome\": \"João\", \"equipe_id\": 1, \"numero_camisa\": \"7\"}, {\"id\": 3, \"foto\": null, \"nome\": \"Pedro\", \"equipe_id\": 1, \"numero_camisa\": \"5\"}, {\"id\": 4, \"foto\": null, \"nome\": \"Marcos\", \"equipe_id\": 1, \"numero_camisa\": \"8\"}]}'),(13,'2026-04-12 20:47:00','partida02','{\"reservas\": [{\"id\": 1, \"foto\": null, \"nome\": \"Lucas\", \"equipe_id\": 1, \"numero_camisa\": \"9\"}, {\"id\": 2, \"foto\": null, \"nome\": \"João\", \"equipe_id\": 1, \"numero_camisa\": \"7\"}, {\"id\": 3, \"foto\": null, \"nome\": \"Pedro\", \"equipe_id\": 1, \"numero_camisa\": \"5\"}, {\"id\": 4, \"foto\": null, \"nome\": \"Marcos\", \"equipe_id\": 1, \"numero_camisa\": \"8\"}], \"titulares\": [{\"id\": 6, \"foto\": \"/uploads/1775563087763.png\", \"nome\": \"Pelé\", \"equipe_id\": 1, \"numero_camisa\": \"10\"}, {\"id\": 9, \"foto\": \"/uploads/1776013451021.png\", \"nome\": \"Goianesio\", \"equipe_id\": 1, \"numero_camisa\": \"44\"}, {\"id\": 8, \"foto\": \"/uploads/1775588394177.jpg\", \"nome\": \"Socrates\", \"equipe_id\": 1, \"numero_camisa\": \"86\"}, {\"id\": 7, \"foto\": \"/uploads/1775587430909.jpg\", \"nome\": \"Romário\", \"equipe_id\": 1, \"numero_camisa\": \"11\"}]}'),(14,'2026-04-12 21:41:00','Final','{\"reservas\": [{\"id\": 6, \"foto\": \"/uploads/1775563087763.png\", \"nome\": \"Pelé\", \"equipe_id\": 1, \"numero_camisa\": \"9\"}, {\"id\": 7, \"foto\": \"/uploads/1775587430909.jpg\", \"nome\": \"Romário\", \"equipe_id\": 1, \"numero_camisa\": \"11\"}, {\"id\": 8, \"foto\": \"/uploads/1775588394177.jpg\", \"nome\": \"Socrates\", \"equipe_id\": 1, \"numero_camisa\": \"86\"}, {\"id\": 9, \"foto\": \"/uploads/1776013451021.png\", \"nome\": \"Goianesio\", \"equipe_id\": 1, \"numero_camisa\": \"44\"}], \"titulares\": [{\"id\": 1, \"foto\": null, \"nome\": \"Lucas\", \"equipe_id\": 1, \"numero_camisa\": \"10\"}, {\"id\": 2, \"foto\": null, \"nome\": \"João\", \"equipe_id\": 1, \"numero_camisa\": \"7\"}, {\"id\": 3, \"foto\": null, \"nome\": \"Pedro\", \"equipe_id\": 1, \"numero_camisa\": \"5\"}, {\"id\": 4, \"foto\": null, \"nome\": \"Marcos\", \"equipe_id\": 1, \"numero_camisa\": \"8\"}]}');
/*!40000 ALTER TABLE `partidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'Ryan David','ryandultra@gmail.com','google-auth');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-20 11:27:03
