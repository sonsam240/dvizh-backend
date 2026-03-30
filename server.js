import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


const LOGIN = "tech-dvizh@dnsgroup.ru";
const PASSWORD = "!gHN1TDMY?";

let token = null;

// ================= LOGIN =================
async function login() {
  try {
    const res = await fetch("https://api.dvizh.io/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: LOGIN,
        password: PASSWORD
      })
    });

    const data = await res.json();

    if (!data.token) {
      console.error("❌ Login failed:", data);
      return;
    }

    token = data.token;
    console.log("✅ Token updated");

  } catch (e) {
    console.error("❌ Login error:", e);
  }
}

// ================= CHECK TOKEN =================
function checkAuth(req, res, next) {
  if (!token) {
    return res.status(500).json({ error: "No token yet" });
  }
  next();
}

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🚀 dvizh backend работает");
});

// ================= PROGRAMS =================
app.get("/api/programs", checkAuth, async (req, res) => {
  try {
    const response = await fetch("https://api.dvizh.io/mortgage-programs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error fetching programs" });
  }
});

// ================= CALC =================
app.get("/api/calc", checkAuth, async (req, res) => {
  try {
    const { price, initialFee, term } = req.query;

    if (!price || !initialFee || !term) {
      return res.status(400).json({
        error: "Missing params: price, initialFee, term"
      });
    }

    const response = await fetch("https://api.dvizh.io/mortgage/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price: Number(price),
        initialFee: Number(initialFee),
        term: Number(term)
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Calc error" });
  }
});

// ================= APPLY =================
app.post("/api/apply", checkAuth, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: "Error sending application" });
  }
});

// ================= AUTO REFRESH TOKEN =================
setInterval(login, 1000 * 60 * 25); // каждые 25 минут

// ================= START SERVER =================
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await login();
});
