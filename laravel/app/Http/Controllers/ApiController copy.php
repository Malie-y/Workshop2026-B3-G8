<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ApiController extends Controller
{
    // Tables autorisées. Laisse vide [] pour autoriser toutes les tables.
private array $tablesAutorisees = [];

        // GET /api/{table}/page/{numero}/{nombre}
    public function page(Request $request, string $table, int $numero, int $nombre)
    {
        $this->verifierTable($table);
        abort_if($numero < 1 || $nombre < 1 || $nombre > 100, 400, 'Page ou nombre invalide (nombre max : 100)');

        $query = DB::table($table);

        foreach ($request->query() as $colonne => $valeur) {
            $this->verifierColonne($table, $colonne);
            $query->where($colonne, $valeur);
        }

        return $query->forPage($numero, $nombre)->get();
    }


        // GET /api/{table}  (filtres possibles : ?colonne=valeur)
    public function index(Request $request, string $table)
    {
        $this->verifierTable($table);
        $query = DB::table($table);

        foreach ($request->query() as $colonne => $valeur) {
            $this->verifierColonne($table, $colonne);
            $query->where($colonne, $valeur);
        }

        return $query->get();
    }
    // GET /api/{table}/{id}
    public function show(string $table, string $id)
    {
        $this->verifierTable($table);
        $ligne = DB::table($table)->where($this->clePrimaire($table), $id)->first();
        abort_if(! $ligne, 404, 'Enregistrement introuvable');

        return response()->json($ligne);
    }

    // POST /api/{table}
    public function store(Request $request, string $table)
    {
        $this->verifierTable($table);
        $data = $this->filtrerColonnes($table, $request->all());

        $id = DB::table($table)->insertGetId($data);

        return response()->json(
            DB::table($table)->where($this->clePrimaire($table), $id)->first(),
            201
        );
    }

    // PUT /api/{table}/{id}
    public function update(Request $request, string $table, string $id)
    {
        $this->verifierTable($table);
        $cle = $this->clePrimaire($table);
        abort_if(! DB::table($table)->where($cle, $id)->exists(), 404, 'Enregistrement introuvable');

        DB::table($table)->where($cle, $id)->update($this->filtrerColonnes($table, $request->all()));

        return response()->json(DB::table($table)->where($cle, $id)->first());
    }

    // DELETE /api/{table}/{id}
    public function destroy(string $table, string $id)
    {
        $this->verifierTable($table);
        $supprime = DB::table($table)->where($this->clePrimaire($table), $id)->delete();
        abort_if($supprime === 0, 404, 'Enregistrement introuvable');

        return response()->noContent();
    }

    // ---------- Vérifications ----------

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