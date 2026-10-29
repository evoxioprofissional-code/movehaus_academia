# Mercado Pago

As quatro credenciais ficam no `.env.local`, ignorado pelo Git. Configure-as também no ambiente de hospedagem antes de publicar. O Checkout Pro usa o Access Token no servidor; não precisa enviar Client Secret ao navegador.

Para habilitar o botão de pagamento:

1. Configure `NEXT_PUBLIC_SITE_URL` com o domínio público HTTPS.
2. Em Suas integrações > Webhooks no Mercado Pago, configure o evento de pagamentos para `https://SEU-DOMINIO/api/mercadopago/webhook`.
3. Copie a assinatura secreta dessa tela para `MERCADOPAGO_WEBHOOK_SECRET`. Ela é diferente do Client Secret.
4. Publique e valide uma compra controlada, conferindo a confirmação em pedidos e pagamentos.

Sem URL HTTPS ou assinatura, o checkout mantém o atendimento pelo WhatsApp. Carrinhos com mensalidades também seguem pelo atendimento: cobranças recorrentes ainda não foram implementadas.

O webhook valida a assinatura, consulta o pagamento diretamente na API e confere moeda e total antes de aprovar o pedido. O retorno do navegador não aprova pagamentos. Notificações de aprovação repetidas usam o mesmo identificador na tabela de pagamentos.

Limites: estornos, chargebacks, cancelamentos e liberação automática de conteúdos não são processados por esta integração. Exigem acompanhamento administrativo. Links de pagamento podem ser gerados novamente ao repetir o pedido; confirme pagamentos duplicados no painel do provedor.
