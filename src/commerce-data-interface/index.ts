import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'cl-commerce-data-interface',
	name: 'Commerce Data',
	icon: 'storefront',
	description: 'This interface is used to show commerce data from commerce layer!',
	component: InterfaceComponent,
	options: null,
	types: ['alias'],
	group: 'presentation',
	onlyPresentation: true,
});
