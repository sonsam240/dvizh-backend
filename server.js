const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================== ТВОИ ДАННЫЕ ==================
const LOGIN = "tech-dvizh@dnsgroup.ru";
const PASSWORD = "!gHN1TDMY?";
// ================================================

let token = null;

// ================= LOGIN =================
async function login() {
  try {
    console.log("🔐 Логин...");

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

    if (data.token) {
      token = data.token;
      console.log("✅ Токен получен");
    } else {
      console.error("❌ Нет токена:", data);
    }

  } catch (e) {
    console.error("❌ Ошибка логина:", e.message);
  }
}

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🚀 backend alive");
});

// ================= TEST =================
app.get("/test", (req, res) => {
  res.json({
    status: "ok",
    token: !!token
  });
});

// ================= PROGRAMS =================
app.get("/api/programs", async (req, res) => {
  try {
    if (!token) {
      return res.json({ error: "Нет токена" });
    }

    const response = await fetch("https://api.dvizh.io/mortgage-programs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (e) {
    console.error("Programs error:", e.message);
    res.json({ error: "Programs error" });
  }
});

// ================= CALC =================
app.get("/api/calc", async (req, res) => {
  try {
    if (!token) {
      return res.json({ error: "Нет токена" });
    }

    const { price, initialFee, term } = req.query;

    if (!price || !initialFee || !term) {
      return res.json({
        error: "Нужны параметры: price, initialFee, term"
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
    console.error("Calc error:", e.message);
    res.json({ error: "Calc error" });
  }
});

// ================= APPLY =================
app.post("/api/apply", async (req, res) => {
  try {
    if (!token) {
      return res.json({ error: "Нет токена" });
    }

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
    console.error("Apply error:", e.message);
    res.json({ error: "Apply error" });
  }
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server started on ${PORT}`);

  login();
  setInterval(login, 1000 * 60 * 25);
});
