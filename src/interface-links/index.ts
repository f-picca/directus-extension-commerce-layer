import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'cl-commerce-links-interface',
	name: 'Commerce Links',
	icon: 'shopping_cart_checkout',
	description: 'This interface is used to create useful commerce links',
	component: InterfaceComponent,
	options: [
		{
			field: 'commerce_layer_dashboard_url',
			name: 'Commerce Layer Dashboard URL',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
				required: true,
				note: 'The base URL of your Commerce Layer dashboard, e.g., "https://dashboard.commercelayer.io/myorgslug/test/".',
			},
		}
	],
	types: ['alias'],
	group: 'presentation',
	onlyPresentation: true,
	localTypes: ['presentation']

});
