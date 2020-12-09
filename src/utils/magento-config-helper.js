const isObject = require('lodash/isObject');

class MagentoConfigHelper {
  getConfigurationOfWebsite (websiteId) {
    if (this.configuration.hasOwnProperty(websiteId)) {
      return this.configuration[websiteId];
    }

    return null;
  }

  getConfigurationOfStore (websiteId, storeId) {
    const websiteConfiguration = this.getConfigurationOfWebsite(websiteId);
    if (websiteConfiguration && websiteConfiguration.hasOwnProperty(storeId)) {
      return websiteConfiguration[storeId];
    }

    return null;
  }

  /**
   * Returns configuration objects prepared per website
   * and per store
   * @returns {Map<string, MagentoConfiguration>}
   */
  getCacheReadyConfigurationMap () {
    const map = new Map();
    Object.keys(this.configuration).forEach(websiteId => {
      const configPerWebsite = this.configuration[websiteId];
      Object.keys(configPerWebsite).forEach(storeId => {
        const configPerStore = configPerWebsite[storeId];
        const configKey = this.getCacheKey(websiteId, storeId);
        map.set(configKey, configPerStore);
      });
    });

    return map;
  }

  getCacheKey (websiteId, storeId) {
    return `website_${websiteId}_store_${storeId}`;
  }

  getIdsFromKey (key) {

  }

  constructor (configuration) {
    let conf = {};
    if (configuration && isObject(configuration)) {
      conf = configuration;
    }
    if (configuration instanceof Array && configuration.length > 0) {
      conf = configuration[0];
    }

    this.configuration = conf;
  }
}

module.exports = MagentoConfigHelper;
