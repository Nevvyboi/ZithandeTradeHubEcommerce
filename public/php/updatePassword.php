<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "3306", "", "zithandeTradeHubDatabase");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"];
$newPassword = password_hash($data["newPassword"], PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE zithandeUsers SET password=? WHERE email=?");
$stmt->bind_param("ss", $newPassword, $email);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Password updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update"]);
}

$stmt->close();
$conn->close();
?>
