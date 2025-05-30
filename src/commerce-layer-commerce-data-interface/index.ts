import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'cl-commerce-data-panel',
	name: 'Commerce Data Panel',
	icon: 'storefront',
	description: 'This interface is used to show commerce data from commerce layer!',
	component: InterfaceComponent,
	options: [
		{
			field: 'commerce_layer_integration_id',
			name: 'Commerce Layer Integration ID',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'Enter your Commerce Layer Integration ID',
				},
			},
		},
		{
			field: 'commerce_layer_integration_secret',
			name: 'Commerce Layer Integration Secret',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'Enter your Commerce Layer Integration Secret',
				},
			},
		},
	],
	types: ['alias'],
	group: 'presentation',
	onlyPresentation: true,
});
