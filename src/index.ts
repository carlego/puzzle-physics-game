import "./styles.css";  
import "./router";
import 'skeleton-framework/src/skeleton.css';

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
  header = document.createElement("h4");
  header.id = "app-header";
  document.body.prepend(header);
  // When clicked, prompt to change the name
  header.onclick = () => {
    const newName = prompt("Enter your name:");
    if (newName && newName.trim()) {
      playerName = newName.trim();
      localStorage.setItem("playerName", playerName);
      header!.textContent = `Welcome, ${playerName}!`;
    }
  };
}

// Update the header title
header.textContent = `Welcome, ${playerName}!`;
