const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================== ВСТАВЬ СВОИ ДАННЫЕ ==================
const LOGIN = "tech-dvizh@dnsgroup.ru";
const PASSWORD = "!gHN1TDMY?";

// ========================================================

let token = null;

// ================= LOGIN =================
async function login() {
  try {
    console.log("🔐 Авторизация...");

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
      console.error("❌ Ошибка логина:", data);
      return;
    }

    token = data.token;
    console.log("✅ Токен получен");

  } catch (e) {
    console.error("❌ Login error:", e);
  }
}

// ================= ПРОВЕРКА ТОКЕНА =================
function checkAuth(req, res, next) {
  if (!token) {
    return res.status(500).json({ error: "Нет токена (сервер только запустился)" });
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
    console.error("Programs error:", e);
    res.status(500).json({ error: "Error fetching programs" });
  }
});

// ================= CALC =================
app.get("/api/calc", checkAuth, async (req, res) => {
  try {
    const { price, initialFee, term } = req.query;

    if (!price || !initialFee || !term) {
      return res.status(400).json({
        error: "Нужны параметры: price, initialFee, term"
      });
    }

    console.log("📊 Запрос расчета:", price, initialFee, term);

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
    console.error("Calc error:", e);
    res.status(500).json({ error: "Calc error" });
  }
});

// ================= APPLY =================
app.post("/api/apply", checkAuth, async (req, res) => {
  try {
    console.log("📨 Отправка заявки:", req.body);

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
    console.error("Apply error:", e);
    res.status(500).json({ error: "Error sending application" });
  }
});

// ================= АВТО ОБНОВЛЕНИЕ ТОКЕНА =================
setInterval(login, 1000 * 60 * 25); // каждые 25 минут

// ================= СТАРТ =================
app.listen(PORT, async () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  await login();
});
