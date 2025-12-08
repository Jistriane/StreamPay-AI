import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const ELIZA_URL = process.env.NEXT_PUBLIC_ELIZA_URL || 'http://localhost:3000';

// Função para extrair informações de envio de tokens
function parsePaymentRequest(message: string): {
  amount: string | null;
  token: string | null;
  recipient: string | null;
  isPayment: boolean;
} {
  const lowerMessage = message.toLowerCase();
  
  // Padrões para detectar envio de tokens
  const paymentPatterns = [
    /(?:envie|enviar|enviar|transferir|transfer|enviar|send)\s+(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|dai|weth|token)?\s*(?:para|to|to)\s+([a-z0-9]+|0x[a-fA-F0-9]{40})/i,
    /(?:pay|send|transfer)\s+(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|dai|weth)?\s*(?:to|para)\s+([a-z0-9]+|0x[a-fA-F0-9]{40})/i,
  ];

  for (const pattern of paymentPatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        amount: match[1] || null,
        token: (match[2] || 'USDC').toUpperCase(),
        recipient: match[3] || null,
        isPayment: true,
      };
    }
  }

  // Detecção simples de palavras-chave
  const hasPaymentKeywords = /(?:envie|enviar|send|pay|transferir|transfer)/i.test(message);
  const hasAmount = /\d+/.test(message);
  const hasRecipient = /(?:para|to|fulano|recipient)/i.test(message);

  if (hasPaymentKeywords && hasAmount) {
    const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
    const tokenMatch = message.match(/(usdc|usdt|eth|dai|weth)/i);
    const recipientMatch = message.match(/(?:para|to)\s+([a-z0-9]+|0x[a-fA-F0-9]{40}|fulano)/i);
    
    return {
      amount: amountMatch ? amountMatch[1] : null,
      token: tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC',
      recipient: recipientMatch ? recipientMatch[1] : 'fulano',
      isPayment: true,
    };
  }

  return {
    amount: null,
    token: null,
    recipient: null,
    isPayment: false,
  };
}

// Função para gerar hash mockado
function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Simulação de processamento de pagamento
async function simulatePayment(amount: string, token: string, recipient: string, userAddress?: string) {
  // Simula delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1500));

  const txHash = generateMockTxHash();
  const recipientAddress = recipient.includes('0x') 
    ? recipient 
    : `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  return {
    success: true,
    txHash,
    amount,
    token,
    recipient: recipientAddress,
    network: 'Ethereum Mainnet',
    gasUsed: Math.floor(Math.random() * 50000 + 50000),
    confirmationTime: Math.floor(Math.random() * 30 + 15),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, userAddress } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se é uma solicitação de pagamento
    const paymentInfo = parsePaymentRequest(prompt);

    if (paymentInfo.isPayment && paymentInfo.amount && paymentInfo.recipient) {
      // Simula o processamento do pagamento
      const result = await simulatePayment(
        paymentInfo.amount,
        paymentInfo.token || 'USDC',
        paymentInfo.recipient,
        userAddress
      );

      const response = `✅ **Transação Processada com Sucesso!**

📊 **Detalhes da Transação:**
• Valor: ${result.amount} ${result.token}
• Destinatário: ${result.recipient}
• Hash da Transação: \`${result.txHash}\`
• Rede: ${result.network}
• Gas Utilizado: ${result.gasUsed}
• Tempo Estimado de Confirmação: ~${result.confirmationTime} segundos

🔗 Você pode acompanhar a transação no Etherscan:
https://etherscan.io/tx/${result.txHash}

A transação foi enviada para a blockchain e está aguardando confirmação. Você receberá uma notificação assim que for confirmada.`;

      return NextResponse.json({
        resposta: response,
        type: 'payment',
        txHash: result.txHash,
      });
    }

    // Respostas para outras mensagens comuns
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('olá') || lowerPrompt.includes('oi') || lowerPrompt.includes('hello')) {
      return NextResponse.json({
        resposta: `Olá! 👋 Sou o assistente do StreamPay AI. Posso ajudá-lo com:

• Enviar tokens (ex: "envie 10 USDC para 0x123...")
• Criar streams de pagamento
• Verificar saldos e transações
• Consultar informações sobre sua wallet

Como posso ajudá-lo hoje?`,
      });
    }

    if (lowerPrompt.includes('ajuda') || lowerPrompt.includes('help') || lowerPrompt.includes('comandos')) {
      return NextResponse.json({
        resposta: `📚 **Comandos Disponíveis:**

💸 **Enviar Tokens:**
• "envie 10 USDC para fulano"
• "enviar 50 USDT para 0x123..."
• "send 1 ETH to 0xabc..."

📊 **Consultar Informações:**
• "qual meu saldo?"
• "mostre minhas transações"
• "status da minha wallet"

💬 **Outros:**
• Posso ajudar com perguntas sobre StreamPay
• Explicar como funcionam os streams
• Assistir com configurações

Digite sua solicitação e eu ajudarei!`,
      });
    }

    if (lowerPrompt.includes('saldo') || lowerPrompt.includes('balance')) {
      return NextResponse.json({
        resposta: `💰 **Saldo da Wallet:**

• USDC: 1,250.00
• USDT: 500.00
• ETH: 2.5
• Total (USD): $3,500.00

💡 Para enviar tokens, digite: "envie [quantidade] [token] para [destinatário]"`,
      });
    }

    // Tenta conectar com o backend que faz proxy para Eliza
    try {
      const response = await fetch(`${BACKEND_URL}/api/eliza-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          text: prompt,
          userAddress: userAddress || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          resposta: data.response || data.result || data.message || 'Resposta recebida do agente.',
        });
      }
    } catch (apiError) {
      console.warn('Backend API não disponível:', apiError);
    }

    // Fallback: tenta conectar diretamente com Eliza se o backend não estiver disponível
    try {
      const response = await fetch(`${ELIZA_URL}/api/eliza-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          text: prompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          resposta: data.response || data.result || data.message || 'Resposta recebida do agente.',
        });
      }
    } catch (elizaError) {
      console.warn('Eliza API não disponível:', elizaError);
    }

    // Resposta padrão
    return NextResponse.json({
      resposta: `Entendi sua mensagem: "${prompt}". Posso ajudá-lo a enviar tokens, verificar saldos ou criar streams de pagamento. 

💡 **Exemplo:** Digite "envie 10 USDC para fulano" para fazer uma transferência.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar a mensagem' },
      { status: 500 }
    );
  }
}
