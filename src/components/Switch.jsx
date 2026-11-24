// Pílula com opções de apertar: a escolhida fica rosa. Serve para o idioma, o tema e o que mais
// precisar de "uma coisa ou outra". Cada opção é um botão com `aria-pressed`, então funciona com
// Tab + Enter/Espaço e o leitor de tela anuncia qual está ligada.
// `options`: [{ id, label (o que aparece), name (o nome falado), lang? }]
export default function Switch({ label, value, options, onChange, className = "" }) {
  return (
    <div className={`switch ${className}`.trim()} role="group" aria-label={label}>
      {options.map(({ id, label: shown, name, lang }) => (
        <button key={id} type="button" aria-pressed={value === id} aria-label={name} title={name} lang={lang} onClick={() => onChange(id)}>
          {shown}
        </button>
      ))}
    </div>
  );
}
