import { BaseController } from './BaseController.js';
import config from '../config/appConfig.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class ConfigController extends BaseController {
  constructor() {
    super();
  }

  getConfig = asyncHandler(async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || 'en';
    
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    const frontendConfig = config.getFrontendConfig();
    
    const dynamicConfig = {
      ...frontendConfig,
      client: {
        ip: clientIP,
        isMobile,
        language: acceptLanguage.split(',')[0].split('-')[0], // Primary language
        timezone: req.get('X-Timezone') || 'UTC'
      },
      urls: {
        api: config.getApiUrl(),
        frontend: config.getFrontendUrl(),
        websocket: config.getApiUrl().replace('http', 'ws'),
        assets: `${config.getFrontendUrl()}/assets`,
        images: `${config.getApiUrl()}/uploads`
      },
      environment: {
        name: config.environment,
        isDevelopment: config.isDevelopment(),
        isProduction: config.isProduction(),
        isStaging: config.isStaging()
      },
      timestamp: new Date().toISOString(),
      version: {
        api: process.env.API_VERSION || '1.0.0',
        build: process.env.BUILD_NUMBER || 'dev',
        commit: process.env.COMMIT_HASH || 'unknown'
      }
    };

    const cacheMaxAge = config.isProduction() ? 300 : 0; 
    res.set({
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'ETag': `"${Buffer.from(JSON.stringify(dynamicConfig)).toString('base64').slice(0, 16)}"`
    });

    return this.sendSuccess(res, dynamicConfig, 'Configuration retrieved successfully');
  });

  getHealth = asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.environment,
      version: {
        api: process.env.API_VERSION || '1.0.0',
        node: process.version,
        platform: process.platform
      },
      services: {
        database: 'connected', 
        redis: 'not_configured', 
        email: 'not_configured'
      },
      endpoints: {
        auth: `${config.getApiUrl()}/auth`,
        products: `${config.getApiUrl()}/products`,
        categories: `${config.getApiUrl()}/categories`,
        config: `${config.getApiUrl()}/config`
      }
    };

    return this.sendSuccess(res, health, 'Health check successful');
  });

  getEnvironment = asyncHandler(async (req, res) => {
    const environment = {
      name: config.environment,
      isDevelopment: config.isDevelopment(),
      isProduction: config.isProduction(),
      isStaging: config.isStaging(),
      features: config.getFrontendConfig().features,
      limits: config.getFrontendConfig().limits,
      urls: {
        api: config.getApiUrl(),
        frontend: config.getFrontendUrl()
      }
    };

    return this.sendSuccess(res, environment, 'Environment information retrieved');
  });
}
