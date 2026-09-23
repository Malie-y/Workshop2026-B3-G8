# =====================================================================
#  Installation automatique : Laravel 13 (API seule, sans auth)
#  + connexion a la base MySQL existante (workshop_db) dans Docker
#  A lancer depuis la racine du projet (la ou se trouve docker-compose.yml)
#  Commande : powershell -ExecutionPolicy Bypass -File .\setup.ps1
# =====================================================================

function Step($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host "ERREUR : $msg" -ForegroundColor Red; exit 1 }

function Write-File($Path, $Content) {
    $full = Join-Path (Get-Location) $Path
    $dir = Split-Path $full
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($full, $Content.Replace("`r`n", "`n"), $utf8)
}

if (!(Test-Path "docker-compose.yml")) {
    Fail "Lance ce script depuis la racine du projet (dossier contenant docker-compose.yml)."
}

# ---------------------------------------------------------------------
Step "1/9 Preparation du dossier laravel"
if (Test-Path "laravel") {
    $r = Read-Host "Le dossier 'laravel' existe deja. Le supprimer et tout refaire ? (o/n)"
    if ($r -ne "o") { exit 0 }
    docker compose rm -sf api 2>$null | Out-Null
    Remove-Item -Recurse -Force "laravel"
}

# ---------------------------------------------------------------------
Step "2/9 Creation du projet Laravel (1 a 3 minutes)"
docker run --rm -v "${PWD}:/app" -w /app composer create-project laravel/laravel laravel
if ($LASTEXITCODE -ne 0) { Fail "La creation du projet Laravel a echoue." }

# ---------------------------------------------------------------------
Step "3/9 Creation du Dockerfile"
Write-File "laravel/Dockerfile" @'
FROM php:8.4-cli

RUN apt-get update && apt-get install -y git unzip libzip-dev \
    && docker-php-ext-install pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

CMD php artisan serve --host=0.0.0.0 --port=8000
'@

# ---------------------------------------------------------------------
Step "4/9 Nettoyage (version API seule)"
Remove-Item -Recurse -Force "laravel/resources/css", "laravel/resources/js" -ErrorAction SilentlyContinue
Remove-Item -Force "laravel/resources/views/welcome.blade.php", "laravel/vite.config.js", "laravel/package.json", "laravel/routes/web.php", "laravel/database/database.sqlite" -ErrorAction SilentlyContinue
Remove-Item -Force "laravel/database/migrations/*" -ErrorAction SilentlyContinue

# ---------------------------------------------------------------------
Step "5/9 Configuration du .env"
$envText = Get-Content "laravel/.env" -Raw
$values = [ordered]@{
    DB_CONNECTION    = "mysql"
    DB_HOST          = "db"
    DB_PORT          = "3306"
    DB_DATABASE      = "workshop_db"
    DB_USERNAME      = "user"
    DB_PASSWORD      = "password"
    SESSION_DRIVER   = "file"
    CACHE_STORE      = "file"
    QUEUE_CONNECTION = "sync"
}
foreach ($k in $values.Keys) {
    $pattern = "(?m)^#?\s*$k=.*$"
    if ($envText -match $pattern) {
        $envText = [regex]::Replace($envText, $pattern, "$k=$($values[$k])")
    } else {
        $envText += "`n$k=$($values[$k])"
    }
}
Write-File "laravel/.env" $envText

# ---------------------------------------------------------------------
Step "6/9 Configuration des routes API et du generateur"
Write-File "laravel/bootstrap/app.php" @'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn () => true);
    })->create();
'@

Write-File "laravel/routes/api.php" @'
<?php

use Illuminate\Support\Facades\Route;
'@

Write-File "laravel/routes/console.php" @'
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
'@

# ---------------------------------------------------------------------
Step "7/9 Mise a jour du docker-compose.yml (sauvegarde : docker-compose.backup.yml)"
Copy-Item "docker-compose.yml" "docker-compose.backup.yml" -Force
Write-File "docker-compose.yml" @'
services:
  web:
    build: ./src
    container_name: workshop_web
    ports:
      - "8080:80"
    volumes:
      - ./src:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    container_name: workshop_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: workshop_db
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: workshop_phpmyadmin
    restart: always
    ports:
      - "8081:80"
    environment:
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: root
    depends_on:
      - db

  api:
    build: ./laravel
    container_name: workshop_api
    volumes:
      - ./laravel:/var/www
    ports:
      - "8000:8000"
    depends_on:
      - db

volumes:
  db_data:
'@

# ---------------------------------------------------------------------
Step "8/9 Demarrage des conteneurs"
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { Fail "docker compose up a echoue." }

Write-Host "Attente de la connexion a la base..."
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
    docker compose exec -T api php artisan db:show 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $ok = $true; break }
    Start-Sleep -Seconds 2
}
if (!$ok) { Fail "Impossible de se connecter a la base. Verifie que le conteneur workshop_db tourne." }

# ---------------------------------------------------------------------
Step "9/9 Generation des modeles, controleurs et routes pour toutes les tables"
docker compose exec -T api php artisan config:clear | Out-Null
docker compose exec -T api php artisan api:generate
if ($LASTEXITCODE -ne 0) { Fail "La generation a echoue." }

docker compose exec -T api php artisan route:list --path=api

Write-Host ""
Write-Host "TERMINE ! Ton API est disponible sur http://localhost:8000/api/..." -ForegroundColor Green
Write-Host "Site : http://localhost:8080   phpMyAdmin : http://localhost:8081"