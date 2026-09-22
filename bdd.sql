-- 1. Désactivation temporaire des clés étrangères pour réinitialiser la base
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Suppression de toutes les anciennes tables
DROP TABLE IF EXISTS logs_capteurs;
DROP TABLE IF EXISTS routines_quotidiennes;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS regles_automatiques;
DROP TABLE IF EXISTS matos_iot;
DROP TABLE IF EXISTS ressources;
DROP TABLE IF EXISTS ressources_vitales;
DROP TABLE IF EXISTS plantes;
DROP TABLE IF EXISTS objets_suivis;
DROP TABLE IF EXISTS utilisateurs;

-- 3. Réactivation des clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- CRÉATION DE LA STRUCTURE DE LA BASE DE DONNÉES
-- ========================================================

-- Table 1 : Utilisateurs (Membres du projet / Astronautes)
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

-- Table 2 : Ressources Vitales (Gestion Eau, Nourriture, Sommeil/O2)
CREATE TABLE ressources_vitales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    categorie ENUM('eau', 'nourriture', 'sommeil') NOT NULL,
    quantite_restante DECIMAL(10,2) NOT NULL DEFAULT 100.0,
    quantite_max DECIMAL(10,2) NOT NULL DEFAULT 100.0,
    unite VARCHAR(20) NOT NULL,
    couleur_led_associee VARCHAR(20) DEFAULT 'BLEU'
);

-- Table 3 : Plantes de la serre (Suivi des légumes)
CREATE TABLE plantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    humidite_sol DECIMAL(5,2) DEFAULT 50.0,
    temperature_ideale DECIMAL(4,1) DEFAULT 22.0,
    sante_globale ENUM('EXCELLENTE', 'BONNE', 'ATTENTION', 'CRITIQUE') DEFAULT 'BONNE',
    couleur_led_associee VARCHAR(20) DEFAULT 'ROUGE'
);

-- Table 4 : Matériel IoT (Capteurs et Actionneurs)
CREATE TABLE matos_iot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    type ENUM('capteur', 'actionneur') NOT NULL,
    valeur_actuelle VARCHAR(50) DEFAULT 'OFF'
);

-- Table 5 : Règles Automatiques (Seuils d'Alerte pour Ressources et Plantes)
CREATE TABLE regles_automatiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ressource_vitale_id INT DEFAULT NULL,
    plante_id INT DEFAULT NULL,
    matos_id INT NOT NULL,
    message_alerte VARCHAR(255) NOT NULL,
    niveau_critique ENUM('NORMAL', 'VIGILANCE', 'CRITIQUE') DEFAULT 'VIGILANCE',
    seuil_declenchement DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ressource_vitale_id) REFERENCES ressources_vitales(id) ON DELETE CASCADE,
    FOREIGN KEY (plante_id) REFERENCES plantes(id) ON DELETE CASCADE,
    FOREIGN KEY (matos_id) REFERENCES matos_iot(id) ON DELETE CASCADE
);

-- Table 6 : Historique des mesures des capteurs
CREATE TABLE logs_capteurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matos_id INT NOT NULL,
    valeur_mesuree VARCHAR(50) NOT NULL,
    date_mesure DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matos_id) REFERENCES matos_iot(id) ON DELETE CASCADE
);

-- ========================================================
-- INSERTION DES DONNÉES D'ORIGINE DU PROJET
-- ========================================================

-- Utilisateur principal
INSERT INTO utilisateurs (id, nom, email) VALUES 
(1, 'Astronaute / Membre', 'user@esa.space');

-- 1. Ressources Vitales (Eau, Rations, Sommeil/O2)
INSERT INTO ressources_vitales (id, nom, categorie, quantite_restante, quantite_max, unite, couleur_led_associee) VALUES
(1, 'Eau potable', 'eau', 1435.00, 1800.00, 'L', 'BLEU'),
(2, 'Nutrition / Rations', 'nourriture', 744.00, 1200.00, 'kcal', 'ROUGE'),
(3, 'Sommeil / Réserve O2', 'sommeil', 98.00, 100.00, '%', 'VERT');

-- 2. Plantes (Tomates, Patates, Salade)
INSERT INTO plantes (id, nom, humidite_sol, temperature_ideale, sante_globale, couleur_led_associee) VALUES
(1, 'Tomates', 45.0, 22.0, 'BONNE', 'ROUGE'),
(2, 'Patates', 60.0, 18.0, 'EXCELLENTE', 'ROUGE'),
(3, 'Salade', 80.0, 18.0, 'ATTENTION', 'ROUGE');

-- 3. Matériel IoT
INSERT INTO matos_iot (id, nom, type, valeur_actuelle) VALUES 
(1, 'Capteur Température Serre', 'capteur', '22.5°C'),
(2, 'Capteur Humidité Sol', 'capteur', '45%'),
(3, 'LED Lumière', 'actionneur', 'OFF'),
(4, 'Buzzer Alarme', 'actionneur', 'OFF');

-- 4. Règles Automatiques (Seuils d'alerte)
INSERT INTO regles_automatiques (id, ressource_vitale_id, plante_id, matos_id, message_alerte, niveau_critique, seuil_declenchement) VALUES
(1, 1, NULL, 4, 'Réserve eau potable faible (<200L) !', 'CRITIQUE', 200.00),
(2, NULL, 1, 2, 'Arrosage requis pour les Tomates (<30%)', 'VIGILANCE', 30.00),
(3, NULL, 2, 2, 'Arrosage requis pour les Patates (<25%)', 'VIGILANCE', 25.00),
(4, NULL, 3, 1, 'Température trop élevée pour la Salade (>26°C)', 'CRITIQUE', 26.00);

-- 5. Historique des relevés (Logs)
INSERT INTO logs_capteurs (matos_id, valeur_mesuree) VALUES 
(1, '22.5°C'),
(2, '45%'),
(1, '27.0°C');
