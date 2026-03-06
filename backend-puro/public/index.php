<?php

// Front Controller / Enrutador Principal
require_once __DIR__ . '/../src/Middleware/Cors.php';

// Autoload simple (clases App\...)
spl_autoload_register(function ($class) {
    // Prefix App\ points to src/
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';
    $len = strlen($prefix);

    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Middleware\Cors;
use App\Controllers\Controller; // Para que el Autoloader lo registre

// Aplicar CORS a toda ruta
Cors::handle();

// Lógica de enrutamiento básica
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Instanciar controladores según la ruta (Ruteo Básico)
if ($requestUri === '/api/login' && $requestMethod === 'POST') {
    $authController = new \App\Controllers\AuthController();
    $authController->login();
} elseif ($requestUri === '/api/logout' && $requestMethod === 'POST') {
    $authController = new \App\Controllers\AuthController();
    $authController->logout();
} elseif ($requestUri === '/api/me' && $requestMethod === 'GET') {
    $authController = new \App\Controllers\AuthController();
    $authController->me();
} elseif ($requestUri === '/api/settings' && $requestMethod === 'GET') {
    $settingsController = new \App\Controllers\SettingsController();
    $settingsController->index();
} elseif ($requestUri === '/api/settings' && $requestMethod === 'POST') {
    $settingsController = new \App\Controllers\SettingsController();
    $settingsController->update();
} elseif ($requestUri === '/api/bancas' && $requestMethod === 'GET') {
    $bancaController = new \App\Controllers\BancaController();
    $bancaController->index();
} elseif ($requestUri === '/api/bancas' && $requestMethod === 'POST') {
    $bancaController = new \App\Controllers\BancaController();
    $bancaController->store();
} elseif (preg_match('#^/api/bancas/(\d+)$#', $requestUri, $matches)) {
    $bancaController = new \App\Controllers\BancaController();
    if ($requestMethod === 'PUT') {
        $bancaController->update($matches[1]);
    } elseif ($requestMethod === 'DELETE') {
        $bancaController->destroy($matches[1]);
    }
} elseif ($requestUri === '/api/empleados' && $requestMethod === 'GET') {
    $empleadoController = new \App\Controllers\EmpleadoController();
    $empleadoController->index();
} elseif ($requestUri === '/api/empleados' && $requestMethod === 'POST') {
    $empleadoController = new \App\Controllers\EmpleadoController();
    $empleadoController->store();
} elseif (preg_match('#^/api/empleados/(\d+)$#', $requestUri, $matches)) {
    $empleadoController = new \App\Controllers\EmpleadoController();
    if ($requestMethod === 'PUT') {
        $empleadoController->update($matches[1]);
    } elseif ($requestMethod === 'DELETE') {
        $empleadoController->destroy($matches[1]);
    }
} elseif ($requestUri === '/api/operaciones' && $requestMethod === 'GET') {
    $operacionController = new \App\Controllers\OperacionController();
    $operacionController->index();
} elseif ($requestUri === '/api/operaciones' && $requestMethod === 'POST') {
    $operacionController = new \App\Controllers\OperacionController();
    $operacionController->store();
} elseif (preg_match('#^/api/operaciones/(\d+)$#', $requestUri, $matches)) {
    $operacionController = new \App\Controllers\OperacionController();
    if ($requestMethod === 'PUT') {
        $operacionController->update($matches[1]);
    } elseif ($requestMethod === 'DELETE') {
        $operacionController->destroy($matches[1]);
    }
} elseif ($requestUri === '/api/gastos' && $requestMethod === 'GET') {
    $gastoController = new \App\Controllers\GastoController();
    $gastoController->index();
} elseif ($requestUri === '/api/gastos' && $requestMethod === 'POST') {
    $gastoController = new \App\Controllers\GastoController();
    $gastoController->store();
} elseif (preg_match('#^/api/gastos/(\d+)$#', $requestUri, $matches)) {
    $gastoController = new \App\Controllers\GastoController();
    if ($requestMethod === 'PUT') {
        $gastoController->update($matches[1]);
    } elseif ($requestMethod === 'DELETE') {
        $gastoController->destroy($matches[1]);
    }
} elseif ($requestUri === '/api/pagos-nomina' && $requestMethod === 'GET') {
    $nominaController = new \App\Controllers\NominaController();
    $nominaController->index();
} elseif ($requestUri === '/api/pagos-nomina' && $requestMethod === 'POST') {
    $nominaController = new \App\Controllers\NominaController();
    $nominaController->store();
} elseif (preg_match('#^/api/pagos-nomina/(\d+)$#', $requestUri, $matches)) {
    $nominaController = new \App\Controllers\NominaController();
    if ($requestMethod === 'PUT') {
        $nominaController->update($matches[1]);
    } elseif ($requestMethod === 'DELETE') {
        $nominaController->destroy($matches[1]);
    }
} elseif ($requestUri === '/api/dashboard' && $requestMethod === 'GET') {
    $dashboardController = new \App\Controllers\DashboardController();
    $dashboardController->index();
} elseif ($requestUri === '/api/reportes/excel' && $requestMethod === 'GET') {
    $reporteController = new \App\Controllers\ReporteController();
    $reporteController->exportExcel();
} elseif ($requestUri === '/api/settings/logo' && $requestMethod === 'POST') {
    $settingsController = new \App\Controllers\SettingsController();
    $settingsController->uploadLogo();
}

// Ejemplo de ruteo - Ping Endpoint
if ($requestUri === '/api/ping' && $requestMethod === 'GET') {
    http_response_code(200);
    echo json_encode(['message' => 'pong', 'status' => 'ok', 'time' => time()]);
    exit();
}

// Si la ruta no existe o método no permitido
http_response_code(404);
echo json_encode(['error' => 'Not Found', 'path' => $requestUri]);
exit();
