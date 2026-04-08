# FitLife Pass — Auditoria (Fase 1) e roadmap de produção

Documento vivo: reflete o estado do repositório na data da última revisão.  
**Fase 1** = mapeamento com evidência; refactors grandes ficam nas fases seguintes.

---

## 1. Fonte de verdade **atual** por domínio

| Domínio | Fonte de verdade hoje | Evidência (onde) |
|--------|------------------------|------------------|
| **Utilizador / perfil (JWT)** | Express + Mongo, via proxy Next | `web/app/api/user/route.ts` → `BACKEND_API_URL` + `/api/user`; `src/routes/userRoutes.js` |
| **Registo** | Express + Mongo | `web/app/api/register/route.ts` → `/auth/register`; `src/controllers/authController.js` |
| **Créditos (saldo)** | Express + Mongo | `fetchCreditsBalance()` → `/credits/balance`; `src/controllers/creditsController.js` |
| **Reservas (cliente com JWT)** | Express + Mongo | `getApiBookings` → `/api/bookings`; `src/controllers/apiBookingController.js` |
| **Atividades (lista/detalhe)** | Express + Mongo (proxy) | `web/app/api/activities/route.ts`, `[id]/route.ts` |
| **Admin — clientes** | **Híbrido**: preferência Express (`fetchAdminBackend` → `GET /admin/customers`); **fallback** Next+Mongo se `MONGODB_URI` | `web/app/api/admin/customers/list/route.ts`, `metrics/route.ts` |
| **Admin — parceiros** | **Não é Mongo**: `activitiesData` (bundle) + `readReservations` (ficheiro demo) | `web/app/api/admin/partners/list/route.ts` |
| **Admin — reservas** | **Não é Mongo**: `readReservations` / `adminDataServer` | `web/app/api/admin/reservations/list/route.ts` |
| **Admin — finanças** | **Não é Mongo**: `readCustomerState` + `readReservations` + configs | `web/app/api/admin/finance/metrics/route.ts` |
| **Plano / pagamentos (UI)** | Muito **mock** (`mockPayments`) + algum PATCH real | `web/app/dashboard/pagamentos/page.tsx`, `onboarding/plan/page.tsx` |
| **Estado local (UX)** | `localStorage`: `token`, `credits`, `fitlife-user`, chaves unificadas de reservas | `web/lib/storedUser.ts`, `web/lib/walletCredits.ts`, `MockReservationsContext` |

---

## 2. Onde o **frontend cliente** lê dados (mapa)

| Dado | Caminho típico |
|------|----------------|
| Auth | `localStorage.token` + `apiFetch` para `/auth/*`, `/api/user` |
| Perfil | `GET /api/user` (proxy) + `getStoredUser()` para merge UI |
| Créditos | `GET /credits/balance` + espelho `writeWalletCreditsToLocalStorage` / `fitlife-user.credits` |
| Reservas | Com JWT: `getApiBookings` (→ proxy `/api/bookings`). Sem JWT: LS unificado (`unifiedReservations`) |
| Plano | Contexto (`planId`/`planName` de `fetchCurrentUserProfile`) + `getStoredUser().subscriptionPlan*` |
| Parceiros / atividades (público) | `activitiesData.ts` (grande dataset cliente) + chamadas `/api/activities` onde aplicável |
| Histórico API | `web/app/dashboard/reservations/page.tsx` — `getApiBookings` + `getMe` |

---

## 3. Onde o **admin Next** lê dados

| Área | Origem atual |
|------|----------------|
| Clientes | Proxy Express **ou** `getDb()` (Mongo no Next) em fallback |
| Parceiros | `getAllPartnersWithCategory()` + métricas de `readReservations` (demo) |
| Reservas admin | `readReservations()` (ficheiro / demo) |
| Finanças | `readCustomerState` + `readReservations` + `adminFinanceConfig` |

**Problema arquitetural:** parceiros/reservas/finanças do admin **não** refletem a BD real do Express hoje.

---

## 4. Zonas de risco (mocks, demo, Mongo no Next, duplicação)

### 4.1 Mongo direto no Next (dados de negócio)

- `web/lib/db.ts` — `getDb()` + `MONGODB_URI`
- **Uso:** fallback em `web/app/api/admin/customers/list/route.ts` e `metrics/route.ts` após proxy/503

**Objetivo alvo:** remover fallback de negócio no Next; admin cliente só via Express.

### 4.2 localStorage como “quase verdade”

- `fitlife-user`, `credits`, reservas unificadas por chave
- **Mitigado em sessões anteriores** para créditos/reservas reais (espelho + API), mas o modelo mental ainda mistura cache + API

### 4.3 Mocks / demo explícitos

- `web/lib/mockPayments.ts`, `mockRestaurantReservations.ts`, `mockReservations.ts` (tipos + legado)
- `web/lib/activitiesData.ts` — parceiros/atividades estáticos + fallbacks
- `web/lib/adminDataServer.ts` — `demo-reservations.json`, estado cliente ficheiro
- `web/lib/notifications.ts` — mock + LS
- `web/app/dashboard/pagamentos/page.tsx`, `onboarding/plan/page.tsx` — fluxo demo
- `web/app/dashboard/convidar/page.tsx` — `MOCK_*`
- Backoffice parceiro: `web/lib/backoffice.ts` — LS

### 4.4 Duplicação de regras

- Créditos/reserva/cancelamento: **Express** (`apiBookingController`, `bookingCreditService`, `monthlyCreditsService`) é a autoridade; o cliente ainda tem regras UX (12h, 5 min, 2/dia) que devem **alinhar** com o servidor (já em grande parte no backend)

### 4.5 Search global (resumo)

| Padrão | Ocorrências relevantes |
|--------|-------------------------|
| `mock` / `demo` | `mockPayments`, `adminDataServer`, `pagamentos`, `activitiesData`, `notifications`, `convidar`, comentários admin |
| `MONGODB_URI` | `web/lib/db.ts`, admin customers fallback |
| `BACKEND_API_URL` / `NEXT_PUBLIC_API_URL` | proxies `api/*`, `adminBackendProxy` |
| `ADMIN_API_SECRET` | `adminBackendProxy`, Express `adminInternalMiddleware` |
| `fitlife-user` / `getStoredUser` | Nav, EmailAuthCard, perfil, onboarding, contextos |
| `writeWalletCredits` / `readWalletCredits` | `walletCredits.ts`, `MockReservationsContext` |
| `credits \|\|` / `credits ??` | Poucas; crítico foi merge sem campo `credits` (corrigido com `mirrorWalletCreditsAfterAuth`) |
| `DEFAULT_CREDITS` / `INITIAL_CREDITS` | Não encontrados no `web/*.ts(x)` fonte (apenas artefactos `.next`) |

---

## 5. Express — rotas já existentes (amostra)

Montagem em `src/app.js`:

- Auth: `/auth/*` (`auth.routes`)
- Utilizador: `/users`, `/api` (alias), `/user` — `GET/PATCH` perfil, `/users/me`
- Créditos: `/credits/*`
- Atividades desporto: `/api/activities`
- Reservas: `/api/bookings` (apiBookingRoutes)
- Admin interno: `/admin/customers` (+ métricas)
- Parceiros: `/partners` (partnerRoutes)
- Legado: `/activities`, `/bookings` (rotas antigas)

**Não existe ainda** (alvo Fase 4/7) um bloco admin unificado para parceiros/reservas/finanças **só** Express consumido pelo Next admin.

---

## 6. Problemas encontrados + **ordem de correção recomendada**

1. **Admin parceiros / reservas / finanças** — hoje demo/ficheiro; **prioridade alta** criar ou estender rotas Express + proxy Next (sem Mongo no Next).
2. **Remover fallback Mongo** em `admin/customers/*` quando Express+secret estiverem sempre configurados em produção.
3. **Unificar URL backend** no Next: `BACKEND_API_URL` vs `NEXT_PUBLIC_API_URL` (já parcialmente alinhado em `adminBackendProxy`).
4. **Pagamentos / plano** — substituir mock por Stripe/subscrição real ou estados vazios honestos.
5. **Onboarding interesses (Fase 8)** — hoje constantes; ligar a `GET /api/activities` ou categorias reais + `PATCH` perfil.
6. **Renomear mentalmente** `MockReservationsContext` → camada “Reservations/Wallet UI state” (refactor cosmético baixa prioridade se não partir imports).

---

## 7. Causas exatas dos bugs já conhecidos (histórico + código)

| Sintoma | Causa provável no código |
|---------|---------------------------|
| **20 créditos** | Merge `setStoredUser` sem atualizar `credits` quando a API não enviava o campo; LS antigo; OAuth Google só punha `token` |
| **Reservas fake** | LS unificado + migração global; merge API+ginásio/restaurante local (mitigado: JWT só API) |
| **Admin clientes sem carregar** | Next sem `MONGODB_URI` e sem `BACKEND_API_URL`+`ADMIN_API_SECRET` (proxy); mensagens 503 |
| **Reserva sem débito** | Se só existisse lógica cliente; **backend** já debita em transação em `apiBookingController` + `bookingCreditService` |
| **Avatar / nome errado** | Prioridade Nav entre NextAuth vs `fitlife-user`; merge parcial de nome |

---

## 8. Variáveis de ambiente (Fase 10 — rascunho)

### Next (servidor + build)

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_API_URL` | Browser `apiFetch` → API pública |
| `BACKEND_API_URL` | Route Handlers proxy para Express (preferir servidor) |
| `NEXT_PUBLIC_API_URL` | Fallback de base em `adminBackendProxy` se `BACKEND_API_URL` vazio |
| `ADMIN_API_SECRET` | Header `X-Fitlife-Admin-Secret` nos proxies admin (**nunca** expor ao browser) |
| `MONGODB_URI` | **Legado / dev** — alvo: não necessário para negócio em produção |

### Express

| Variável | Uso |
|----------|-----|
| `MONGODB_URI` | Única camada que fala com Mongo em produção-alvo |
| `JWT_SECRET` | Tokens |
| `ADMIN_API_SECRET` | Rotas `/admin/*` internas |
| `CORS_ORIGIN` / `FRONTEND_URL` | CORS |

**Nunca no browser:** `ADMIN_API_SECRET`, `JWT_SECRET`, `MONGODB_URI`.

---

## 9. O que **ainda falta** para produção “pura”

- Modelo financeiro agregável na BD (receita líquida, payout parceiro) além de placeholders em `SportBooking` / transações.
- Endpoints admin Express para parceiros, reservas globais, finanças.
- Remoção completa de `getDb()` para rotas de negócio no Next.
- Testes E2E ou checklist manual formal (Fase 12).

---

## 10. Ficheiros tocados apenas por este documento

- `docs/ARQUITETURA-AUDITORIA-E-ROADMAP.md` (este ficheiro) — **sem alteração de runtime**.

Próximas fases: implementar incrementalmente conforme secções 5–6 do pedido do utilizador, com PRs pequenos por domínio (admin → finanças → mocks → onboarding).
