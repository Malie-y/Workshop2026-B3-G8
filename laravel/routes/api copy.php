<?php

/*
|--------------------------------------------------------------------------
| API Workshop – Documentation
|--------------------------------------------------------------------------
|
| URL de base : http://localhost:8000/api
| Un seul contrôleur (ApiController) gère toutes les tables de workshop_db.
| Le nom de la table se met directement dans l'URL. Pas d'authentification.
| Réponses toujours en JSON. Pour POST et PUT : en-tête
| "Content-Type: application/json" + corps JSON.
|
| Exemple utilisé ci-dessous : table "poule", colonnes "lol" (clé primaire) et "tg".
|
| ------------------------- MESSAGES D'ERREUR -----------------------------
| Format : {"message": "..."}
|
| 400  "Colonne 'x' introuvable dans 'table'"      filtre ?x=... sur une colonne inexistante
| 400  "Page ou nombre invalide (nombre max : 100)" page ou nombre < 1, ou nombre > 100
| 400  "Aucune colonne valide envoyée"              corps JSON vide ou sans vraie colonne
| 404  "Table 'x' introuvable"                      table inexistante ou non autorisée
| 404  "Enregistrement introuvable"                 aucune ligne avec cet identifiant
| 404  (message Laravel)                            URL ne correspondant à aucune route
| 500  (message MySQL)                              colonne obligatoire manquante, mauvais type, doublon
|
| Détail des erreurs : laravel/storage/logs/laravel.log
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;

/*
| PAGINATION
| GET /api/{table}/page/{numero}/{nombre}
|   numero : numéro de page (à partir de 1)
|   nombre : lignes par page (1 à 100)
|   filtres possibles : ?colonne=valeur
| Exemples :
|   /api/poule/page/1/10         -> lignes 1 à 10
|   /api/poule/page/2/10         -> lignes 11 à 20
|   /api/poule/page/1/5?tg=160   -> 5 premières lignes où tg = 160
| Réponse 200 : [{"lol":15,"tg":160}]   (page vide : [])
| Erreurs : 400 page/nombre invalide, 400 colonne inconnue, 404 table introuvable
| Doit rester AVANT les autres routes GET.
*/
Route::get('{table}/page/{numero}/{nombre}', [ApiController::class, 'page'])
    ->whereNumber(['numero', 'nombre']);

/*
| LIRE UNE LIGNE
| GET /api/{table}/{id}
|   id : valeur de la clé primaire (détectée automatiquement)
| Exemple : /api/poule/15
| Réponse 200 : {"lol":15,"tg":160}
| Erreurs : 404 table introuvable, 404 enregistrement introuvable
*/
Route::get('{table}/{id}', [ApiController::class, 'show']);

/*
| LISTER UNE TABLE
| GET /api/{table}
|   filtres possibles : ?colonne=valeur (cumulables avec &)
| Exemples :
|   /api/poule                  -> toutes les lignes
|   /api/poule?tg=160           -> lignes où tg = 160
|   /api/poule?lol=15&tg=160    -> lignes où lol = 15 ET tg = 160
| Réponse 200 : [{"lol":15,"tg":160},{"lol":16,"tg":170}]   (table vide : [])
| Erreurs : 400 colonne inconnue, 404 table introuvable
*/
Route::get('{table}', [ApiController::class, 'index']);

/*
| CRÉER UNE LIGNE
| POST /api/{table}
|   corps JSON : les colonnes à remplir (les champs inconnus sont ignorés)
| Exemple : POST /api/poule   corps : {"tg":175}
| Réponse 201 : {"lol":17,"tg":175}
| Erreurs : 400 aucune colonne valide, 404 table introuvable, 500 erreur MySQL
*/
Route::post('{table}', [ApiController::class, 'store']);

/*
| MODIFIER UNE LIGNE
| PUT /api/{table}/{id}
|   corps JSON : seulement les colonnes à changer (les autres restent intactes)
| Exemple : PUT /api/poule/15   corps : {"tg":180}
| Réponse 200 : {"lol":15,"tg":180}
| Erreurs : 400 aucune colonne valide, 404 table ou enregistrement introuvable, 500 erreur MySQL
*/
Route::put('{table}/{id}', [ApiController::class, 'update']);

/*
| SUPPRIMER UNE LIGNE
| DELETE /api/{table}/{id}
| Exemple : DELETE /api/poule/15
| Réponse 204 : vide (suppression définitive)
| Erreurs : 404 table ou enregistrement introuvable
*/
Route::delete('{table}/{id}', [ApiController::class, 'destroy']);