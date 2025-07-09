import { defineOperationApi } from '@directus/extensions-sdk';
import { getCommerceLayerClient } from '../endpoint';

type Options = {
	taxonomy_id: string[];
};

type SkuListItem = {
	sku_code: string,
	sku_id: string,
	sku_list_id: string
}

export default defineOperationApi<Options>({
	id: 'taxon-sku_list-sync',
	handler: async ({ taxonomy_id }, context) => {
		const logger = context.logger;
		const {services,getSchema} = context;
		const { ItemsService } = services;
		
		const taxonomyService = new ItemsService('taxonomy', { schema: await getSchema() });
		
		logger.info('Taxonomy SKU List Sync operation started with taxonomy ID: %s', taxonomy_id[0]);
		
		let taxonomy
		try {
			taxonomy = await taxonomyService.readOne(taxonomy_id[0],{fields: [
				'id',
				'name',
				'taxons.*'
			]})

			for (const taxon_ref of taxonomy.taxons) {
				await syncTaxonWithSkuList(taxon_ref.taxon_id, context, logger);
			}
		} catch (error) {
			logger.error('Error fetching taxonomy: %s', error);
			throw error;
		}
	}
});

async function syncTaxonWithSkuList(taxon_id: string, context: any, logger: any) {
    const { services, getSchema } = context;
    const { ItemsService } = services;
    const taxonService = new ItemsService('taxon', { schema: await getSchema() });
    const skusService = new ItemsService('skus', { schema: await getSchema() });

    try {
        const taxon = await taxonService.readOne(taxon_id, {
            fields: ['id', 'label', 'taxons.*', 'references.*']
        });

        logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Syncing with SKU list.`);

        if (!taxon.references || !Array.isArray(taxon.references) || taxon.references.length === 0) {
            logger.warn(`[Taxon ${taxon.id} - ${taxon.label}] No references found.`);
            return;
        } else {
            logger.info(`[Taxon ${taxon.id} - ${taxon.label}] References found: ${taxon.references.length}`);
            //get skus from products
			const productCodes = (taxon.references as any[])
                .filter(reference => reference && typeof reference.products_code === 'string' && reference.products_code.length > 0)
                .map(reference => reference.products_code);
            logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Product codes: ${JSON.stringify(productCodes)}`);

            if (productCodes.length > 0) {
                const skus = await skusService.readByQuery({
                    filter: {
                        "product_code": { "_in": productCodes }
                    }
                });
                logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Found ${skus.length} SKUs.`);

                const clClient = await getCommerceLayerClient();
                const clSkus = await clClient.skus.list({
                    filters: {
                        code_in: skus.map((sku: any) => sku.code)
                    },
                    fields: ["id", "code"]
                });
                logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Found ${clSkus.length} SKUs in Commerce Layer.`);

				//sync skus with CL to get CL ids and update skus locally
				
                await skusService.updateBatch(
                    clSkus.map((clSku: { id: string; code: string }) => ({
                        code: clSku.code,
                        cl_id: clSku.id
                    }))
                );
				
                logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Updated SKUs with Commerce Layer IDs.`);
				//create sku list after taxon name
				const skuList = await clClient.sku_lists.create({
					name: taxon.label,
				})
				//create sku list items
				const skuListItems: SkuListItem[] = clSkus.map((clSku: { id: string; code: string }) => ({
					sku_code: clSku.code,
					sku_id: clSku.id,
					sku_list_id: skuList.id
				}));

				//use cl imports to import sku list items
				logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Importing SKU List Items for Commerce Layer.`);
				await clClient.imports.create({
					inputs: skuListItems,
					resource_type: 'sku_list_items',
				})
				logger.info(`[Taxon ${taxon.id} - ${taxon.label}] SKU List Items imported successfully.`);
            }
        }

        if (Array.isArray(taxon.taxons)) {
            for (const sub_taxon of taxon.taxons) {
                logger.info(`[Taxon ${taxon.id} - ${taxon.label}] Recursing into sub-taxon: ${sub_taxon.related_taxon_id}`);
                await syncTaxonWithSkuList(sub_taxon.related_taxon_id, context, logger);
            }
        }
    } catch (error) {
        logger.error(`[Taxon ${taxon_id}] Error syncing taxon: ${error}`);
		throw error;
    }
}