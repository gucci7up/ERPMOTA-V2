<?php

namespace App\Controllers;

abstract class Controller
{
    /**
     * Devuelve una respuesta JSON estandarizada y finaliza la ejecución.
     */
    protected function jsonResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
