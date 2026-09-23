<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ApiController extends Controller
{
    // Tables autorisées. Laisse vide [] pour autoriser toutes les tables.
    private array $tablesAutorisees = [];

    // Clés de pilotage : jamais traitées comme des colonnes
    private const RESERVES = ['id', 'page', 'nombre', 'where', 'data'];

    // ---------- 1. LIRE : GET /api/{table}/{id?} ----------
    public function lire(Request $request, string $table, ?string $id = null)
    {
        $this->verifierTable($table);
        $id ??= $request->input('id');

        // Une seule ligne
        if ($id !== null) {
            $ligne = DB::table($table)->where($this->clePrimaire($table), $id)->first();
            abort_if(! $ligne, 404, 'Enregistrement introuvable');

            return response()->json($ligne);
        }

        // Plusieurs lignes (filtres + pagination éventuels)
        $query = $this->appliquerFiltres(DB::table($table), $table, $request);

        if ($request->has('page') || $request->has('nombre')) {
            $page   = filter_var($request->input('page', 1), FILTER_VALIDATE_INT);
            $nombre = filter_var($request->input('nombre', 10), FILTER_VALIDATE_INT);
            abort_if(
                $page === false || $nombre === false || $page < 1 || $nombre < 1 || $nombre > 100,
                400,
                'Page ou nombre invalide (nombre max : 100)'
            );
            $query->forPage($page, $nombre);
        }

        return response()->json($query->get());
    }

    // ---------- 2. ÉCRIRE : POST|PUT|PATCH /api/{table}/{id?} ----------
    // Sans id -> création (201). Avec id -> modification (200).
    public function ecrire(Request $request, string $table, ?string $id = null)
    {
        $this->verifierTable($table);
        $id ??= $request->input('id');
        $cle = $this->clePrimaire($table);

        $data = $request->input('data')
            ?? collect($request->input())->except(self::RESERVES)->all();
        abort_unless(is_array($data), 400, "'data' doit être un objet JSON");
        $data = $this->filtrerColonnes($table, $data);

        // Modification
        if ($id !== null) {
            abort_if(! DB::table($table)->where($cle, $id)->exists(), 404, 'Enregistrement introuvable');
            DB::table($table)->where($cle, $id)->update($data);

            return response()->json(DB::table($table)->where($cle, $id)->first());
        }

        // Création (gère aussi les clés primaires non auto-incrémentées)
        $nouvelId = DB::table($table)->insertGetId($data);

        return response()->json(
            DB::table($table)->where($cle, $data[$cle] ?? $nouvelId)->first(),
            201
        );
    }

    // ---------- 3. SUPPRIMER : DELETE /api/{table}/{id?} ----------
    // Avec id -> une ligne (204). Sans id -> selon les filtres (obligatoires).
    public function supprimer(Request $request, string $table, ?string $id = null)
    {
        $this->verifierTable($table);
        $id ??= $request->input('id');

        if ($id !== null) {
            $supprime = DB::table($table)->where($this->clePrimaire($table), $id)->delete();
            abort_if($supprime === 0, 404, 'Enregistrement introuvable');

            return response()->noContent();
        }

        $query = $this->appliquerFiltres(DB::table($table), $table, $request);
        abort_if(empty($query->wheres), 400, 'Filtre obligatoire pour supprimer plusieurs lignes');

        return response()->json(['supprimes' => $query->delete()]);
    }

    // ---------- Outils ----------

    private function appliquerFiltres($query, string $table, Request $request)
    {
        $filtres = $request->input('where')
            ?? collect($request->input())->except(self::RESERVES)->all();
        abort_unless(is_array($filtres), 400, "'where' doit être un objet JSON");

        foreach ($filtres as $colonne => $valeur) {
            $this->verifierColonne($table, (string) $colonne);
            is_array($valeur)
                ? $query->whereIn($colonne, $valeur)
                : $query->where($colonne, $valeur);
        }

        return $query;
    }

    private function verifierTable(string $table): void
    {
        $autorisee = empty($this->tablesAutorisees) || in_array($table, $this->tablesAutorisees);
        abort_unless($autorisee && Schema::hasTable($table), 404, "Table '$table' introuvable");
    }

    private function verifierColonne(string $table, string $colonne): void
    {
        abort_unless(Schema::hasColumn($table, $colonne), 400, "Colonne '$colonne' introuvable dans '$table'");
    }

    private function clePrimaire(string $table): string
    {
        $index = collect(Schema::getIndexes($table))->firstWhere('primary', true);

        return $index['columns'][0] ?? 'id';
    }

    private function filtrerColonnes(string $table, array $data): array
    {
        $data = array_intersect_key($data, array_flip(Schema::getColumnListing($table)));
        abort_if(empty($data), 400, 'Aucune colonne valide envoyée');

        return $data;
    }
}