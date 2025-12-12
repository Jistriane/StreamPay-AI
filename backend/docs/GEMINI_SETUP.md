# 🔑 Como Obter e Configurar a API Key do Google Gemini

## Status Atual
⚠️ A API key fornecida está **inválida**. Siga os passos abaixo para obter uma chave válida.

## Passos para Obter a API Key

### 1. Acesse o Google AI Studio
Visite: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 2. Faça Login
- Use sua conta Google
- Aceite os termos de serviço se solicitado

### 3. Crie uma Nova API Key
1. Clique em **"Create API Key"** ou **"Get API key"**
2. Selecione um projeto do Google Cloud (ou crie um novo)
3. Copie a chave gerada (formato: `AIzaSy...`)

### 4. Configure no Projeto

#### Backend
Edite o arquivo `/backend/.env`:
```env
GEMINI_API_KEY=SUA_CHAVE_AQUI
```

#### Teste a Configuração
```bash
cd backend
npx ts-node tests/gemini.test.ts
```

## Verificação da API Key

### Método 1: Via Terminal
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_CHAVE_AQUI"
```

**Resposta esperada:** JSON com conteúdo gerado
**Erro esperado:** 400 Bad Request se a chave for inválida

### Método 2: Via Node.js
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("SUA_CHAVE_AQUI");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

model.generateContent("Hello")
  .then(result => console.log("✅ API Key válida!"))
  .catch(error => console.error("❌ API Key inválida:", error.message));
```

## Problemas Comuns

### ❌ "API Key not found"
**Causa:** A chave não está configurada ou está vazia
**Solução:** 
- Verifique se o arquivo `.env` existe em `/backend`
- Confirme que a variável `GEMINI_API_KEY` está definida
- Reinicie o servidor após editar o `.env`

### ❌ "API Key invalid"
**Causa:** A chave está incorreta ou expirada
**Solução:**
- Gere uma nova chave no Google AI Studio
- Verifique se copiou a chave completa (sem espaços)
- Confirme que a chave não foi revogada no console

### ❌ "Quota exceeded"
**Causa:** Você atingiu o limite gratuito da API
**Solução:**
- Aguarde a renovação do quota (geralmente diária)
- Upgrade para plano pago no Google Cloud
- Otimize as requisições (use cache)

### ❌ "Service not enabled"
**Causa:** A API Gemini não está ativada no projeto
**Solução:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Navegue para "APIs & Services" > "Library"
3. Procure por "Generative Language API"
4. Clique em "Enable"

## Limites e Quotas

### Plano Gratuito
- **Requisições por minuto:** 60
- **Requisições por dia:** 1,500
- **Tokens por requisição:** 32,000 (input + output)

### Plano Pago
- Limites mais altos (verificar documentação)
- Pay-as-you-go
- Suporte prioritário

## Segurança

### ✅ Boas Práticas
- ✓ Nunca commit a chave no Git
- ✓ Use variáveis de ambiente (`.env`)
- ✓ Adicione `.env` ao `.gitignore`
- ✓ Rotacione as chaves periodicamente
- ✓ Use keys diferentes para dev/prod

### ❌ Evite
- ✗ Compartilhar a chave publicamente
- ✗ Expor a chave no frontend
- ✗ Hardcode em arquivos de código
- ✗ Usar a mesma chave em múltiplos projetos

## Alternativas (Caso Tenha Problemas)

### 1. OpenAI GPT
```bash
npm install openai
```
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

### 2. Anthropic Claude
```bash
npm install @anthropic-ai/sdk
```
```typescript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

### 3. Cohere
```bash
npm install cohere-ai
```
```typescript
import { CohereClient } from "cohere-ai";
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
```

## Recursos Adicionais

- 📚 [Documentação Oficial](https://ai.google.dev/docs)
- 🎓 [Tutoriais e Guias](https://ai.google.dev/tutorials)
- 💬 [Comunidade no Discord](https://discord.gg/google-ai)
- 🐛 [Reportar Bugs](https://github.com/google/generative-ai-js/issues)

## Próximos Passos

Após obter uma chave válida:

1. ✅ Configure no arquivo `.env`
2. ✅ Execute os testes: `npx ts-node tests/gemini.test.ts`
3. ✅ Inicie o backend: `npm run dev`
4. ✅ Teste os endpoints via Postman/cURL
5. ✅ Integre com o frontend

## Suporte

Se você continuar tendo problemas:
1. Verifique o console do Google AI Studio
2. Revise os logs de erro do backend
3. Consulte a [documentação de troubleshooting](https://ai.google.dev/docs/troubleshooting)
4. Abra uma issue no repositório do projeto

---

**Nota:** Por favor, obtenha uma chave API válida seguindo os passos acima. Nunca compartilhe ou faça commit de chaves reais no repositório.
