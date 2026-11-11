// Acesso à API DummyJSON. Toda requisição do app passa por aqui.
const BASE_URL = "https://dummyjson.com/recipes";

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, options);
  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status}.`);
  }
  return response.json();
}

export function getRecipe(id, signal) {
  return request(`/${id}`, { signal });
}

// A API simula a gravação: devolve a receita com a nota nova, mas não salva.
export function rateRecipe(id, rating) {
  return request(`/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
}
