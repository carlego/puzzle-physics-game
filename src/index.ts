import "./styles.css";  
import "./router";

// Check if a name is already stored
let playerName = localStorage.getItem("playerName");

if (!playerName) {
  playerName = prompt("Please enter your name:");
  if (playerName) {
    localStorage.setItem("playerName", playerName);
  }
}

// Create a constant header if it doesn’t exist
let header = document.getElementById("app-header");
if (!header) {
  header = document.createElement("h1");
  header.id = "app-header";
  document.body.prepend(header);
}

// Update the header title
header.textContent = `Welcome, ${playerName}!`;
