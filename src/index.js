const isObject = require('lodash/isObject');

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
     */
    router.get('/get', async (req, res) => {
        const client = createMage2RestClient();
        client.mage_config.get()
            .then(config => {
                const helper = new MagentoConfigHelper(config);
                const map = helper.getCacheReadyConfigurationMap();
                map.forEach((value, key) => {
                    console.warn('Setting for key: ', key);
                    cache.getCacheInstance().set(key, value, ['config']);
                });
            });

        cache.get(req, ['mage-config'], client.mage_config.get)
            .then(result => apiStatus(res, result, 200))
            .catch(err => apiError(res, err));
    });

    router.get('/:websiteId/:storeId', async (req, res) => {
        try {
            const helper = new MagentoConfigHelper();
            const {websiteId, storeId} = req.params;
            const config = await cache.getCacheInstance().get(helper.getCacheKey(websiteId, storeId));
            if (!config) {
                apiError(res, `Configuration was not found`);
                return;
            }

            apiStatus(res, config, 200);
        } catch (err) {
            apiError(res, err);
        }
    });

    return {
        domainName: '@grupakmk',
        pluginName: 'magento-config',
        route: '/config',
        router
    };
};
