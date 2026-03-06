<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class BancaController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    public function index()
    {
        $stmt = $this->db->prepare("SELECT * FROM bancas ORDER BY id DESC");
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
            return;
        }
        $stmt = $this->db->prepare("INSERT INTO bancas (name, address, status) VALUES (:name, :address, :status)");
        $stmt->execute([
            ':name' => $data['name'],
            ':address' => $data['address'] ?? null,
            ':status' => $data['status'] ?? 'Activa',
        ]);
        $data['id'] = $this->db->lastInsertId();
        $this->jsonResponse(['message' => 'Banca created', 'banca' => $data], 201);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
            return;
        }
        $stmt = $this->db->prepare("UPDATE bancas SET name = :name, address = :address, status = :status WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':address' => $data['address'] ?? null,
            ':status' => $data['status'] ?? 'Activa',
            ':id' => $id,
        ]);
        $this->jsonResponse(['message' => 'Banca updated']);
    }

    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM bancas WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->jsonResponse(['message' => 'Banca deleted']);
    }
}
