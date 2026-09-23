-- Désactivation temporaire des clés étrangères pour réinitialiser la base
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Suppression de toutes les anciennes tables 
DROP VIEW IF EXISTS journee;
DROP TABLE IF EXISTS logs_capteurs;
DROP TABLE IF EXISTS routines_quotidiennes;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS regles_automatiques;
DROP TABLE IF EXISTS matos_iot;
DROP TABLE IF EXISTS ressources;
DROP TABLE IF EXISTS ressources_vitales;
DROP TABLE IF EXISTS plantes;
DROP TABLE IF EXISTS objets_suivis;
DROP TABLE IF EXISTS journee;
DROP TABLE IF EXISTS utilisateurs;

-- Réactivation des clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Ressources Vitales (Gestion Eau, Nourriture)
CREATE TABLE ressources_vitales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    categorie ENUM('eau', 'nourriture') NOT NULL,
    quantite_restante DECIMAL(10,2) NOT NULL DEFAULT 100.0,
    quantite_max DECIMAL(10,2) NOT NULL DEFAULT 100.0,
    unite VARCHAR(20) NOT NULL,
    couleur_led_associee VARCHAR(20) DEFAULT 'BLEU'
);

-- Plantes de la serre (Suivi des légumes)
CREATE TABLE plantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    humidite_sol DECIMAL(5,2) DEFAULT 50.0,
    temperature_ideale DECIMAL(4,1) DEFAULT 22.0,
    sante_globale ENUM('EXCELLENTE', 'BONNE', 'ATTENTION', 'CRITIQUE') DEFAULT 'BONNE',
    couleur_led_associee VARCHAR(20) DEFAULT 'ROUGE'
);

-- Matériel IoT (Capteurs et Actionneurs)
CREATE TABLE matos_iot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    type ENUM('capteur', 'actionneur') NOT NULL,
    valeur_actuelle VARCHAR(50) DEFAULT 'OFF'
);

-- Journee (Periodes de la journee pour les routines)
CREATE TABLE journee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

-- Regles Automatiques (Seuils d'Alerte pour Ressources et Plantes)
CREATE TABLE regles_automatiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ressource_vitale_id INT DEFAULT NULL,
    plante_id INT DEFAULT NULL,
    matos_id INT NOT NULL,
    message_alerte VARCHAR(255) NOT NULL,
    niveau_critique ENUM('NORMAL', 'VIGILANCE', 'CRITIQUE') DEFAULT 'VIGILANCE',
    seuil_declenchement DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ressource_vitale_id) REFERENCES ressources_vitales(id) ON DELETE CASCADE,
    FOREIGN KEY (plante_id) REFERENCES plantes(id) ON DELETE SET NULL,
    FOREIGN KEY (matos_id) REFERENCES matos_iot(id) ON DELETE CASCADE
);

-- Routines Quotidiennes (Actions programmees selon la periode)
CREATE TABLE routines_quotidiennes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journee_id INT NOT NULL,
    matos_id INT DEFAULT NULL,
    plante_id INT DEFAULT NULL,
    ressource_vitale_id INT DEFAULT NULL,
    heure_precise TIME DEFAULT NULL,
    description VARCHAR(255) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (journee_id) REFERENCES journee(id) ON DELETE CASCADE,
    FOREIGN KEY (matos_id) REFERENCES matos_iot(id) ON DELETE CASCADE,
    FOREIGN KEY (plante_id) REFERENCES plantes(id) ON DELETE SET NULL,
    FOREIGN KEY (ressource_vitale_id) REFERENCES ressources_vitales(id) ON DELETE CASCADE
);

-- Historique des mesures des capteurs
CREATE TABLE logs_capteurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matos_id INT NOT NULL,
    valeur_mesuree VARCHAR(50) NOT NULL,
    date_mesure DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matos_id) REFERENCES matos_iot(id) ON DELETE CASCADE
);

-- Ressources Vitales (Eau, Rations)
INSERT INTO ressources_vitales (id, nom, categorie, quantite_restante, quantite_max, unite, couleur_led_associee) VALUES
(1, 'Eau potable', 'eau', 1435.00, 1800.00, 'L', 'BLEU'),
(2, 'Nutrition / Rations', 'nourriture', 744.00, 1200.00, 'kcal', 'VERT');

-- Plantes (Tomates, Patates, Salade)
INSERT INTO plantes (id, nom, humidite_sol, temperature_ideale, sante_globale, couleur_led_associee) VALUES
(1, 'Tomates', 45.0, 22.0, 'BONNE', 'ROUGE'),
(2, 'Patates', 60.0, 18.0, 'EXCELLENTE', 'ROUGE'),
(3, 'Salade', 80.0, 18.0, 'ATTENTION', 'ROUGE');

-- Materiel IoT
INSERT INTO matos_iot (id, nom, type, valeur_actuelle) VALUES 
(1, 'Capteur Temperature Serre', 'capteur', '22.5C'),
(2, 'Capteur Humidite Sol', 'capteur', '45%'),
(3, 'LED Lumiere', 'actionneur', 'OFF'),
(4, 'Buzzer Alarme', 'actionneur', 'OFF');

-- Journee (Periodes de la journee)
INSERT INTO journee (id, libelle) VALUES
(1, 'Matinee'),
(2, 'Midi'),
(3, 'Soir'),
(4, 'Heure precise');

-- Regles Automatiques (Seuils d'alerte)
INSERT INTO regles_automatiques (id, ressource_vitale_id, plante_id, matos_id, message_alerte, niveau_critique, seuil_declenchement) VALUES
(1, 1, NULL, 4, 'Reserve eau potable faible (<200L) !', 'CRITIQUE', 200.00),
(2, NULL, 1, 2, 'Arrosage requis pour les Tomates (<30%)', 'VIGILANCE', 30.00),
(3, NULL, 2, 2, 'Arrosage requis pour les Patates (<25%)', 'VIGILANCE', 25.00),
(4, NULL, 3, 1, 'Temperature trop elevee pour la Salade (>26C)', 'CRITIQUE', 26.00);

-- Routines Quotidiennes (planning heures fixes reveil/repas/hydratation/sommeil)
-- Toutes rattachees a journee_id = 4 (Heure precise) et matos_id = 3 (LED Lumiere)
INSERT INTO routines_quotidiennes (journee_id, matos_id, plante_id, ressource_vitale_id, heure_precise, description, actif) VALUES
(1, 2, 1, NULL, NULL, '(routine capteur, hors planning horaire)', TRUE),
(4, 3, NULL, NULL, '07:00:00', 'Reveil - LED rouge (sommeil)', TRUE),
(4, 3, NULL, 2, '07:30:00', 'Manger - LED verte (nourriture)', TRUE),
(4, 3, NULL, 1, '10:30:00', 'Boire - LED bleue (eau)', TRUE),
(4, 3, NULL, 2, '12:00:00', 'Manger - LED verte (nourriture)', TRUE),
(4, 3, NULL, 1, '15:00:00', 'Boire - LED bleue (eau)', TRUE),
(4, 3, NULL, 2, '16:00:00', 'Manger - LED verte (nourriture)', TRUE),
(4, 3, NULL, 1, '18:30:00', 'Boire - LED bleue (eau)', TRUE),
(4, 3, NULL, 2, '19:00:00', 'Manger - LED verte (nourriture)', TRUE),
(4, 3, NULL, 1, '22:00:00', 'Boire - LED bleue (eau)', TRUE),
(4, 3, NULL, NULL, '23:00:00', 'Dormir - LED rouge (sommeil)', TRUE);

-- Historique des releves (Logs)
INSERT INTO logs_capteurs (matos_id, valeur_mesuree) VALUES 
(1, '22.5C'),
(2, '45%'),
(1, '27.0C');

