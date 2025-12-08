const axios = require('axios');
const nodemailer = require('nodemailer');

const checkElizaStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/healthz');
    if (!res.data || res.data.status !== 'ok') throw new Error('ElizaOS fora do ar');
  } catch (err) {
    await sendAlertEmail(err.message);
  }
};

const checkMoralisStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/moralis-balance');
    if (!res.data || res.status !== 200) throw new Error('Moralis fora do ar');
  } catch (err) {
    await sendAlertEmail('Moralis: ' + err.message);
  }
};

const checkEtherscanStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/etherscan-tx');
    if (!res.data || res.status !== 200) throw new Error('Etherscan fora do ar');
  } catch (err) {
    await sendAlertEmail('Etherscan: ' + err.message);
  }
};

const checkInfuraStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/infura-gas');
    if (!res.data || res.status !== 200) throw new Error('Infura fora do ar');
  } catch (err) {
    await sendAlertEmail('Infura: ' + err.message);
  }
};

const checkKYCStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/kyc-status');
    if (!res.data || res.status !== 200) throw new Error('KYC fora do ar');
  } catch (err) {
    await sendAlertEmail('KYC: ' + err.message);
  }
};

const checkSMTPStatus = async () => {
  try {
    // Testa envio de e-mail
    await sendAlertEmail('Teste de SMTP: monitoramento ativo');
  } catch (err) {
    await sendAlertEmail('SMTP: ' + err.message);
  }
};

const sendAlertEmail = async (msg) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.seuservidor.com',
    port: 587,
    auth: { user: 'seu@email.com', pass: 'senha' }
  });
  await transporter.sendMail({
    from: 'alertas@streampay.ai',
    to: 'admin@streampay.ai',
    subject: 'Alerta: ElizaOS fora do ar',
    text: `Falha detectada: ${msg}`
  });
};

setInterval(checkElizaStatus, 60000); // verifica a cada 1 min

setInterval(checkMoralisStatus, 60000);
setInterval(checkEtherscanStatus, 60000);
setInterval(checkInfuraStatus, 60000);
setInterval(checkKYCStatus, 60000);
setInterval(checkSMTPStatus, 60000);

// Monitoramento de logs de contrato
const contractAddress = '0xSeuContrato'; // ajuste para o contrato desejado
const checkContractLogs = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/etherscan-logs/${contractAddress}`);
    // Exemplo: alerta se encontrar evento de erro
    if (res.data.result && res.data.result.result) {
      const erroLogs = res.data.result.result.filter(log => log.topics.includes('0xErroHash')); // ajuste para o tópico do evento
      if (erroLogs.length > 0) {
        await sendAlertEmail('Evento de erro detectado no contrato!');
      }
    }
  } catch (err) {
    await sendAlertEmail('Falha ao consultar logs do contrato: ' + err.message);
  }
};

setInterval(checkContractLogs, 60000); // verifica a cada 1 min
