<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

Artisan::command('api:generate', function () {
    $database = DB::connection()->getDatabaseName();

    $tables = collect(Schema::getTables($database))
        ->pluck('name')
        ->reject(fn ($table) => $table === 'migrations')
        ->unique()
        ->values();

    if ($tables->isEmpty()) {
        $this->error('Aucune table trouvee dans la base.');
        return 1;
    }

    $uses = [];
    $routes = [];

    foreach ($tables as $table) {
        $model = Str::studly(Str::singular($table));
        $controller = $model.'Controller';
        $modelClass = 'App\Models\\'.$model;

        $primary = collect(Schema::getIndexes($table))->firstWhere('primary', true);
        $primaryKey = $primary['columns'][0] ?? 'id';

        $columns = Schema::getColumnListing($table);
        $timestamps = in_array('created_at', $columns) && in_array('updated_at', $columns) ? 'true' : 'false';

        File::ensureDirectoryExists(app_path('Models'));
        File::put(app_path("Models/{$model}.php"), <<<PHP
        <?php

        namespace App\Models;

        use Illuminate\Database\Eloquent\Model;

        class {$model} extends Model
        {
            protected \$table = '{$table}';
            protected \$primaryKey = '{$primaryKey}';
            public \$timestamps = {$timestamps};
            protected \$guarded = [];
        }

        PHP);

        File::put(app_path("Http/Controllers/{$controller}.php"), <<<PHP
        <?php

        namespace App\Http\Controllers;

        use {$modelClass};
        use Illuminate\Http\Request;

        class {$controller} extends Controller
        {
            public function index()
            {
                return {$model}::all();
            }

            public function store(Request \$request)
            {
                return response()->json({$model}::create(\$request->all()), 201);
            }

            public function show(\$id)
            {
                return {$model}::findOrFail(\$id);
            }

            public function update(Request \$request, \$id)
            {
                \$item = {$model}::findOrFail(\$id);
                \$item->update(\$request->all());

                return \$item;
            }

            public function destroy(\$id)
            {
                {$model}::findOrFail(\$id)->delete();

                return response()->noContent();
            }
        }

        PHP);

        $uses[] = 'use App\Http\Controllers\\'.$controller.';';
        $routes[] = "Route::apiResource('{$table}', {$controller}::class)->parameters(['{$table}' => 'id']);";

        $this->info("OK : /api/{$table}  ->  {$model} (cle : {$primaryKey})");
    }

    File::put(
        base_path('routes/api.php'),
        "<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n".implode("\n", $uses)."\n\n".implode("\n", $routes)."\n"
    );

    $this->info('Routes ecrites dans routes/api.php');
})->purpose('Genere modeles, controleurs et routes API pour chaque table');