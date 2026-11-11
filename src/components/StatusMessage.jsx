// Mensagem de carregando, sucesso ou erro. Erros têm botão de tentar de novo.
export default function StatusMessage({ status, children, onRetry }) {
  const isError = status === "error";
  return (
    <div className={`status status-${status}`} role={isError ? "alert" : "status"}>
      {status === "loading" && <span className="spinner" aria-hidden="true" />}
      <span>{children}</span>
      {isError && onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}
