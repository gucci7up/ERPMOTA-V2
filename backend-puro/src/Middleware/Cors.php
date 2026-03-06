<?php

namespace App\Middleware;

class Cors
{
    public static function handle()
    {
        // Configurar la cookie de sesión ANTES de session_start()
        // SameSite=None + Secure es OBLIGATORIO para cookies cross-domain con credenciales
        ini_set('session.cookie_samesite', 'None');
        ini_set('session.cookie_secure', '1');
        ini_set('session.cookie_httponly', '1');

        // Headers CORS
        header("Access-Control-Allow-Origin: https://motaerp.salamihost.lat");
        header("Access-Control-Allow-Credentials: true");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        // Manejar preflight OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
