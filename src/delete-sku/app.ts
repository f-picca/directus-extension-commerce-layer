import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'delete-sku',
	name: 'Delete SKU in Commerce Layer',
	icon: 'disabled_by_default',
	description: 'Every time an SKU is deleted in Directus, the corresponding SKU is deleted in Commerce Layer.',
	overview: ({ deleted_skus }) => [
		{
			label: 'Deleted SKUs',
			text: deleted_skus,
		},
	],
	options: [
		{
			field: 'deleted_skus',
			name: 'Deleted SKUs',
			type: 'json',
			meta: {
				interface: 'input',
				width: 'full',
				required: true,
				note: 'These are the deleted SKUs. Typically {{$trigger.payload}}'
			},
		},
	],
});
