"use strict";(()=>{var e={};e.id=76,e.ids=[76],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5388:(e,a,t)=>{t.r(a),t.d(a,{originalPathname:()=>h,patchFetch:()=>g,requestAsyncStorage:()=>m,routeModule:()=>c,serverHooks:()=>f,staticGenerationAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{POST:()=>p});var o=t(7916),n=t(9930),r=t(2169),i=t(4389);let u=process.env.NEXT_PUBLIC_BACKEND_URL||"http://localhost:3001",d=process.env.NEXT_PUBLIC_ELIZA_URL||"http://localhost:3000";async function l(e,a,t,s){return await new Promise(e=>setTimeout(e,1500)),{success:!0,txHash:"0x"+Array.from({length:64},()=>Math.floor(16*Math.random()).toString(16)).join(""),amount:e,token:a,recipient:t.includes("0x")?t:`0x${Array.from({length:40},()=>Math.floor(16*Math.random()).toString(16)).join("")}`,network:"Ethereum Mainnet",gasUsed:Math.floor(5e4*Math.random()+5e4),confirmationTime:Math.floor(30*Math.random()+15)}}async function p(e){try{let{prompt:a,userAddress:t}=await e.json();if(!a||!a.trim())return i.NextResponse.json({error:"Prompt \xe9 obrigat\xf3rio"},{status:400});let s=function(e){for(let a of(e.toLowerCase(),[/(?:envie|enviar|enviar|transferir|transfer|enviar|send)\s+(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|dai|weth|token)?\s*(?:para|to|to)\s+([a-z0-9]+|0x[a-fA-F0-9]{40})/i,/(?:pay|send|transfer)\s+(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|dai|weth)?\s*(?:to|para)\s+([a-z0-9]+|0x[a-fA-F0-9]{40})/i])){let t=e.match(a);if(t)return{amount:t[1]||null,token:(t[2]||"USDC").toUpperCase(),recipient:t[3]||null,isPayment:!0}}let a=/(?:envie|enviar|send|pay|transferir|transfer)/i.test(e),t=/\d+/.test(e);if(/(?:para|to|fulano|recipient)/i.test(e),a&&t){let a=e.match(/(\d+(?:\.\d+)?)/),t=e.match(/(usdc|usdt|eth|dai|weth)/i),s=e.match(/(?:para|to)\s+([a-z0-9]+|0x[a-fA-F0-9]{40}|fulano)/i);return{amount:a?a[1]:null,token:t?t[1].toUpperCase():"USDC",recipient:s?s[1]:"fulano",isPayment:!0}}return{amount:null,token:null,recipient:null,isPayment:!1}}(a);if(s.isPayment&&s.amount&&s.recipient){let e=await l(s.amount,s.token||"USDC",s.recipient,t),a=`✅ **Transa\xe7\xe3o Processada com Sucesso!**

📊 **Detalhes da Transa\xe7\xe3o:**
• Valor: ${e.amount} ${e.token}
• Destinat\xe1rio: ${e.recipient}
• Hash da Transa\xe7\xe3o: \`${e.txHash}\`
• Rede: ${e.network}
• Gas Utilizado: ${e.gasUsed}
• Tempo Estimado de Confirma\xe7\xe3o: ~${e.confirmationTime} segundos

🔗 Voc\xea pode acompanhar a transa\xe7\xe3o no Etherscan:
https://etherscan.io/tx/${e.txHash}

A transa\xe7\xe3o foi enviada para a blockchain e est\xe1 aguardando confirma\xe7\xe3o. Voc\xea receber\xe1 uma notifica\xe7\xe3o assim que for confirmada.`;return i.NextResponse.json({resposta:a,type:"payment",txHash:e.txHash})}let o=a.toLowerCase();if(o.includes("ol\xe1")||o.includes("oi")||o.includes("hello"))return i.NextResponse.json({resposta:`Ol\xe1! 👋 Sou o assistente do StreamPay AI. Posso ajud\xe1-lo com:

• Enviar tokens (ex: "envie 10 USDC para 0x123...")
• Criar streams de pagamento
• Verificar saldos e transa\xe7\xf5es
• Consultar informa\xe7\xf5es sobre sua wallet

Como posso ajud\xe1-lo hoje?`});if(o.includes("ajuda")||o.includes("help")||o.includes("comandos"))return i.NextResponse.json({resposta:`📚 **Comandos Dispon\xedveis:**

💸 **Enviar Tokens:**
• "envie 10 USDC para fulano"
• "enviar 50 USDT para 0x123..."
• "send 1 ETH to 0xabc..."

📊 **Consultar Informa\xe7\xf5es:**
• "qual meu saldo?"
• "mostre minhas transa\xe7\xf5es"
• "status da minha wallet"

💬 **Outros:**
• Posso ajudar com perguntas sobre StreamPay
• Explicar como funcionam os streams
• Assistir com configura\xe7\xf5es

Digite sua solicita\xe7\xe3o e eu ajudarei!`});if(o.includes("saldo")||o.includes("balance"))return i.NextResponse.json({resposta:`💰 **Saldo da Wallet:**

• USDC: 1,250.00
• USDT: 500.00
• ETH: 2.5
• Total (USD): $3,500.00

💡 Para enviar tokens, digite: "envie [quantidade] [token] para [destinat\xe1rio]"`});try{let e=await fetch(`${u}/api/eliza-message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:a,text:a,userAddress:t||void 0})});if(e.ok){let a=await e.json();return i.NextResponse.json({resposta:a.response||a.result||a.message||"Resposta recebida do agente."})}}catch(e){console.warn("Backend API n\xe3o dispon\xedvel:",e)}try{let e=await fetch(`${d}/api/eliza-message`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:a,text:a})});if(e.ok){let a=await e.json();return i.NextResponse.json({resposta:a.response||a.result||a.message||"Resposta recebida do agente."})}}catch(e){console.warn("Eliza API n\xe3o dispon\xedvel:",e)}return i.NextResponse.json({resposta:`Entendi sua mensagem: "${a}". Posso ajud\xe1-lo a enviar tokens, verificar saldos ou criar streams de pagamento. 

💡 **Exemplo:** Digite "envie 10 USDC para fulano" para fazer uma transfer\xeancia.`})}catch(e){return i.NextResponse.json({error:e.message||"Erro ao processar a mensagem"},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/eliza/route",pathname:"/api/eliza",filename:"route",bundlePath:"app/api/eliza/route"},resolvedPagePath:"/home/jistriane/Documentos/StreamPay AI/StreamPay-AI/frontend/app/api/eliza/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:x,serverHooks:f}=c,h="/api/eliza/route";function g(){return(0,r.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:x})}}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[148,136],()=>t(5388));module.exports=s})();