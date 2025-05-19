-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: infocusedframes
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `acrylic_cover_pricings`
--

DROP TABLE IF EXISTS `acrylic_cover_pricings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acrylic_cover_pricings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicability` enum('photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'photo',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `acrylic_cover_pricings_product_id_foreign` (`product_id`),
  CONSTRAINT `acrylic_cover_pricings_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acrylic_cover_pricings`
--

LOCK TABLES `acrylic_cover_pricings` WRITE;
/*!40000 ALTER TABLE `acrylic_cover_pricings` DISABLE KEYS */;
/*!40000 ALTER TABLE `acrylic_cover_pricings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternate_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line_1` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_2` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_customer_id_foreign` (`customer_id`),
  CONSTRAINT `addresses_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inactive',
  `published_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_unique` (`slug`),
  KEY `blogs_user_id_foreign` (`user_id`),
  CONSTRAINT `blogs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,NULL,'Fabric Frames - The Better Choice','fabric-frames-the-better-choice','<h3>Why Fabric Frames Make an Exceptional Option for Showcasing Your Photographs</h3><p>When itΓÇÖs time to frame your treasured moments, youΓÇÖll find a wide array of options on the market. While classic wood or metal frames have their own charm, fabric frames bring a distinct set of advantages that make them an outstanding alternative. HereΓÇÖs why fabric frames are worth considering for your next photo display.</p><hr><h4>1. Visually Striking</h4><p>Fabric frames lend a refined and graceful appearance to any setting. With countless textures, patterns, and hues to choose from, they can be easily matched to your interior style. Whether you&#039;re drawn to the rustic charm of burlap or the rich feel of velvet, fabric frames elevate both your photos and the ambiance of the room.</p><hr><h4>2. Design Flexibility</h4><p>One of the standout features of fabric frames is how adaptable they are. They effortlessly suit a broad spectrum of design aestheticsΓÇöfrom sleek and modern to retro and whimsical. This makes them a great fit for various environments, be it your home, workspace, or gallery wall.</p><hr><h4>3. Inviting Texture</h4><p>Unlike the cool feel of metal or the rigid nature of wood, fabric frames bring warmth and softness. This gentle texture adds a cozy, lived-in feel to any room and enhances the emotional connection to the memories on displayΓÇöideal for spaces focused on comfort and tranquility.</p><hr><h4>4. Strong and Protective</h4><p>Well-crafted fabric frames are not only attractive but also resilient. Their padded nature helps absorb impacts, offering an extra layer of defense against accidental bumps or drops. Most are also fitted with glass or acrylic covers, providing reliable protection without sacrificing style.</p><hr><h4>5. Sustainable Materials</h4><p>If you&#039;re mindful of the environment, fabric frames can be a greener alternative. Many are made from renewable or recycled materials like cotton, linen, or jute. Choosing sustainable frames allows you to reduce your environmental impact while still enjoying a beautiful and thoughtful photo display.</p><hr><h3>Final Thoughts</h3><p>Fabric frames combine visual elegance, design adaptability, comforting textures, lasting durability, and eco-conscious craftsmanship. TheyΓÇÖre not just framesΓÇötheyΓÇÖre a personal design choice that reflects your style and values. Next time youΓÇÖre looking to frame a memory, consider fabric frames as a meaningful, stylish, and sustainable option.</p>','BlogThumbnails/01JV9BDM1S6HF21MMPS27ZF71G.png','Author 1','Active','2025-05-15','2025-05-15 01:21:58','2025-05-15 01:21:58'),(2,NULL,'How to Elevate Your Walls Using Frames','how-to-elevate-your-walls-using-frames','<h3>How to Transform Your Walls with the Power of Framing</h3><p>Giving your home a fresh new feel doesnΓÇÖt always call for a full renovation. In fact, subtle updates can often create the most noticeable changes. One simple yet powerful way to refresh your space is by decorating your walls with frames. HereΓÇÖs how to use them creatively to enhance your homeΓÇÖs ambiance:</p><hr><h4>1. Design a Gallery Wall</h4><p>A gallery wall offers a beautiful way to showcase your favorite photos, prints, and artwork. Choose a mix of frame sizes and styles to add dimension and character. You can opt for an orderly grid layout or go for a more eclectic, free-flowing arrangement. Either way, a well-curated gallery wall can become a standout feature in your space.</p><hr><h4>2. Blend Different Frame Types</h4><p>ThereΓÇÖs no need to stick to one frame style. Mixing materials like wood, metal, and fabric can result in a rich, layered look. Each frame type brings a unique feelΓÇöbe it warmth, elegance, or texture. This combination makes your wall more visually interesting while allowing each piece to shine.</p><hr><h4>3. Showcase Meaningful Memories</h4><p>Use frames to celebrate lifeΓÇÖs most memorable momentsΓÇöthink weddings, anniversaries, family vacations, or other milestones. Display these special memories in high-traffic or personal spaces where they can be seen and appreciated daily. ItΓÇÖs a great way to make your d├⌐cor more personal and heartfelt.</p><hr><h4>4. Feature Artwork and Decorative Prints</h4><p>Framing isnΓÇÖt just for personal photos. Adding framed artwork or stylish prints can instantly elevate the sophistication of a room. Select pieces that reflect your taste and work well with your color palette. From modern abstracts to timeless botanicals, art in frames brings culture and creativity to your home.</p><hr><h4>5. Use Frame Ledges for Flexibility</h4><p>Frame ledges (narrow display shelves) offer a flexible way to decorate your walls without committing to nails and hooks. They allow you to layer and rotate frames easily, making it simple to refresh your display with the seasons or your evolving style. TheyΓÇÖre sleek, modern, and highly practical.</p><hr><h4>6. Experiment with Colors and Textures</h4><p>Bring visual interest to your walls by playing with frame colors and materials. For instance, soft fabric frames can add warmth, while shiny metallics introduce a modern edge. Mixing these textures and tones keeps your wall from feeling flat and makes the overall presentation more engaging.</p><hr><h4>7. Add Dimension with Shadow Boxes</h4><p>Shadow boxes provide a deeper frame profile, ideal for displaying keepsakes like travel souvenirs, dried flowers, or memorabilia. These three-dimensional displays add both depth and storytelling to your wall d├⌐cor, making them eye-catching and meaningful.</p><hr><h3>Final Thoughts</h3><p>With thoughtful choices and placement, frames can turn plain walls into stunning visual stories. Whether youΓÇÖre curating a gallery wall, playing with textures, or showing off treasured memories, frames offer endless creative opportunities. Start reimagining your walls todayΓÇöand watch your space come to life.</p>','BlogThumbnails/01JV9BH69RE5AKS8GKN80AGS5D.png','Author 2','Active','2025-05-15','2025-05-15 01:23:55','2025-05-15 01:23:55');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('infocused_frames_cache_356a192b7913b04c54574d18c28d46e6395428ab','i:1;',1747292064),('infocused_frames_cache_356a192b7913b04c54574d18c28d46e6395428ab:timer','i:1747292064;',1747292064),('infocused_frames_cache_livewire-rate-limiter:a17961fa74e9275d529f489537f179c05d50c2f3','i:1;',1747291705),('infocused_frames_cache_livewire-rate-limiter:a17961fa74e9275d529f489537f179c05d50c2f3:timer','i:1747291705;',1747291705);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_uploaded_images`
--

DROP TABLE IF EXISTS `customer_uploaded_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_uploaded_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_uploaded_images_customer_id_foreign` (`customer_id`),
  CONSTRAINT `customer_uploaded_images_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_uploaded_images`
--

LOCK TABLES `customer_uploaded_images` WRITE;
/*!40000 ALTER TABLE `customer_uploaded_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_uploaded_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alternate_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_user_id_foreign` (`user_id`),
  CONSTRAINT `customers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,8,'Customer',NULL,NULL,NULL,'Active','2025-04-06 12:54:45','2025-04-06 12:54:45');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edge_designs`
--

DROP TABLE IF EXISTS `edge_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edge_designs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `applicability` enum('canvas','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'canvas',
  `product_id` bigint unsigned DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `edge_designs_product_id_foreign` (`product_id`),
  CONSTRAINT `edge_designs_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edge_designs`
--

LOCK TABLES `edge_designs` WRITE;
/*!40000 ALTER TABLE `edge_designs` DISABLE KEYS */;
INSERT INTO `edge_designs` VALUES (1,'Folded','ImageEffectThumbnail/01JRHTSXW4WDEH5YDVGGXK1KKM.jpg',0.00,'canvas',NULL,'active','2025-04-11 01:37:40','2025-04-11 01:37:40');
/*!40000 ALTER TABLE `edge_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `floating_frame_colours`
--

DROP TABLE IF EXISTS `floating_frame_colours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `floating_frame_colours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicability` enum('photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'photo',
  `product_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `floating_frame_colours_product_id_foreign` (`product_id`),
  CONSTRAINT `floating_frame_colours_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floating_frame_colours`
--

LOCK TABLES `floating_frame_colours` WRITE;
/*!40000 ALTER TABLE `floating_frame_colours` DISABLE KEYS */;
/*!40000 ALTER TABLE `floating_frame_colours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frame_colours`
--

DROP TABLE IF EXISTS `frame_colours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frame_colours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicability` enum('all','fabric','photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `frame_colours_product_id_foreign` (`product_id`),
  CONSTRAINT `frame_colours_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frame_colours`
--

LOCK TABLES `frame_colours` WRITE;
/*!40000 ALTER TABLE `frame_colours` DISABLE KEYS */;
INSERT INTO `frame_colours` VALUES (1,'Black','FrameColourThumbnail/01JS4TJC47ZFZTFKFVN1BS9P01.png','fabric',NULL,120.00,'active','2025-04-18 10:39:06','2025-04-18 10:39:06');
/*!40000 ALTER TABLE `frame_colours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frame_thicknesses`
--

DROP TABLE IF EXISTS `frame_thicknesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frame_thicknesses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicability` enum('all','canvas','fabric','photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `frame_thicknesses_product_id_foreign` (`product_id`),
  CONSTRAINT `frame_thicknesses_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frame_thicknesses`
--

LOCK TABLES `frame_thicknesses` WRITE;
/*!40000 ALTER TABLE `frame_thicknesses` DISABLE KEYS */;
/*!40000 ALTER TABLE `frame_thicknesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frame_types`
--

DROP TABLE IF EXISTS `frame_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frame_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicability` enum('photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'photo',
  `product_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `frame_types_product_id_foreign` (`product_id`),
  CONSTRAINT `frame_types_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frame_types`
--

LOCK TABLES `frame_types` WRITE;
/*!40000 ALTER TABLE `frame_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `frame_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hanging_mechanism_base_prices`
--

DROP TABLE IF EXISTS `hanging_mechanism_base_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hanging_mechanism_base_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicability` enum('all','canvas','fabric','photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hanging_mechanism_base_prices_product_id_foreign` (`product_id`),
  CONSTRAINT `hanging_mechanism_base_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hanging_mechanism_base_prices`
--

LOCK TABLES `hanging_mechanism_base_prices` WRITE;
/*!40000 ALTER TABLE `hanging_mechanism_base_prices` DISABLE KEYS */;
INSERT INTO `hanging_mechanism_base_prices` VALUES (1,'canvas',NULL,120.00,'active','2025-04-11 03:15:59','2025-04-11 03:15:59'),(2,'fabric',NULL,150.00,'active','2025-04-11 06:45:39','2025-04-11 06:45:39');
/*!40000 ALTER TABLE `hanging_mechanism_base_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hanging_mechanism_varieties`
--

DROP TABLE IF EXISTS `hanging_mechanism_varieties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hanging_mechanism_varieties` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicability` enum('all','canvas','fabric','photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hanging_mechanism_varieties_product_id_foreign` (`product_id`),
  CONSTRAINT `hanging_mechanism_varieties_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hanging_mechanism_varieties`
--

LOCK TABLES `hanging_mechanism_varieties` WRITE;
/*!40000 ALTER TABLE `hanging_mechanism_varieties` DISABLE KEYS */;
INSERT INTO `hanging_mechanism_varieties` VALUES (1,'French Cleat - Suggested','HMVThumbnail/01JRJF6BFYMJD265ZS8J3K3SEH.png','fabric',NULL,550.00,'active','2025-04-11 07:33:58','2025-04-11 07:33:58');
/*!40000 ALTER TABLE `hanging_mechanism_varieties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_effects`
--

DROP TABLE IF EXISTS `image_effects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_effects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicability` enum('all','canvas','fabric','photo','specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `product_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_effects_product_id_foreign` (`product_id`),
  CONSTRAINT `image_effects_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_effects`
--

LOCK TABLES `image_effects` WRITE;
/*!40000 ALTER TABLE `image_effects` DISABLE KEYS */;
INSERT INTO `image_effects` VALUES (1,'Original','ImageEffectThumbnail/01JRDTGQVTZ9Q53BEKDP1Y1GTK.jpg','canvas',NULL,0.00,'active','2025-04-09 12:15:41','2025-04-09 12:15:41'),(2,'Black & White','ImageEffectThumbnail/01JRDTKAJS7WCBTTM0AP4EHEAM.jpg','specific',3,0.00,'active','2025-04-09 12:17:06','2025-04-09 12:17:06'),(3,'Sepia','ImageEffectThumbnail/01JRDTN46Q2EYW23BSSPZK3PBY.png','all',NULL,0.00,'active','2025-04-09 12:18:05','2025-04-09 12:18:05'),(4,'Original','ImageEffectThumbnail/01JRFDHPK5NYKHKMW3ZAXVRK2S.png','fabric',NULL,0.00,'active','2025-04-10 03:07:30','2025-04-10 03:07:30');
/*!40000 ALTER TABLE `image_effects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `length_units`
--

DROP TABLE IF EXISTS `length_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `length_units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `length_units`
--

LOCK TABLES `length_units` WRITE;
/*!40000 ALTER TABLE `length_units` DISABLE KEYS */;
INSERT INTO `length_units` VALUES (1,'Cm'),(2,'Inch');
/*!40000 ALTER TABLE `length_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(17,'2025_03_27_174239_create_customers_table',2),(18,'2025_03_27_174533_create_staffs_table',2),(30,'2025_03_27_174533_create_staff_table',3),(31,'2025_03_27_174937_create_products_table',3),(32,'2025_03_27_175355_create_length_units_table',3),(42,'2025_03_27_175356_create_product_variations_table',4),(43,'2025_03_27_181601_create_product_variation_layout_details_table',4),(44,'2025_03_27_183100_create_image_effects_table',4),(45,'2025_03_27_183347_create_product_variation_image_effects_table',4),(46,'2025_03_27_211743_create_edge_designs_table',4),(47,'2025_03_27_212308_create_product_variation_edge_designs_table',4),(48,'2025_03_27_215331_create_hanging_mechanism_base_prices_table',4),(49,'2025_03_29_195645_create_hanging_mechanism_varieties_table',4),(52,'2025_03_29_201736_create_product_variation_hanging_prices_table',5),(53,'2025_04_04_184959_create_product_variation_hanging_varieties_table',5),(55,'2025_04_05_161409_create_frame_colours_table',6),(84,'2025_04_05_161809_create_product_variation_frame_colours_table',7),(85,'2025_04_05_162054_create_frame_thicknesses_table',7),(86,'2025_04_05_162354_create_product_variation_frame_thicknesses_table',7),(134,'2025_04_05_170144_create_product_types_table',8),(135,'2025_04_05_170748_create_product_variation_type_pricings_table',8),(136,'2025_04_05_171038_create_frame_types_table',8),(137,'2025_04_05_171052_create_product_variation_frame_types_table',8),(138,'2025_04_05_172418_create_floating_frame_colours_table',8),(139,'2025_04_05_172436_create_product_variation_floating_frame_colours_table',8),(140,'2025_04_05_173551_create_acrylic_cover_pricings_table',8),(141,'2025_04_05_173606_create_product_variation_acrylic_cover_pricings_table',8),(142,'2025_04_05_174914_create_addresses_table',8),(143,'2025_04_05_175534_create_customer_uploaded_images_table',8),(144,'2025_05_01_162521_create_blogs_table',8),(145,'2025_05_01_184616_create_saved_designs_table',8),(146,'2025_05_02_171457_create_saved_design_attributes_table',8),(147,'2025_05_02_171647_create_saved_design_images_table',8),(148,'2025_05_09_173303_create_shopping_cart_items_table',9);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_types`
--

DROP TABLE IF EXISTS `product_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicability` enum('fabric','specific') COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_types_product_id_foreign` (`product_id`),
  CONSTRAINT `product_types_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_types`
--

LOCK TABLES `product_types` WRITE;
/*!40000 ALTER TABLE `product_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_acrylic_cover_pricings`
--

DROP TABLE IF EXISTS `product_variation_acrylic_cover_pricings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_acrylic_cover_pricings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pvacp_pv_fk` (`product_variation_id`),
  CONSTRAINT `pvacp_pv_fk` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_acrylic_cover_pricings`
--

LOCK TABLES `product_variation_acrylic_cover_pricings` WRITE;
/*!40000 ALTER TABLE `product_variation_acrylic_cover_pricings` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variation_acrylic_cover_pricings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_edge_designs`
--

DROP TABLE IF EXISTS `product_variation_edge_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_edge_designs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `edge_design_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variation_edge_designs_product_variation_id_foreign` (`product_variation_id`),
  KEY `product_variation_edge_designs_edge_design_id_foreign` (`edge_design_id`),
  CONSTRAINT `product_variation_edge_designs_edge_design_id_foreign` FOREIGN KEY (`edge_design_id`) REFERENCES `edge_designs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_edge_designs_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_edge_designs`
--

LOCK TABLES `product_variation_edge_designs` WRITE;
/*!40000 ALTER TABLE `product_variation_edge_designs` DISABLE KEYS */;
INSERT INTO `product_variation_edge_designs` VALUES (1,16,1,120.00,'active','2025-04-11 02:06:33','2025-04-11 02:06:33');
/*!40000 ALTER TABLE `product_variation_edge_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_floating_frame_colours`
--

DROP TABLE IF EXISTS `product_variation_floating_frame_colours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_floating_frame_colours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `floating_frame_colour_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pv_ffc_unique` (`product_variation_id`,`floating_frame_colour_id`),
  KEY `pv_ff_colour_fk` (`floating_frame_colour_id`),
  CONSTRAINT `pv_ff_colour_fk` FOREIGN KEY (`floating_frame_colour_id`) REFERENCES `floating_frame_colours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pvffc_pv_fk` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_floating_frame_colours`
--

LOCK TABLES `product_variation_floating_frame_colours` WRITE;
/*!40000 ALTER TABLE `product_variation_floating_frame_colours` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variation_floating_frame_colours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_frame_colours`
--

DROP TABLE IF EXISTS `product_variation_frame_colours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_frame_colours` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `frame_colour_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pv_fc_unique` (`product_variation_id`,`frame_colour_id`),
  KEY `pvfc_fc_fk` (`frame_colour_id`),
  CONSTRAINT `pvfc_fc_fk` FOREIGN KEY (`frame_colour_id`) REFERENCES `frame_colours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pvfc_pv_fk` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_frame_colours`
--

LOCK TABLES `product_variation_frame_colours` WRITE;
/*!40000 ALTER TABLE `product_variation_frame_colours` DISABLE KEYS */;
INSERT INTO `product_variation_frame_colours` VALUES (1,14,1,12.00,'active','2025-04-18 10:47:34','2025-04-18 10:47:34');
/*!40000 ALTER TABLE `product_variation_frame_colours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_frame_thicknesses`
--

DROP TABLE IF EXISTS `product_variation_frame_thicknesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_frame_thicknesses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `frame_thickness_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pv_ft_unique` (`product_variation_id`,`frame_thickness_id`),
  KEY `product_variation_frame_thicknesses_frame_thickness_id_foreign` (`frame_thickness_id`),
  CONSTRAINT `product_variation_frame_thicknesses_frame_thickness_id_foreign` FOREIGN KEY (`frame_thickness_id`) REFERENCES `frame_thicknesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_frame_thicknesses_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_frame_thicknesses`
--

LOCK TABLES `product_variation_frame_thicknesses` WRITE;
/*!40000 ALTER TABLE `product_variation_frame_thicknesses` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variation_frame_thicknesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_frame_types`
--

DROP TABLE IF EXISTS `product_variation_frame_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_frame_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `frame_type_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pv_fty_unique` (`product_variation_id`,`frame_type_id`),
  KEY `product_variation_frame_types_frame_type_id_foreign` (`frame_type_id`),
  CONSTRAINT `product_variation_frame_types_frame_type_id_foreign` FOREIGN KEY (`frame_type_id`) REFERENCES `frame_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_frame_types_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_frame_types`
--

LOCK TABLES `product_variation_frame_types` WRITE;
/*!40000 ALTER TABLE `product_variation_frame_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variation_frame_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_hanging_prices`
--

DROP TABLE IF EXISTS `product_variation_hanging_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_hanging_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variation_hanging_prices_product_variation_id_foreign` (`product_variation_id`),
  CONSTRAINT `product_variation_hanging_prices_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_hanging_prices`
--

LOCK TABLES `product_variation_hanging_prices` WRITE;
/*!40000 ALTER TABLE `product_variation_hanging_prices` DISABLE KEYS */;
INSERT INTO `product_variation_hanging_prices` VALUES (1,13,120.00,'active','2025-04-11 07:04:50','2025-04-11 07:04:50');
/*!40000 ALTER TABLE `product_variation_hanging_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_hanging_varieties`
--

DROP TABLE IF EXISTS `product_variation_hanging_varieties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_hanging_varieties` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `hanging_mechanism_variety_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variation_hanging_varieties_product_variation_id_foreign` (`product_variation_id`),
  KEY `pv_hm_variety_fk` (`hanging_mechanism_variety_id`),
  CONSTRAINT `product_variation_hanging_varieties_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pv_hm_variety_fk` FOREIGN KEY (`hanging_mechanism_variety_id`) REFERENCES `hanging_mechanism_varieties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_hanging_varieties`
--

LOCK TABLES `product_variation_hanging_varieties` WRITE;
/*!40000 ALTER TABLE `product_variation_hanging_varieties` DISABLE KEYS */;
INSERT INTO `product_variation_hanging_varieties` VALUES (1,14,1,600.00,'active','2025-04-11 12:15:52','2025-04-11 12:15:52');
/*!40000 ALTER TABLE `product_variation_hanging_varieties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_image_effects`
--

DROP TABLE IF EXISTS `product_variation_image_effects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_image_effects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `image_effect_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variation_image_effects_product_variation_id_foreign` (`product_variation_id`),
  KEY `product_variation_image_effects_image_effect_id_foreign` (`image_effect_id`),
  CONSTRAINT `product_variation_image_effects_image_effect_id_foreign` FOREIGN KEY (`image_effect_id`) REFERENCES `image_effects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_image_effects_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_image_effects`
--

LOCK TABLES `product_variation_image_effects` WRITE;
/*!40000 ALTER TABLE `product_variation_image_effects` DISABLE KEYS */;
INSERT INTO `product_variation_image_effects` VALUES (2,14,4,20.00,'active','2025-04-10 03:09:13','2025-04-10 03:09:13'),(3,16,1,20.00,'inactive','2025-04-14 02:56:51','2025-04-14 03:04:21'),(8,16,2,12.00,'active','2025-04-14 04:29:22','2025-04-14 04:29:22');
/*!40000 ALTER TABLE `product_variation_image_effects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_layout_details`
--

DROP TABLE IF EXISTS `product_variation_layout_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_layout_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_count` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variation_layout_details_product_variation_id_foreign` (`product_variation_id`),
  CONSTRAINT `product_variation_layout_details_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_layout_details`
--

LOCK TABLES `product_variation_layout_details` WRITE;
/*!40000 ALTER TABLE `product_variation_layout_details` DISABLE KEYS */;
INSERT INTO `product_variation_layout_details` VALUES (3,13,'LayoutThumbnail/01JRCSK6BMZ31YHCVV34FM8ECR.jpg',2),(4,15,'LayoutThumbnail/01JRCT6JGB3YGE4CWTB4TE9ZV0.jpg',3);
/*!40000 ALTER TABLE `product_variation_layout_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_type_pricings`
--

DROP TABLE IF EXISTS `product_variation_type_pricings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_type_pricings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_variation_id` bigint unsigned NOT NULL,
  `product_type_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pv_pt_unique` (`product_variation_id`,`product_type_id`),
  KEY `product_variation_type_pricings_product_type_id_foreign` (`product_type_id`),
  CONSTRAINT `product_variation_type_pricings_product_type_id_foreign` FOREIGN KEY (`product_type_id`) REFERENCES `product_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_type_pricings_product_variation_id_foreign` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_type_pricings`
--

LOCK TABLES `product_variation_type_pricings` WRITE;
/*!40000 ALTER TABLE `product_variation_type_pricings` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variation_type_pricings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horizontal_length` decimal(10,2) NOT NULL,
  `vertical_length` decimal(10,2) NOT NULL,
  `length_unit_id` bigint unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variations_product_id_foreign` (`product_id`),
  KEY `product_variations_length_unit_id_foreign` (`length_unit_id`),
  CONSTRAINT `product_variations_length_unit_id_foreign` FOREIGN KEY (`length_unit_id`) REFERENCES `length_units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_variations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
INSERT INTO `product_variations` VALUES (13,2,'2 Photo Tiles - 2 Photo Tiles',20.00,10.00,2,960.00,'active','2025-04-09 02:10:18','2025-04-09 02:48:04'),(14,1,'XS (Square) - 18\" x 18\"',18.00,18.00,2,360.40,'active','2025-04-09 02:48:44','2025-04-09 02:48:44'),(15,2,'3 Photo Tiles - 3 Photo Tiles',30.00,10.00,2,756.80,'active','2025-04-09 02:50:53','2025-04-09 02:50:53'),(16,3,'S (Portrait) - 8\" x 12\"',8.00,12.00,2,950.00,'active','2025-04-11 02:01:45','2025-04-11 02:01:45');
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` enum('canvas_print','canvas_layout','canvas_split','fabric_frame','fabric_layout','fabric_split','photo_frame','photo_layout','photo_split','photo_tiles') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('canvas','fabric','photo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('size','layout') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'fabric_frame','fabric','size','2025-04-07 12:48:10','2025-04-07 12:48:10'),(2,'photo_tiles','photo','layout','2025-04-07 12:48:27','2025-04-07 12:49:17'),(3,'canvas_print','canvas','size','2025-04-07 13:03:13','2025-04-07 13:03:13'),(4,'photo_frame','photo','size','2025-04-26 11:31:24','2025-04-26 11:31:24');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_design_attributes`
--

DROP TABLE IF EXISTS `saved_design_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_design_attributes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `saved_design_id` bigint unsigned NOT NULL,
  `attribute_name` enum('product_type_id','image_effect_id','edge_design_id','frame_colour_id','frame_thickness_id','frame_type_id','floating_frame_colour_id','acrylic_cover','hanging_mechanism','hanging_mechanism_variety_id') COLLATE utf8mb4_unicode_ci NOT NULL,
  `attribute_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sdsda_sd_fk` (`saved_design_id`),
  CONSTRAINT `sdsda_sd_fk` FOREIGN KEY (`saved_design_id`) REFERENCES `saved_designs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_design_attributes`
--

LOCK TABLES `saved_design_attributes` WRITE;
/*!40000 ALTER TABLE `saved_design_attributes` DISABLE KEYS */;
INSERT INTO `saved_design_attributes` VALUES (1,1,'image_effect_id','1'),(2,1,'edge_design_id','1'),(3,1,'hanging_mechanism','yes'),(4,2,'image_effect_id','3'),(5,2,'hanging_mechanism','yes'),(6,3,'image_effect_id','3'),(7,3,'hanging_mechanism','yes');
/*!40000 ALTER TABLE `saved_design_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_design_images`
--

DROP TABLE IF EXISTS `saved_design_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_design_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `saved_design_id` bigint unsigned NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sdsdi_sd_fk` (`saved_design_id`),
  CONSTRAINT `sdsdi_sd_fk` FOREIGN KEY (`saved_design_id`) REFERENCES `saved_designs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_design_images`
--

LOCK TABLES `saved_design_images` WRITE;
/*!40000 ALTER TABLE `saved_design_images` DISABLE KEYS */;
INSERT INTO `saved_design_images` VALUES (1,1,'SavedDesignImages/01JTE7SZR5NK7N5Z9KEAM2MRV1.jpg',1),(2,2,'SavedDesignImages/HDKQvPDtOeD33qNH8gONdQNAhtJMry1f6L2Re9KT.jpg',1),(3,2,'SavedDesignImages/WQSFNgAatpuK1570yvKD3HQx3VzVtVmIaH9h6zZm.jpg',2),(4,3,'SavedDesignImages/6A0DBBl9eVGduDWLdWpGxhqjD4gvjmawUMJpi67v.jpg',1),(5,3,'SavedDesignImages/IjKBOH0KTtGcYdvoKPjSlWBdjqEylcKS2IoQ9Vof.jpg',2);
/*!40000 ALTER TABLE `saved_design_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_designs`
--

DROP TABLE IF EXISTS `saved_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_designs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `product_variation_id` bigint unsigned NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Draft','Finalized','Carted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `saved_designs_customer_id_foreign` (`customer_id`),
  KEY `pvsd_pv_fk` (`product_variation_id`),
  CONSTRAINT `pvsd_pv_fk` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_designs_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_designs`
--

LOCK TABLES `saved_designs` WRITE;
/*!40000 ALTER TABLE `saved_designs` DISABLE KEYS */;
INSERT INTO `saved_designs` VALUES (1,1,16,'SavedDesignThumbnail/01JTE7SZQRP1JPS5V6HMMB6GWV.jpg','Draft','2025-05-04 12:39:19','2025-05-04 12:39:19'),(2,1,13,'SavedDesignThumbnail/qd7BcM4IPqKFIc7iLrqeaEsdAOtEzqSLenSWBOai.jpg','Draft','2025-05-08 04:28:36','2025-05-08 04:28:36'),(3,1,13,'SavedDesignThumbnail/OhSJWPsd1DJ4zjqAJU6y5bXXZzLnIYuVE9uaEh96.jpg','Carted','2025-05-08 07:23:27','2025-05-10 03:23:55');
/*!40000 ALTER TABLE `saved_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('8EaWNSrM0CAXoFQEfZC0QqyA5tqfNfOhtdHdy8po',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoibDVNaWRmQ2N3U0NRamlna010R0tqbWNNdXZBVEhoQlRTcEt1QndpeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1747601419),('MNe7MQAyR0EE7G5ADwAowDOtV9x2YNCA1HoVbwPS',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','YTo3OntzOjY6Il90b2tlbiI7czo0MDoicTFNbGhCWHY5TGc0M21EN0VtdUFCRWF0SE1mTXpNb2h0OEpha1lUUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6MzoidXJsIjthOjA6e31zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjYwOiIkMnkkMTIkLlc3dUJIb1dkOFJzU1VRZmlKUFZUT0pIRThHRGsxRFBaRk5OcXRIN3Joc21oUXJwR2tGS2UiO3M6ODoiZmlsYW1lbnQiO2E6MDp7fX0=',1747292303),('viAFpt5UhQDlRjNolEPc1srjD9ShHWu6LlbSnTm2',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoid1NhVEprRzd4dlFiZFNUOWt6Q3FqWUladGMxS0xRR2tUNEZsdVUxcSI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czoyNzoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluIjt9czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1747287078);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_cart_items`
--

DROP TABLE IF EXISTS `shopping_cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `saved_design_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `c_sci_fk` (`customer_id`),
  KEY `sd_sci_fk` (`saved_design_id`),
  CONSTRAINT `c_sci_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sd_sci_fk` FOREIGN KEY (`saved_design_id`) REFERENCES `saved_designs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_cart_items`
--

LOCK TABLES `shopping_cart_items` WRITE;
/*!40000 ALTER TABLE `shopping_cart_items` DISABLE KEYS */;
INSERT INTO `shopping_cart_items` VALUES (2,1,3,2,'2025-05-10 03:23:55','2025-05-10 03:23:55'),(3,1,3,2,'2025-05-10 03:30:27','2025-05-10 03:30:27'),(4,1,3,2,'2025-05-10 03:31:22','2025-05-10 03:31:22');
/*!40000 ALTER TABLE `shopping_cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_user_id_foreign` (`user_id`),
  CONSTRAINT `staff_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,5,'Staff',NULL,NULL,'StaffImages/01JR65393GBMQE1XM6Q4CN48T0.jpg','Active','2025-04-06 12:45:19','2025-04-06 12:46:39');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffs`
--

DROP TABLE IF EXISTS `staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staffs_user_id_foreign` (`user_id`),
  CONSTRAINT `staffs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffs`
--

LOCK TABLES `staffs` WRITE;
/*!40000 ALTER TABLE `staffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Admin','Staff','Customer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Customer',
  `status` enum('Active','Inactive','Suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@admin.com','2025-04-06 17:01:51','$2y$12$.W7uBHoWd8RsSUQfiJPVTOJHE8GDk1DPZFNNqtH7rhsmhQrpGkFKe','Admin','Active',NULL,'2025-03-27 13:13:14','2025-04-06 11:40:51'),(5,'Staff','staff@staff.com',NULL,'$2y$12$eQVVjFn.ejl5Q1fwqIfMoOOVwM6hG6vTcO7H5pmVO44g8xp8fvQKG','Staff','Active',NULL,'2025-04-06 12:45:19','2025-04-06 12:45:19'),(8,'Customer','customer@customer.com',NULL,'$2y$12$6Yy3Vb1YM3xDhboUzF4Q7OEI2zlWPKG7Te3EdvsgpzPqg1Cc/dAB.','Customer','Active',NULL,'2025-04-06 12:54:45','2025-04-06 12:54:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-20  0:33:01
