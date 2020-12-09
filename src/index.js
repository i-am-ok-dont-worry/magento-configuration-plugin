const MagentoConfigHelper = require('./utils/magento-config-helper');

/**
 * This plugin returns Magento Config defined in Admin panel.
 * Configuration is customizable in Magento Admin and it is
 * proxied via redis cache.
 * @returns {{router: *, route: string, pluginName: string, domainName: string}}
 */
module.exports = ({ config, db, router, cache, apiStatus, apiError, getRestApiClient }) => {
  const createMage2RestClient = () => {
    const client = getRestApiClient();
    client.addMethods('mage_config', (restClient) => {
      const module = {};
      module.get = function () {
        return restClient.get('/kmk-apistoreconfig/apiconfig/get');
      };

      return module;
    });

    return client;
  };

  /**
     * Returns map of mage configuration
     * per website and store
     */
  router.get('/:websiteId/:storeId', async (req, res) => {
    try {
      const {websiteId, storeId} = req.params;
      if (!websiteId) { throw new Error(`Website id is required`); }
      if (!storeId) { throw new Error(`Store id is required`); }

      let helper = new MagentoConfigHelper();
      let config = await cache.getCacheInstance().get(helper.getCacheKey(websiteId, storeId));

      if (!config) {
        const client = createMage2RestClient();
        config = await client.mage_config.get();
        helper = new MagentoConfigHelper(config);

        const map = helper.getCacheReadyConfigurationMap();
        map.forEach((value, key) => {
          cache.getCacheInstance().set(key, value, ['config'], { timeout: 604800 /* Cache for a week */ });
        });

        config = map.get(helper.getCacheKey(websiteId, storeId));

        if (!config) {
          apiError(res, `Configuration was not found`);
          return;
        }
      }

      apiStatus(res, config, 200);
    } catch (err) {
      apiError(res, err);
    }
  });

  router.post('/reindex', async (req, res) => {
    try {
      const client = createMage2RestClient();
      config = await client.mage_config.get();
      let helper = new MagentoConfigHelper(config);
      const map = helper.getCacheReadyConfigurationMap();
      map.forEach((value, key) => {
        cache.getCacheInstance().set(key, value, ['config'], { timeout: 604800 /* Cache for a week */ });
      });

      apiStatus(res, 'Invalidation complete');
    } catch (e) {
      apiError(res, `Configuration invalidation failed`);
    }
  });

  router.post('/reindex/:websiteId/:storeId', async (req, res) => {
    try {
      const {websiteId, storeId} = req.params;
      if (!websiteId) { throw new Error('Website id is required'); }
      if (!storeId) { throw new Error('Store id is required'); }

      let helper = new MagentoConfigHelper();
      const invalidateKey = helper.getCacheKey(websiteId, storeId);
      let cachedConfig = await cache.getCacheInstance().get(invalidateKey);

      if (cachedConfig) {
        const client = createMage2RestClient();
        const result = await client.mage_config.get();

        helper = new MagentoConfigHelper(result);
        const map = helper.getCacheReadyConfigurationMap();
        const newConfig = map.get(invalidateKey);
        cache.getCacheInstance().set(invalidateKey, newConfig, ['config'], { timeout: 604800 /* Cache for a week */ });

        config = map.get(helper.getCacheKey(websiteId, storeId));
        apiStatus(res, `Configuration for website website - ${websiteId}, store - ${storeId} invalidated`);
      } else {
        apiError(res, `Configuration for selected pair website - ${websiteId}, store - ${storeId} was not found`);
      }
    } catch (e) {
      apiError(res, `Configuration invalidate error ${e.message}`);
    }
  });

  return {
    domainName: '@grupakmk',
    pluginName: 'magento-config',
    route: '/config',
    router
  };
};
