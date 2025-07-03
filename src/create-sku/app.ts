import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'create-sku',
	name: 'Create SKU in Commerce Layer',
	icon: 'add_box',
	description: 'Eevery time an SKU is created in Directus, a new SKU is created in Commerce Layer.',
	overview: ({ new_sku }) => [
		{
			label: 'New SKU',
			text: new_sku,
		},
	],
	options: [
		{
			field: 'new_sku',
			name: 'New SKU',
			type: 'json',
			meta: {
				interface: 'input',
				width: 'full',
				required: true,
				note: 'This is the new SKU source. Typically {{$trigger.payload}}'
			},
		},
	],
});
