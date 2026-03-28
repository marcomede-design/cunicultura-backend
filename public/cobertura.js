const api = "http://localhost:3001";

// carregar animais
async function carregarAnimais() {
  const res = await fetch(`${api}/animais`);
  const animais = await res.json();

  const matrizSelect = document.getElementById("matriz");
  const machoSelect = document.getElementById("macho");

  matrizSelect.innerHTML = "";
  machoSelect.innerHTML = "";

  animais.forEach(animal => {

    if (animal.sexo === "F" && animal.categoria !== "engorda") {
      const opt = document.createElement("option");
      opt.value = animal.id;
      opt.textContent = animal.brinco;
      matrizSelect.appendChild(opt);
    }

    if (animal.sexo === "M" && animal.categoria !== "engorda") {
      const opt = document.createElement("option");
      opt.value = animal.id;
      opt.textContent = animal.brinco;
      machoSelect.appendChild(opt);
    }

  });
}

// registrar cobertura
document.getElementById("formCobertura")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const matrizId = document.getElementById("matriz").value;
    const machoId = document.getElementById("macho").value;
    const dataCobertura = document.getElementById("dataCobertura").value;

    await fetch(`${api}/coberturas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrizId, machoId, dataCobertura })
    });

    carregarCoberturas();
  });

// listar coberturas
async function carregarCoberturas() {
  const res = await fetch(`${api}/coberturas`);
  const dados = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  dados.forEach(c => {
    const li = document.createElement("li");

    const data = new Date(c.dataCobertura).toLocaleDateString();
    const parto = new Date(c.previsaoParto).toLocaleDateString();

li.textContent = `
  Matriz ID: ${c.matrizId} |
  Macho ID: ${c.machoId} |
      Cobertura: ${data} |
      Parto Previsto: ${parto}
    `;

    lista.appendChild(li);
  });
}

// iniciar
carregarAnimais();
carregarCoberturas();