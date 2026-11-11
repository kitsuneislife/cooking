import { useEffect, useState } from "react";
import { getRecipe } from "../services/recipes";

// GET de uma receita com estados de carregamento, sucesso e erro.
export function useRecipe(id) {
  const [state, setState] = useState({ status: "loading", recipe: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", recipe: null, error: null });
    getRecipe(id, controller.signal).then(
      (recipe) => setState({ status: "success", recipe, error: null }),
      (error) => {
        if (error.name !== "AbortError") setState({ status: "error", recipe: null, error });
      },
    );
    return () => controller.abort();
  }, [id, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
