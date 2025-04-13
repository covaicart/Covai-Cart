<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "covai_cart");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get all products
$sql = "SELECT * FROM products";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>COVAI CART</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>COVAI CART</h1>
    <nav>
      <a href="index.php">Home</a>
      <a href="cart.php">Cart</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section class="products">
    <?php
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo '<div class="product-card">';
            echo '<img src="' . $row["image_url"] . '" alt="' . $row["name"] . '">';
            echo '<h2>' . $row["name"] . '</h2>';
            echo '<p>Rs.' . $row["price"] . '</p>';
            echo '<button onclick="addToCart(\'' . $row["name"] . '\', ' . $row["price"] . ')">Add to Cart</button>';
            echo '</div>';
        }
    } else {
        echo "<p>No products available.</p>";
    }
    $conn->close();
    ?>
  </section>

  <script>
    function addToCart(name, price) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push({ name, price });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(name + " added to cart!");
    }
  </script>
</body>
</html>
