# Google Gemini AI - Integração StreamPay

## Visão Geral
A integração com Google Gemini AI fornece capacidades avançadas de IA generativa para o StreamPay, incluindo:
- Assistente virtual inteligente
- Análise de streams e transações
- Geração de relatórios de compliance
- Insights e recomendações em tempo real

## Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar API Key
Adicione sua chave API do Gemini no arquivo `.env`:
```env
GEMINI_API_KEY=sua_chave_api_aqui
```

> ⚠️ **IMPORTANTE:** Nunca commit sua chave API real no Git. Use apenas para desenvolvimento local.

### 3. Obter Chave API
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie e adicione ao arquivo `.env`

## Endpoints da API

### Chat com Assistente Virtual
**POST** `/api/gemini/chat`

Conversa com o assistente virtual StreamPay AI.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Como criar um stream de pagamento?",
  "context": "Usuário novo, primeira vez usando a plataforma"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Para criar um stream de pagamento no StreamPay..."
}
```

### Análise de Stream
**POST** `/api/gemini/analyze-stream`

Analisa dados de um stream e retorna insights de segurança e otimização.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "streamData": {
    "sender": "0x123...",
    "recipient": "0x456...",
    "amount": 1000,
    "token": "USDC",
    "duration": 3600,
    "status": "active"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Análise de Risco: Baixo\n1. Transação dentro dos padrões normais..."
}
```

### Relatório de Compliance
**POST** `/api/gemini/compliance-report`

Gera relatório detalhado de compliance baseado em dados KYC.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "kycData": {
    "wallet": "0x123...",
    "status": "approved",
    "documents": ["passport", "proof_of_address"],
    "transactionCount": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "report": "Avaliação de Risco: Baixo\n1. Status KYC aprovado..."
}
```

## Uso Programático

### Importar Módulo
```typescript
import { 
  chatAssistant, 
  analyzeStreamData, 
  generateComplianceReport,
  generateContent,
  generateContentStream
} from './gemini';
```

### Exemplo: Chat Assistente
```typescript
const response = await chatAssistant(
  "Qual é o status do meu stream?",
  "Usuário tem 3 streams ativos"
);
console.log(response);
```

### Exemplo: Análise de Stream
```typescript
const streamData = {
  sender: "0x123...",
  recipient: "0x456...",
  amount: 1000,
  token: "USDC",
  duration: 3600,
  status: "active"
};

const analysis = await analyzeStreamData(streamData);
console.log(analysis);
```

### Exemplo: Streaming de Resposta
```typescript
await generateContentStream(
  "Explique como funciona o streaming de pagamentos",
  (chunk) => {
    process.stdout.write(chunk); // Imprime em tempo real
  }
);
```

## Funções Disponíveis

### `generateContent(prompt: string)`
Gera texto usando Gemini Pro.
- **Parâmetros:** prompt (string)
- **Retorna:** Promise<string>

### `generateContentStream(prompt: string, onChunk: (text: string) => void)`
Gera texto com streaming em tempo real.
- **Parâmetros:** 
  - prompt (string)
  - onChunk: callback para cada pedaço de texto
- **Retorna:** Promise<void>

### `startChat(history?)`
Inicia uma sessão de chat com histórico.
- **Parâmetros:** history (array de mensagens, opcional)
- **Retorna:** ChatSession

### `chatAssistant(userMessage: string, context?: string)`
Assistente virtual especializado em StreamPay.
- **Parâmetros:**
  - userMessage: mensagem do usuário
  - context: contexto adicional (opcional)
- **Retorna:** Promise<string>

### `analyzeStreamData(streamData: any)`
Analisa dados de stream e fornece insights.
- **Parâmetros:** streamData (objeto com dados do stream)
- **Retorna:** Promise<string>

### `generateComplianceReport(kycData: any)`
Gera relatório de compliance baseado em KYC.
- **Parâmetros:** kycData (objeto com dados KYC)
- **Retorna:** Promise<string>

## Casos de Uso

### 1. Suporte ao Cliente
```typescript
const userQuestion = "Como cancelar um stream?";
const answer = await chatAssistant(userQuestion);
// Resposta contextualizada sobre cancelamento
```

### 2. Detecção de Fraude
```typescript
const suspicious = await analyzeStreamData({
  sender: "0x...",
  recipient: "0x...",
  amount: 1000000, // valor muito alto
  duration: 60 // duração muito curta
});
// Retorna alerta de risco
```

### 3. Automação de Compliance
```typescript
const report = await generateComplianceReport({
  wallet: "0x123...",
  status: "pending",
  transactionCount: 150
});
// Gera relatório automático para auditoria
```

### 4. Educação do Usuário
```typescript
const explanation = await generateContent(
  "Explique o que é streaming de pagamentos em blockchain de forma simples"
);
// Retorna explicação didática
```

## Melhores Práticas

### 1. Tratamento de Erros
```typescript
try {
  const response = await chatAssistant(message);
  console.log(response);
} catch (error) {
  console.error("Erro ao chamar Gemini:", error.message);
  // Implementar fallback ou retry
}
```

### 2. Rate Limiting
O Gemini API tem limites de taxa. Implemente:
- Cache de respostas comuns
- Throttling de requisições
- Retry com backoff exponencial

### 3. Segurança
- ⚠️ **NUNCA exponha a API key no frontend**
- ✅ Sempre valide entrada do usuário
- ✅ Use autenticação para endpoints Gemini
- ✅ Sanitize dados antes de enviar ao modelo
- ✅ Adicione `.env` ao `.gitignore`

### 4. Contexto Eficiente
```typescript
// Bom: contexto específico
const response = await chatAssistant(
  "Qual o status?",
  "3 streams ativos, 2 pendentes, saldo: 5000 USDC"
);

// Ruim: contexto genérico ou ausente
const response = await chatAssistant("Qual o status?");
```

## Limitações

- **Modelo:** Gemini Pro (texto apenas)
- **Contexto:** ~32k tokens por requisição
- **Rate Limit:** Varia conforme plano (verificar console)
- **Idioma:** Melhor performance em inglês, mas suporta português

## Recursos Adicionais

- [Google AI Studio](https://makersuite.google.com/)
- [Documentação Gemini API](https://ai.google.dev/docs)
- [Exemplos de Prompts](https://ai.google.dev/examples)
- [Melhores Práticas](https://ai.google.dev/docs/best_practices)

## Troubleshooting

### Erro: API Key inválida
Verifique se a key está correta no `.env` e se está ativa no console do Google AI.

### Erro: Rate limit exceeded
Aguarde alguns segundos e tente novamente. Implemente retry automático.

### Resposta vazia ou genérica
Melhore o prompt com mais contexto específico e instruções claras.

### Timeout
Aumente o timeout da requisição ou use `generateContentStream` para respostas longas.

## Próximos Passos

1. Implementar cache Redis para respostas comuns
2. Adicionar análise de sentimento de usuários
3. Integrar com histórico de conversas no banco
4. Criar dashboard de métricas de uso da IA
5. Implementar fine-tuning com dados específicos do StreamPay
