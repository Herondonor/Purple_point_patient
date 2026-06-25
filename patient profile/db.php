<?php
$host = 'localhost';
$db   = 'dental_clinic';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected successfully\n";

} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>