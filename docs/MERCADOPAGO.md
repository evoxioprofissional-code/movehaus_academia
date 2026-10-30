# Mercado Pago — checkout integrado

O cliente paga dentro da MoveHaus, com Pix (QR Code e Copia e Cola) ou cartão de crédito à vista. Cada produto mensal é autorizado separadamente no formulário seguro de cartão, com consentimento explícito para recorrência. Não há redirecionamento para o checkout do Mercado Pago.

## Configuração

Na hospedagem: `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` e `NEXT_PUBLIC_SITE_URL` com domínio HTTPS. Só a Public Key é enviada ao navegador; tokens privados ficam no servidor. O Client Secret não é necessário neste fluxo.

No painel Mercado Pago, em Webhooks de produção, informe `https://www.movhausacademia.club/api/mercadopago/webhook` e marque **Pagamentos (legacy)** e **Planos e assinaturas**. O segundo grupo envia `subscription_preapproval` e `subscription_authorized_payment`. A assinatura secreta é diferente do Client Secret.

## Confirmação e acesso

O servidor confere o dono do pedido, usa os valores registrados no banco e ignora valores enviados pelo navegador. O formulário oficial tokeniza o cartão; número e código de segurança não são armazenados. A tabela payments guarda uma reserva única por pedido para impedir envios simultâneos, mais recibos identificados por pagamento. Em caso de resposta perdida, a consulta recupera a tentativa sem gerar outra cobrança.

O webhook valida HMAC, consulta o recurso diretamente na API e confere valor/moeda. O polling autenticado também atualiza o estado. Aprovações liberam os conteúdos digitais avulsos; uma mensalidade só libera/renova acesso após fatura paga. Autorização do cartão não libera acesso por si só. Eventos antigos não encurtam o período pago. Acesso vencido é negado pelo leitor, mesmo sem novo webhook.

Minha área cancela a cobrança primeiro no Mercado Pago e depois atualiza a assinatura local. O período já pago continua disponível até vencer. Uma nova adesão exige confirmar o cancelamento do contrato anterior.

## Validação

Execute `node --test tests/payments.test.mjs`, `npm run lint` e `npm run build`. Os testes usam API e banco simulados, sem cobranças reais. A validação final com cartão/Pix real é feita pelo titular. Pix tem validade de 30 minutos e não constitui autorização de Pix Automático.

## Limites

Cartão à vista; assinaturas mensais no cartão de crédito. Cobrança desconhecida após interrupção pode exigir conferência administrativa antes de outra tentativa. Estornos e chargebacks exigem acompanhamento administrativo; não há revogação automática dos acessos já concedidos. A concessão de acompanhamento personalizado (`coaching_access`) continua com a equipe; esta integração renova `digital_access` dos produtos adquiridos.
