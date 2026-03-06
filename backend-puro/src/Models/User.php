<?php

namespace App\Models;

class User extends Model
{
    protected $table = 'users';

    /**
     * Ejemplo de consulta personalizada
     */
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email, \PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch();
    }
}
