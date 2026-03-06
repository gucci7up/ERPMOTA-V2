<?php

namespace App\Controllers;

use App\Models\User;
use App\Middleware\Auth;

class AuthController extends Controller
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function login()
    {
        // Leer el payload JSON de la petición
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['email']) || !isset($data['password'])) {
            $this->jsonResponse(['error' => 'Email and password are required'], 400);
        }

        $user = $this->userModel->findByEmail($data['email']);

        // Verificación básica de contraseña (asumiendo que están hasheadas con bcrypt)
        // Por seguridad, usar password_verify($data['password'], $user['password'])
        if ($user && password_verify($data['password'], $user['password'])) {
            Auth::login($user['id']);

            // Eliminar la contraseña del array de respuesta
            unset($user['password']);

            $this->jsonResponse([
                'message' => 'Login successful',
                'user' => $user
            ]);
        }

        $this->jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    public function logout()
    {
        Auth::logout();
        $this->jsonResponse(['message' => 'Logged out successfully']);
    }

    public function me()
    {
        // Este endpoint idealmente debe estar protegido por Auth::check() antes de llamarlo
        Auth::check();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'];
        $user = $this->userModel->findById($userId);

        if ($user) {
            unset($user['password']);
            $this->jsonResponse($user); // The user expects just the direct JSON object
        }

        $this->jsonResponse(['error' => 'User not found'], 404);
    }
}
