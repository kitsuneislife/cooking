import { useEffect, useState } from "react";
import { getRecipe, getRecipes } from "../services/recipes";

// GET com estados de carregamento, sucesso e erro; `load` recebe o sinal para cancelar.
function useRequest(load, key) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });
    load(controller.signal).then(
      (data) => setState({ status: "success", data, error: null }),
      (error) => {
        if (error.name !== "AbortError") setState({ status: "error", data: null, error });
      },
    );
    return () => controller.abort();
    // `load` muda a cada render; quem chama passa em `key` o que importa
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

// Uma receita pelo id.
export function useRecipe(id) {
  const { data, ...rest } = useRequest((signal) => getRecipe(id, signal), id);
  return { ...rest, recipe: data };
}

// Todas as receitas da API (para o catálogo).
export function useRecipes() {
  const { data, ...rest } = useRequest(getRecipes, "all");
  return { ...rest, recipes: data };
}
