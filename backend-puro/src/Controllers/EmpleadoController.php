<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class EmpleadoController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/empleados
     * Devuelve todos los usuarios que tienen rol 'empleado' haciendo JOIN con bancas
     */
    public function index()
    {
        $sql = "
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone,
                u.role, 
                u.banca_id,
                b.name as banca_name,
                u.created_at 
            FROM users u
            LEFT JOIN bancas b ON u.banca_id = b.id
            WHERE u.role = 'empleado' 
            ORDER BY u.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    /**
     * POST /api/empleados
     */
    public function store()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            $this->jsonResponse(['error' => 'Nombre, correo y contraseña son requeridos'], 400);
        }

        // Verificar si existe el email
        $check = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $check->bindParam(':email', $data['email'], \PDO::PARAM_STR);
        $check->execute();

        if ($check->rowCount() > 0) {
            $this->jsonResponse(['error' => 'El correo electrónico ya está en uso'], 409);
        }

        $stmt = $this->db->prepare("INSERT INTO users (name, email, password, phone, role, banca_id) VALUES (:name, :email, :password, :phone, 'empleado', :banca_id)");

        $hashed = password_hash($data['password'], PASSWORD_BCRYPT);

        $phone = !empty($data['phone']) ? $data['phone'] : null;
        $banca_id = !empty($data['banca_id']) ? $data['banca_id'] : null;

        $stmt->bindParam(':name', $data['name'], \PDO::PARAM_STR);
        $stmt->bindParam(':email', $data['email'], \PDO::PARAM_STR);
        $stmt->bindParam(':password', $hashed, \PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':banca_id', $banca_id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            $data['id'] = $this->db->lastInsertId();
            unset($data['password']);
            $this->jsonResponse(['message' => 'Empleado creado exitosamente', 'empleado' => $data], 201);
        } else {
            $this->jsonResponse(['error' => 'Error al crear el empleado'], 500);
        }
    }

    /**
     * PUT /api/empleados/{id}
     */
    public function update($id)
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['name']) || empty($data['email'])) {
            $this->jsonResponse(['error' => 'Nombre y correo son requeridos'], 400);
        }

        // Verificar si el nuevo email ya existe en otro empleado
        $check = $this->db->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
        $check->bindParam(':email', $data['email'], \PDO::PARAM_STR);
        $check->bindParam(':id', $id, \PDO::PARAM_INT);
        $check->execute();

        if ($check->rowCount() > 0) {
            $this->jsonResponse(['error' => 'El correo electrónico ya está en uso por otro usuario'], 409);
        }

        $phone = !empty($data['phone']) ? $data['phone'] : null;
        $banca_id = !empty($data['banca_id']) ? $data['banca_id'] : null;

        // Si mandaron password nuevo, lo actualizamos también
        if (!empty($data['password'])) {
            $stmt = $this->db->prepare("UPDATE users SET name = :name, email = :email, phone = :phone, banca_id = :banca_id, password = :password WHERE id = :id AND role = 'empleado'");
            $hashed = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt->bindParam(':password', $hashed, \PDO::PARAM_STR);
        } else {
            $stmt = $this->db->prepare("UPDATE users SET name = :name, email = :email, phone = :phone, banca_id = :banca_id WHERE id = :id AND role = 'empleado'");
        }

        $stmt->bindParam(':name', $data['name'], \PDO::PARAM_STR);
        $stmt->bindParam(':email', $data['email'], \PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':banca_id', $banca_id, \PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            unset($data['password']); // No devolver el password
            $this->jsonResponse(['message' => 'Empleado actualizado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al actualizar el empleado'], 500);
        }
    }

    /**
     * DELETE /api/empleados/{id}
     */
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id AND role = 'empleado'");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Empleado eliminado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al eliminar el empleado'], 500);
        }
    }
}
