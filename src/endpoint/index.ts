import { authenticate } from "@commercelayer/js-auth";
import CommerceLayer from "@commercelayer/sdk";

const COMMERCE_LAYER_INTEGRATION_ID = process.env.COMMERCE_LAYER_INTEGRATION_ID;
const COMMERCE_LAYER_INTEGRATION_SECRET = process.env.COMMERCE_LAYER_INTEGRATION_SECRET;
const COMMERCE_LAYER_ORGANIZATION_SLUG = process.env.COMMERCE_LAYER_ORGANIZATION_SLUG;
const COMMERCE_LAYER_CLIENT_ID = process.env.COMMERCE_LAYER_CLIENT_ID;

let commerceLayerClientSingleton: ReturnType<typeof CommerceLayer> | null = null;
let accessToken: string | null = null;
let tokenExpiresAt: number | null = null;

export  async function getCommerceLayerClient() {
	if (!COMMERCE_LAYER_INTEGRATION_ID || !COMMERCE_LAYER_INTEGRATION_SECRET || !COMMERCE_LAYER_ORGANIZATION_SLUG || !COMMERCE_LAYER_CLIENT_ID) {
		throw new Error('Commerce Layer Integration ID or Secret is not set.');
	}

	const now = Math.floor(Date.now() / 1000);

	if (
		commerceLayerClientSingleton &&
		accessToken &&
		tokenExpiresAt &&
		now < tokenExpiresAt - 60 // refresh 1 minute before expiry
	) {
		return commerceLayerClientSingleton;
	}

	const auth = await authenticate('client_credentials', {
		clientId: COMMERCE_LAYER_INTEGRATION_ID,
		clientSecret: COMMERCE_LAYER_INTEGRATION_SECRET,
	});

	accessToken = auth.accessToken;
	tokenExpiresAt = auth.expires
		? (typeof auth.expires === 'number'
			? now + auth.expires
			: Math.floor((auth.expires as Date).getTime() / 1000))
		: now + 3600; // fallback to 1 hour if not provided

	commerceLayerClientSingleton = CommerceLayer({
		organization: COMMERCE_LAYER_ORGANIZATION_SLUG,
		accessToken: accessToken
	});

	return commerceLayerClientSingleton;
}


export default {
	id: 'cl-endpoint',
	handler: (router: { get: (arg0: string, arg1: (_req: any, res: any) => Promise<any>) => void; }) => {
		router.get('/', async (_req, res) => {
			const skus = _req.query.skus || [];
	
			let commerceLayerClient;
			try {
				commerceLayerClient = await getCommerceLayerClient();
			} catch (error: any) {
				return res.status(500).send(error.message);
			}
	
			const skusWithData = await commerceLayerClient.skus.list({
				filters: {
					code_in: Array.isArray(skus) ? skus : [skus],
				},
				fields: {
					prices: ['formatted_amount', 'formatted_compare_at_amount', 'price_list'],
					stock_items: ['stock_location', 'quantity'],
					price_lists: ['name'],
				},
				include: ['prices', 'stock_items', 'stock_items.stock_location','prices.price_list'],
			});
	
			if (skusWithData.length === 0) {
				return res.status(404).send('No SKUs found for the provided codes.');
			}
	
			return res.send(skusWithData);
		});
		router.get('/salesLink', async (_req, res) => {
			const market = _req.query.market || null;
			const sku= _req.query.sku || null;
			
			if(!market) {
				return res.status(400).send('Market query parameter is required.');
			}

			let commerceLayerClient;
			try {
				commerceLayerClient = await getCommerceLayerClient();
			} catch (error: any) {
				return res.status(500).send(error.message);
			}	

			console.log('Creating sales link for market:', market, 'and sku:', sku);

			const salesLink = await commerceLayerClient.links.create({
				client_id: COMMERCE_LAYER_CLIENT_ID as string,
				scope: `market:${market}`,
				name: 'Direct Sales Lik',
				item: {
					type: "skus",
					id: sku as string
				}
			})

			if (!salesLink) {
				return res.status(500).send('Failed to create sales link.');
			}

			return res.send(salesLink.url);
		});
	}
}




