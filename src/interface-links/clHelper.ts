


export function getCommerceLayerSkuAppLink(skuId: string): string {

	const COMMERCE_LAYER_ORGANIZATION_SLUG = process.env.VUE_APP_COMMERCE_LAYER_ORGANIZATION_SLUG;
const COMMERCE_LAYER_ENV = process.env.VUE_APP_COMMERCE_LAYER_ENV;
const COMMERCE_LAYER_DASHBOARD_URL = process.env.VUE_APP_COMMERCE_LAYER_DASHBOARD_URL;
	console.log('getCommerceLayerSkuAppLink called with skuId:', skuId);
	if (!COMMERCE_LAYER_ORGANIZATION_SLUG || !COMMERCE_LAYER_ENV || !COMMERCE_LAYER_DASHBOARD_URL) {
		throw new Error('Commerce Layer Organization Slug, Environment or Dashboard URL is not set.');
	}
	return `https://${COMMERCE_LAYER_DASHBOARD_URL}/${COMMERCE_LAYER_ORGANIZATION_SLUG}/${COMMERCE_LAYER_ENV}/apps/skus/${skuId}`;
}



