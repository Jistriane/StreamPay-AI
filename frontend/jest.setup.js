// Polyfill global fetch para ambiente de testes JSDOM
require('whatwg-fetch');

// Polyfill TextEncoder/TextDecoder para ambiente Node
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Evita warnings de ReactDOMTestUtils.act em React 18 durante testes
// https://react.dev/reference/react-dom/test-utils/act#automatically-from-react-domclient
// eslint-disable-next-line no-underscore-dangle
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Filtro extra para suprimir warnings de depreciação escritos diretamente em stderr
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, encoding, cb) => {
  const text = typeof chunk === 'string' ? chunk : chunk.toString();
  if (text.includes('ReactDOMTestUtils.act is deprecated')) {
    return true; // ignora
  }
  return originalStderrWrite(chunk, encoding, cb);
};

// Aplica o mesmo filtro para stdout (Jest pode usar stdout para warnings)
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, cb) => {
  const text = typeof chunk === 'string' ? chunk : chunk.toString();
  if (text.includes('ReactDOMTestUtils.act is deprecated')) {
    return true;
  }
  return originalStdoutWrite(chunk, encoding, cb);
};

// JSDOM não implementa scrollIntoView; mock para evitar falhas em componentes que usam refs
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

// Mock básico do wagmi para permitir render de componentes sem WagmiConfig
jest.mock('wagmi', () => ({
  __esModule: true,
  useAccount: jest.fn(() => ({ address: null, isConnected: false })),
}));

// Mock do Next.js navigation para evitar erros de "app router to be mounted"
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Suavizar warnings de act em atualizações assíncronas (opcional)
// eslint-disable-next-line no-console
console.error = (msg, ...args) => {
  const text = String(msg || '');
  if (text.includes('not wrapped in act') || text.includes('ReactDOMTestUtils.act is deprecated')) {
    return; // suprime warnings conhecidos durante testes
  }
  // eslint-disable-next-line no-console
  return require('console').error(msg, ...args);
};

// Suprimir warning repetitivo do ReactDOMTestUtils.act emitido como console.warn
// eslint-disable-next-line no-console
console.warn = (msg, ...args) => {
  const text = String(msg || '');
  if (text.includes('ReactDOMTestUtils.act is deprecated')) {
    return; // ignora aviso de depreciação já conhecido
  }
  // eslint-disable-next-line no-console
  return require('console').warn(msg, ...args);
};
