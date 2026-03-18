# Migração: Estado do cliente (JSON → MongoDB)

## O que mudou

- **Antes:** O estado dos clientes (créditos, plano, bloqueio, etc.) era guardado no ficheiro `.data/demo-customer-state.json`, com chave `u:${email}`.
- **Agora:** O estado é guardado na coleção **MongoDB `customers`** (base definida por `MONGODB_DB`, por defeito `fitlife`).

## Schema da coleção `customers`

| Campo        | Tipo     | Descrição                          |
|-------------|----------|------------------------------------|
| `email`     | string   | Email normalizado (único)          |
| `name`      | string?  | Nome do utilizador                 |
| `credits`   | number   | Créditos comprados                 |
| `plan`      | string?  | Nome ou id do plano (resumo)        |
| `planId`    | string?  | Id do plano                        |
| `planName`  | string?  | Nome do plano                      |
| `createdAt` | string   | ISO 8601                           |
| `updatedAt` | string   | ISO 8601                           |
| `country`   | string?  | Opcional                           |
| `city`      | string?  | Opcional                           |
| `phone`     | string?  | Opcional                           |
| `blocked`   | boolean? | Utilizador bloqueado               |
| `deletedAt` | string?  | ISO 8601 se “removido”              |

O índice único em `email` é criado automaticamente na primeira utilização.

## Variáveis de ambiente

- **`MONGODB_URI`** (obrigatório): URI de conexão ao MongoDB (ex.: `mongodb://localhost:27017` ou Atlas).
- **`MONGODB_DB`** (opcional): Nome da base de dados (predefinido: `fitlife`).

## Migrar dados do ficheiro para a DB

Se ainda tens `.data/demo-customer-state.json` com dados que queres manter:

1. Configura `MONGODB_URI` (e opcionalmente `MONGODB_DB`).
2. Usa um script único que:
   - Lê o JSON.
   - Para cada chave `u:${email}`:
     - Garante que o documento existe na coleção `customers` (por exemplo com `ensureCustomer` ou `insertOne` se não existir).
     - Atualiza `credits`, `plan`, `planId`, `planName`, `name`, `country`, `city`, `blocked`, `deletedAt`, `createdAt`/`updatedAt` a partir do objeto guardado no JSON.
3. Depois de validar os dados na DB, podes deixar de usar o ficheiro para estado de clientes.

Os endpoints **não** voltam a ler o ficheiro; toda a lógica de cliente usa apenas a MongoDB.

## APIs inalteradas

- **GET /api/user** — Continua a ser a fonte de verdade para o utilizador autenticado; lê/cria na DB.
- **GET/POST /api/customer/state** — Mesma interface; leitura e escrita passam a ser na DB.
- **Rotas de admin** (lista, bloqueio, créditos, métricas, finance) — Continuam a usar `readCustomerState()` e `updateCustomerState()` em `adminDataServer`, que agora leem/escrevem na MongoDB.

## Consistência

- Um mesmo utilizador (mesmo email) vê sempre os mesmos créditos em todos os dispositivos.
- Utilizadores autenticados **não** usam `localStorage` para créditos; apenas a resposta da API (DB) conta.
