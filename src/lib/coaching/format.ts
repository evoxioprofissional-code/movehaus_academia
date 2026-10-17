// Formatação de carga/volume compartilhada entre o modo treino, o painel do
// aluno e a prévia do admin. A carga é texto livre ("20kg", "40", "20 kg",
// "até 50"): extraímos o número para calcular volume e mostrar a unidade uma vez.

export const fmtKg = (value: number) => new Intl.NumberFormat("pt-BR").format(Math.round(value));

export const loadNum = (value: string) => {
  const match = String(value ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
};

/** Valor numérico limpo para pré-preencher o campo de carga (ex.: "20kg" -> "20"). */
export const loadInput = (value: string) => {
  const n = loadNum(value);
  return Number.isFinite(n) ? String(n) : "";
};

/** Rótulo com unidade uma única vez (ex.: "20kg" -> "20 kg"); mantém texto livre se não houver número. */
export const loadLabel = (value: string) => {
  const n = loadNum(value);
  return Number.isFinite(n) ? `${n} kg` : value;
};
