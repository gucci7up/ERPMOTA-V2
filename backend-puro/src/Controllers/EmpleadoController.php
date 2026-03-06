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

    // GET /api/empleados
    public function index()
    {
        $stmt = $this->db->prepare("
            SELECT e.*, b.name as banca_name
            FROM empleados e
            LEFT JOIN bancas b ON e.banca_id = b.id
            ORDER BY e.id DESC
        ");
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    // POST /api/empleados
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
            return;
        }
        $stmt = $this->db->prepare("INSERT INTO empleados (name, role, email, phone, salary, status, banca_id) VALUES (:name, :role, :email, :phone, :salary, :status, :banca_id)");
        $stmt->execute([
            ':name' => $data['name'],
            ':role' => $data['role'] ?? null,
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':salary' => $data['salary'] ?? 0,
            ':status' => $data['status'] ?? 'Activo',
            ':banca_id' => $data['banca_id'] ?? null,
        ]);
        $data['id'] = $this->db->lastInsertId();
        $this->jsonResponse(['message' => 'Empleado creado', 'empleado' => $data], 201);
    }

    // PUT /api/empleados/{id}
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
            return;
        }
        $stmt = $this->db->prepare("UPDATE empleados SET name = :name, role = :role, email = :email, phone = :phone, salary = :salary, status = :status, banca_id = :banca_id WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':role' => $data['role'] ?? null,
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':salary' => $data['salary'] ?? 0,
            ':status' => $data['status'] ?? 'Activo',
            ':banca_id' => $data['banca_id'] ?? null,
            ':id' => $id,
        ]);
        $this->jsonResponse(['message' => 'Empleado actualizado']);
    }

    // DELETE /api/empleados/{id}
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM empleados WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->jsonResponse(['message' => 'Empleado eliminado']);
    }
}
