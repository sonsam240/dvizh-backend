import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

let token = null;

// 🔐 Авторизация в dvizhAPI
async function login() {
  try {
    const res = await fetch("https://api.dvizh.ru/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: "tech-dvizh@dnsgroup.ru",
        password: "!gHN1TDMY?"
      })
    });

    const data = await res.json();

    if (!data.token) {
      console.error("❌ Ошибка логина:", data);
      return;
    }

    token = data.token;
    console.log("✅ Token получен");
  } catch (e) {
    console.error("❌ Login error:", e.message);
  }
}

// 🧮 РАСЧЁТ ИПОТЕКИ (главный endpoint)
app.post("/api/calc", async (req, res) => {
  try {
    if (!token) {
      return res.status(500).json({ error: "Нет токена" });
    }

    const response = await fetch("https://api.dvizh.ru/mortgage/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    res.json({
      success: true,
      data
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
});

// 🔁 обновление токена
setInterval(login, 1000 * 60 * 30);

// 🚀 запуск сервера
app.listen(3000, async () => {
  await login();
  console.log("🚀 Server started on port 3000");
});
