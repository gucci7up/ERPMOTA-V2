<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class GastoController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    // GET /api/gastos
    public function index()
    {
        $stmt = $this->db->prepare("
            SELECT g.*, b.name as banca_name
            FROM gastos g
            LEFT JOIN bancas b ON g.banca_id = b.id
            ORDER BY g.expense_date DESC
        ");
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    // POST /api/gastos
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['description']) || empty($data['amount'])) {
            $this->jsonResponse(['error' => 'description y amount son requeridos'], 400);
            return;
        }
        $stmt = $this->db->prepare("INSERT INTO gastos (description, category, amount, expense_date, banca_id) VALUES (:description, :category, :amount, :expense_date, :banca_id)");
        $stmt->execute([
            ':description' => $data['description'],
            ':category' => $data['category'] ?? 'Operativo',
            ':amount' => $data['amount'],
            ':expense_date' => $data['expense_date'] ?? date('Y-m-d'),
            ':banca_id' => $data['banca_id'] ?? null,
        ]);
        $data['id'] = $this->db->lastInsertId();
        $this->jsonResponse(['message' => 'Gasto registrado', 'gasto' => $data], 201);
    }

    // PUT /api/gastos/{id}
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("UPDATE gastos SET description = :description, category = :category, amount = :amount, expense_date = :expense_date, banca_id = :banca_id WHERE id = :id");
        $stmt->execute([
            ':description' => $data['description'],
            ':category' => $data['category'] ?? 'Operativo',
            ':amount' => $data['amount'],
            ':expense_date' => $data['expense_date'] ?? date('Y-m-d'),
            ':banca_id' => $data['banca_id'] ?? null,
            ':id' => $id,
        ]);
        $this->jsonResponse(['message' => 'Gasto actualizado']);
    }

    // DELETE /api/gastos/{id}
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM gastos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->jsonResponse(['message' => 'Gasto eliminado']);
    }
}
