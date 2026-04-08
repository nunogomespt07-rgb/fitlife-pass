# Modo temporário de integração (`USE_EXISTING_APP_DATA_AS_REAL`)

## Variáveis de ambiente

### Express (API)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `USE_EXISTING_APP_DATA_AS_REAL` | Não | `true` / `1` — aceita `activityId` que não seja ObjectId Mongo; resolve por `appStableKey` ou cria `SportActivity` com `activitySnapshot` + `INTEGRATION_ACTIVITY_CREATOR_USER_ID`. |
| `INTEGRATION_ACTIVITY_CREATOR_USER_ID` | Sim (se modo ativo e primeira reserva de um slot) | ObjectId Mongo de um utilizador existente (ex. admin técnico) usado como `creator` em `SportActivity` criadas ao primeiro booking. |

### Next.js (web)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_USE_EXISTING_APP_DATA_AS_REAL` | Não | `true` / `1` — o cliente envia `activitySnapshot` nas reservas com ids do catálogo (não Mongo) e deixa de bloquear a UI “só identificador servidor”. |

### Admin (proxy Next → Express)

- `BACKEND_API_URL` — URL base do Express (servidor).
- `ADMIN_API_SECRET` — mesmo segredo que o Express (`ADMIN_API_SECRET`).

## Comportamento

- **Produção:** `SportActivity` com `appStableKey` + `partnerClientSlug`; reservas reais com débito de créditos no Mongo.
- **Temporário:** primeira reserva de um slot com id sintético cria o documento Mongo se ainda não existir (chave única `appStableKey`).
- **Permanente:** modelo de dados e rotas admin (`/admin/partners`, `/admin/reservations`) no Express; Next só faz proxy quando configurado.

## Rotas Express admin (header `x-admin-secret`)

- `GET /admin/partners` — parceiros Mongo + slugs derivados de atividades com `partnerClientSlug`.
- `GET /admin/reservations` — lista `SportBooking` com dados de utilizador.
- `GET /admin/reservations/metrics` — métricas agregadas.
