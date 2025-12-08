"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o assistente IA do StreamPay. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/eliza", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isConnected && address ? { authorization: `${address}:123` } : {}),
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          userAddress: address || undefined,
        }),
      });

      const data = await response.json();

      // Se for uma transação de pagamento, adiciona mensagem de processamento
      if (data.type === 'payment') {
        const processingId = `processing-${Date.now()}`;
        const processingMessage: Message = {
          id: processingId,
          role: "assistant",
          content: "⏳ Processando transação na blockchain...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, processingMessage]);
        
        // Aguarda para simular processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Remove a mensagem de processamento e adiciona a resposta
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.id !== processingId);
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.resposta || data.message || data.error || "Transação processada com sucesso!",
            timestamp: new Date(),
          };
          return [...filtered, assistantMessage];
        });
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.resposta || data.message || data.error || "Desculpe, não consegui processar sua mensagem.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Erro: ${error.message || "Falha ao conectar com o servidor."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.role === "user" ? "message-user" : "message-assistant"}`}
          >
            <div className="message-content">
              <div className="message-role">
                {message.role === "user" ? "Você" : "StreamPay AI"}
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message message-assistant">
            <div className="message-content">
              <div className="message-role">StreamPay AI</div>
              <div className="message-text loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {!isConnected && (
          <div className="chat-warning">
            Conecte sua wallet para usar todas as funcionalidades
          </div>
        )}
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            className="chat-input"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="chat-send-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

