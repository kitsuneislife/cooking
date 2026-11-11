const Star = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`star ${filled ? "star-on" : ""}`} aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
  </svg>
);

// Sem onChange: só mostra as estrelas. Com onChange: vira um grupo de opções.
export default function StarRating({ value, max = 5, onChange, label, name = "rating" }) {
  if (!onChange) {
    return (
      <span className="stars" role="img" aria-label={`${value} de ${max} estrelas`}>
        {Array.from({ length: max }, (_, i) => <Star key={i} filled={i < value} />)}
      </span>
    );
  }
  return (
    <fieldset className="stars stars-input">
      <legend>{label}</legend>
      {Array.from({ length: max }, (_, i) => (
        <label key={i} title={`${i + 1} estrela${i ? "s" : ""}`}>
          <input
            type="radio"
            name={name}
            value={i + 1}
            checked={value === i + 1}
            onChange={() => onChange(i + 1)}
            className="visually-hidden"
          />
          <Star filled={i < value} />
          <span className="visually-hidden">{i + 1} de {max}</span>
        </label>
      ))}
    </fieldset>
  );
}
