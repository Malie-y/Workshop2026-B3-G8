<?php

/*
| CORS : autorise le client React (http://localhost:5173 ou l'IP du PC)
| à appeler l'API depuis le navigateur. Les ESP32 ne sont pas concernés.
*/

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
