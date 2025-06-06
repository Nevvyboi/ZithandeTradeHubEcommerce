<?php
// Connect to MySQL (re-use your existing dbConnect.php)
include 'dbConnect.php';

// Grab form data
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];

// Insert into DB (create a simple contact_messages table)
$sql = "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $name, $email, $message);

if ($stmt->execute()) {
    echo "Message received!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
