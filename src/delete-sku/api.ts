import { defineOperationApi } from '@directus/extensions-sdk';
import { getCommerceLayerClient } from '../endpoint';


type Options = {
	deleted_skus: string[];
};

export default defineOperationApi<Options>({

	id: 'delete-sku',
	handler: async ({deleted_skus},context) => {
		const logger = context.logger;
		logger.info('delete-sku operation called with deleted_skus:', deleted_skus);
		const clClient = await getCommerceLayerClient();
		
		try {
			logger.info('Attempting to delete SKU in Commerce Layer with code:', deleted_skus[0]);
			const skus= await clClient.skus.list({
				filters: {
					code_eq: deleted_skus[0]!,
				}	
			})

			logger.info('SKUs found in Commerce Layer:', skus.length, 'for code:', deleted_skus[0]);

			if (!skus || skus.length === 0) {
				logger.warn('No SKU found with code:', deleted_skus[0]);
				return;
			}	else if (skus.length > 1) {
				logger.warn('Multiple SKUs found with code:', deleted_skus[0]);
				return;
			}

			await clClient.skus.delete(skus[0]!.id);

			logger.info('SKU deleted successfully in Commerce Layer:', skus[0]!.code);
		} catch (error) {
			logger.error('Error deleting SKU in Commerce Layer:', error);
		}
	}
});