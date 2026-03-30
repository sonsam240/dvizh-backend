import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let token = null;

// 🔐 Авторизация
async function login() {
  try {
    const res = await fetch("https://dvizh.io/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: process.env.DVIZH_LOGIN,
        password: process.env.DVIZH_PASSWORD
      })
    });

    const data = await res.json();

    if (!data.token) {
      console.error("❌ No token:", data);
      return;
    }

    token = data.token;
    console.log("✅ Token updated");
  } catch (e) {
    console.error("❌ Login error:", e.message);
  }
}

// 📌 Проверка сервера
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// 📌 Получить программы
app.get("/api/programs", async (req, res) => {
  try {
    const response = await fetch("https://dvizh.io/mortgage-programs", {
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

// 📌 КАЛЬКУЛЯТОР (ТО, ЧЕГО У ТЕБЯ НЕ БЫЛО)
app.post("/api/calc", async (req, res) => {
  try {
    const response = await fetch("https://dvizh.io/mortgage/calculate", {
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
    res.status(500).json({ error: "Calc error" });
  }
});

// 📌 Отправка заявки
app.post("/api/apply", async (req, res) => {
  try {
    const response = await fetch("https://dvizh.io/applications", {
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

// 🔁 Обновление токена
setInterval(login, 1000 * 60 * 25);

// 🚀 Старт сервера
app.listen(PORT, async () => {
  console.log(`🔥 Server running on port ${PORT}`);
  await login();
});
