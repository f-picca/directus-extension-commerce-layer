import { defineEndpoint } from '@directus/extensions-sdk';
import getCommerceLayerClient from './clHelper';



export default defineEndpoint((router) => {
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

		console.log('SKUs with data:',JSON.stringify(skusWithData, null, 2));

		return res.send(skusWithData);
	})
});


