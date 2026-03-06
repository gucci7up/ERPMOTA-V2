<?php
require_once __DIR__ . '/../src/Config/Database.php';
try {
    $db = \App\Config\Database::getInstance()->getConnection();

    // 1. Ver qué columnas tiene REALMENTE la tabla 'users'
    echo "<h3>Estructura real de la tabla 'users':</h3><pre>";
    $stmt = $db->query("DESCRIBE users");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
    $email = 'admin@motaerp.com';
    $pass = password_hash('Gucci1826', PASSWORD_BCRYPT);
    // 2. Limpiar e Insertar admin con solo lo básico (name, email, password)
    $db->prepare("DELETE FROM users WHERE email = ?")->execute([$email]);

    $ins = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $ins->execute(['Administrador', $email, $pass]);

    echo "<h4>¡Usuario 'admin@motaerp.com' insertado con éxito!</h4>";
    echo "<h4>Contraseña establecida: Gucci1826</h4>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
