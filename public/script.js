const API = "https://cunicultura-api.onrender.com"; // sua API

async function registrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, senha }),
  });

  const data = await res.json();

  document.getElementById("status").innerText =
    data.erro || "Usuário cadastrado com sucesso!";
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    document.getElementById("status").innerText = "Login realizado!";
  } else {
    document.getElementById("status").innerText = data.erro;
  }
}