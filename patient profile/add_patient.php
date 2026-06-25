<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    try {
        $stmt = $pdo->prepare("
            INSERT INTO patients (
                first_name,
                middle_name,
                last_name,
                date_of_birth,
                sex,
                contact_number,
                email,
                complete_address,
                city_municipality,
                zip_code
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $_POST['first_name'] ?? '',
            $_POST['middle_name'] ?? '',
            $_POST['last_name'] ?? '',
            $_POST['date_of_birth'] ?? null,
            strtolower($_POST['sex'] ?? ''),
            $_POST['contact_number'] ?? '',
            $_POST['email'] ?? '',
            $_POST['complete_address'] ?? '',
            $_POST['city_municipality'] ?? '',
            $_POST['zip_code'] ?? ''
        ]);

        echo "<h2>Patient added successfully!</h2>";
        echo "<p>Patient ID: " . $pdo->lastInsertId() . "</p>";
        echo '<a href="index.html">Add Another Patient</a>';

    } catch (PDOException $e) {
        echo "<h2>Database Error</h2>";
        echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    }

} else {
    header("Location: index.html");
    exit();
}
?>