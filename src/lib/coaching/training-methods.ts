/**
 * Métodos de treino disponíveis para o professor marcar em cada exercício.
 * `group` indica quantos exercícios o método encadeia (0 = técnica dentro da
 * própria série). `desc` é a explicação curta mostrada ao aluno.
 */
export type TrainingMethod =
  | "normal"
  | "biset"
  | "triset"
  | "superset"
  | "dropset"
  | "rest_pause"
  | "piramide";

export type MethodInfo = {
  value: TrainingMethod;
  label: string;
  short: string;
  desc: string;
  group: number;
};

export const TRAINING_METHODS: Record<TrainingMethod, MethodInfo> = {
  normal: { value: "normal", label: "Normal", short: "", desc: "", group: 0 },
  biset: {
    value: "biset",
    label: "Bi-set",
    short: "Bi-set",
    desc: "Dois exercícios emendados, sem descanso entre eles. Descanse só ao terminar os dois.",
    group: 2,
  },
  triset: {
    value: "triset",
    label: "Tri-set",
    short: "Tri-set",
    desc: "Três exercícios em sequência, sem descanso entre eles. Descanse só ao terminar os três.",
    group: 3,
  },
  superset: {
    value: "superset",
    label: "Super-set",
    short: "Super-set",
    desc: "Dois exercícios de músculos opostos, um logo após o outro, sem descanso no meio.",
    group: 2,
  },
  dropset: {
    value: "dropset",
    label: "Drop-set",
    short: "Drop-set",
    desc: "Na última série, ao chegar perto da falha, reduza a carga e continue sem descanso.",
    group: 0,
  },
  rest_pause: {
    value: "rest_pause",
    label: "Rest-pause",
    short: "Rest-pause",
    desc: "Vá até perto da falha, descanse 10 a 15 segundos e continue. Repita dentro da mesma série.",
    group: 0,
  },
  piramide: {
    value: "piramide",
    label: "Pirâmide",
    short: "Pirâmide",
    desc: "A cada série, aumente a carga e reduza as repetições (ou o contrário, se o professor indicar).",
    group: 0,
  },
};

/** Lista para montar <select> no admin (mantém a ordem desejada). */
export const METHOD_OPTIONS: MethodInfo[] = [
  TRAINING_METHODS.normal,
  TRAINING_METHODS.biset,
  TRAINING_METHODS.triset,
  TRAINING_METHODS.superset,
  TRAINING_METHODS.dropset,
  TRAINING_METHODS.rest_pause,
  TRAINING_METHODS.piramide,
];

export function methodInfo(value: string | null | undefined): MethodInfo {
  return TRAINING_METHODS[(value as TrainingMethod) ?? "normal"] ?? TRAINING_METHODS.normal;
}

/** True se o método encadeia vários exercícios (bi/tri/super-set). */
export function isGroupMethod(value: string | null | undefined): boolean {
  return methodInfo(value).group >= 2;
}
