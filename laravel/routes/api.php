<?php

/*
|--------------------------------------------------------------------------
| API Workshop
|--------------------------------------------------------------------------
|
| Base : http://localhost:8000/api
| 3 routes pour toutes les tables de workshop_db. Pas d'authentification.
| POST/PUT : en-tête "Content-Type: application/json".
|
| TABLES : utilisateurs, ressources_vitales, plantes, matos_iot, journee,
|          regles_automatiques, routines_quotidiennes, logs_capteurs
| Clé primaire : "id" partout.
|
| PARAMÈTRES (au choix dans l'URL ou dans le corps JSON) :
|   id      clé primaire        where   filtres {"colonne": valeur}
|   data    colonnes à écrire   page    n° de page (dès 1)
|                               nombre  lignes par page (1-100, défaut 10)
| Les clés non réservées servent de filtres (GET/DELETE) ou de données (POST/PUT).
| Un tableau dans "where" donne un IN. L'id de l'URL prime sur celui du JSON.
|
| ERREURS  {"message": "..."}
|   400  colonne inconnue / page invalide / aucune colonne valide / filtre manquant
|   404  table ou enregistrement introuvable
|   500  ENUM invalide, clé étrangère inexistante, colonne NOT NULL manquante
| Détail : storage/logs/laravel.log
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;

/*
| LIRE   GET /api/{table}/{id?}
|   /api/plantes
|   /api/plantes/1
|       -> {"id":1,"nom":"Tomates","humidite_sol":"45.00","temperature_ideale":"22.0",
|           "sante_globale":"BONNE","couleur_led_associee":"ROUGE"}
|   /api/matos_iot?type=capteur
|   /api/logs_capteurs?matos_id=1&page=1&nombre=20
|   /api/routines_quotidiennes?journee_id=4&actif=1
|   {"where":{"sante_globale":["ATTENTION","CRITIQUE"]}}
| Sans id : tableau (vide : []). En GET, préférer la query string.
*/
Route::get('{table}/{id?}', [ApiController::class, 'lire']);

/*
| ÉCRIRE   POST|PUT|PATCH /api/{table}/{id?}
| Sans id = création (201), avec id = modification (200).
|   POST /api/logs_capteurs   {"matos_id":2,"valeur_mesuree":"38%"}
|   PUT  /api/plantes/1       {"humidite_sol":62.5,"sante_globale":"EXCELLENTE"}
|   PUT  /api/matos_iot/3     {"valeur_actuelle":"ON"}
|   POST /api/plantes         {"id":12,"data":{"humidite_sol":70}}   (= modification)
| Les colonnes inconnues sont ignorées.
*/
Route::match(['post', 'put', 'patch'], '{table}/{id?}', [ApiController::class, 'ecrire']);

/*
| SUPPRIMER   DELETE /api/{table}/{id?}
|   DELETE /api/logs_capteurs/3           -> 204
|   DELETE /api/logs_capteurs   {"where":{"matos_id":1}}  -> {"supprimes":2}
| Sans id ni filtre : 400.
*/
Route::delete('{table}/{id?}', [ApiController::class, 'supprimer']);