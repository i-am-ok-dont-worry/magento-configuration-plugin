# Magento configuration plugin

This plugin provides support for native Magento configuration.
It exposes one rest endpoint which can be used to fetch valid magento configuration.

## Usage
```shell script
curl -X GET "http://localhost:8080/api/vendor/config/{{websiteId}}/{{storeId}}"
```
