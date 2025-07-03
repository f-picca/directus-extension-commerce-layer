import { defineOperationApi } from '@directus/extensions-sdk';
import { getCommerceLayerClient } from '../endpoint';


type LocalSku = {
	code: string;
	product_code: string;
	size: string;
	shipping_category: string;
};

type Options = {
	new_sku: LocalSku;
};

export default defineOperationApi<Options>({

	id: 'create-sku',
	handler: async ({new_sku},context) => {
		const logger = context.logger;
		const {services,getSchema} = context;
		const { ItemsService} = services;

		//get parent product
		const productsService = new ItemsService('products', { schema: getSchema() });
		const product = await productsService.readOne(new_sku['product_code'])

		const clClient = await getCommerceLayerClient();

		try {
			const response = await clClient.skus.create({
				code: new_sku['code'],
				name: `${product.name} (${new_sku['size']})`,
				shipping_category: clClient.shipping_categories.relationship(new_sku['shipping_category']),

			});

			const skusService = new ItemsService('skus', { schema: getSchema() });
			const skuData = await skusService.updateOne(new_sku['code'], {
				cl_id: response.id,
			});

			logger.info('SKU created successfully in Commerce Layer:', response.code);
		} catch (error) {
			logger.error('Error creating SKU in Commerce Layer:', error);
		}
	}
});