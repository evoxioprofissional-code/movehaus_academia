"use client";

/** Botão de envio que pede confirmação antes (evita toque acidental no celular). */
export function ConfirmButton({ message, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return (
    <button
      {...props}
      className={className}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
