import { SITE, whatsappLink } from "@/lib/site";

/**
 * Casca de página legal. O texto definitivo (termos/privacidade) é fornecido
 * pelo responsável e cadastrado nas Configurações (Fase 4). Aqui fica a
 * estrutura e os pontos que o documento cobre.
 */
export function LegalPage({
  title,
  intro,
  topics,
  content,
}: {
  title: string;
  intro: string;
  topics: string[];
  /** Texto oficial vindo das Configurações; quando presente, substitui o rascunho. */
  content?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
        {title}
      </h1>

      {content && content.trim() ? (
        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-mh-muted">
          {content}
        </div>
      ) : (
        <>
          <p className="mt-4 leading-relaxed text-mh-muted">{intro}</p>
          <h2 className="mt-10 text-lg font-semibold uppercase tracking-wide text-white">
            O que este documento cobre
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-mh-muted">
            {topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 rounded-mh border border-mh-border bg-mh-surface p-6 text-sm text-mh-muted">
        <p>
          Dúvidas sobre seus dados? Fale com a gente pelo e-mail{" "}
          <a href={`mailto:${SITE.email}`} className="text-white hover:underline">
            {SITE.email}
          </a>{" "}
          ou pelo{" "}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}
