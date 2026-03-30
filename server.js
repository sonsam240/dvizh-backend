import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

let token = null;

async function login() {
  try {
    const res = await fetch("https://api.dvizh.io/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: "YOUR_LOGIN",
        password: "YOUR_PASSWORD"
      })
    });

    const data = await res.json();
    token = data.token;
    console.log("Token updated");
  } catch (e) {
    console.error("Login error", e);
  }
}

app.get("/api/programs", async (req, res) => {
  try {
    const response = await fetch("https://api.dvizh.io/mortgage-programs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Error fetching programs" });
  }
});

app.post("/api/apply", async (req, res) => {
  try {
    const response = await fetch("https://api.dvizh.io/applications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Error sending application" });
  }
});

setInterval(login, 1000 * 60 * 30);

app.listen(3000, async () => {
  await login();
  console.log("Server running");
});
