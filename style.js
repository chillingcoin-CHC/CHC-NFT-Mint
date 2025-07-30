/* General Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Body Styling */
body {
  background: linear-gradient(135deg, #0a0f1a, #10131f);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #f0f0f0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

/* Container */
.container {
  background-color: rgba(20, 20, 40, 0.7);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 40px #0ff4;
  max-width: 500px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(8px);
}

/* Logo */
.logo {
  width: 180px;
  display: block;
  margin: 20px auto;
  border-radius: 12px;
}

/* Glow Button */
.glow-button {
  background-color: transparent;
  color: #0ff;
  padding: 12px 20px;
  margin: 10px;
  font-size: 16px;
  border: 2px solid #0ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px #0ff;
  box-shadow: 0 0 12px #0ff6;
}

.glow-button:hover {
  background-color: #0ff;
  color: #000;
  box-shadow: 0 0 20px #0ffb;
}

/* Inputs */
input[type="number"] {
  padding: 10px;
  border-radius: 6px;
  border: none;
  width: 80%;
  margin: 10px 0;
  background: #222;
  color: #0ff;
  font-size: 16px;
}

/* Footer */
footer {
  margin-top: 30px;
  font-size: 14px;
}

footer a {
  color: #0ff;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
