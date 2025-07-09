import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'taxon-sku_list-sync',
	name: 'Taxon SKU List Sync',
	icon: 'sync_alt',
	description: 'This operation creates a sku list in commerce layer for each taxon belonging to a taxonomy using a cumulative approach.',
	overview: ({ taxonomy_id }) => [
		{
			label: 'Selected Taxonomy',
			text: taxonomy_id,
		},
	],
	options: [
		{
			field: 'taxonomy_id',
			name: 'Selected Taxonomy ID',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input',
				required: true,
				note: 'Thise is the taxonomy sources.',
			},
		},
	],
});
