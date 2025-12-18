/**
 * Services Index - Centralized export of all services
 */

export { HttpClient, createHttpClient } from './http-client';
export { MoralisService, createMoralisService } from './moralis';
export { ChainlinkService, createChainlinkService } from './chainlink';
export { IntentParser, StreamPayIntent, ParsedIntent, createIntentParser } from './intent-parser';
export { ActionHandler, createActionHandler } from './action-handler';

// Service factory for easy initialization
export interface ServiceConfig {
  moralisApiKey: string;
  chainlinkRpcUrl: string;
  backendUrl: string;
  userAddress?: string;
  authToken?: string;
}

export class ServiceFactory {
  private moralisService: any;
  private chainlinkService: any;
  private intentParser: any;
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Dynamic imports would go here in real implementation
    // For now, services are created as needed
  }

  getMoralisService() {
    if (!this.moralisService) {
      const { createMoralisService } = require('./moralis');
      this.moralisService = createMoralisService(this.config.moralisApiKey);
    }
    return this.moralisService;
  }

  getChainlinkService() {
    if (!this.chainlinkService) {
      const { createChainlinkService } = require('./chainlink');
      this.chainlinkService = createChainlinkService(this.config.chainlinkRpcUrl);
    }
    return this.chainlinkService;
  }

  getIntentParser() {
    if (!this.intentParser) {
      const { createIntentParser } = require('./intent-parser');
      this.intentParser = createIntentParser();
    }
    return this.intentParser;
  }

  getActionHandler() {
    const { createActionHandler } = require('./action-handler');
    return createActionHandler({
      userAddress: this.config.userAddress || '',
      backendUrl: this.config.backendUrl,
      authToken: this.config.authToken,
      moralisService: this.getMoralisService(),
      chainlinkService: this.getChainlinkService(),
    });
  }
}
