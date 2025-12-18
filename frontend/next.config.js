/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile pacotes problemáticos via Babel
  transpilePackages: [
    '@base-org/account',
    '@metamask/sdk',
    '@walletconnect/ethereum-provider',
  ],
  // Otimizações
  reactStrictMode: true,
  swcMinify: false, // Desabilitado por causa do babel.config.js customizado
  webpack: (config, { isServer }) => {
    // Ignorar módulo RN AsyncStorage em ambiente web (resolve erro do MetaMask SDK)
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

module.exports = nextConfig;
