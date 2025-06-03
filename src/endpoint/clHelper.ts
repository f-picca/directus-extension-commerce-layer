import { authenticate } from '@commercelayer/js-auth';
import CommerceLayer from '@commercelayer/sdk';

const COMMERCE_LAYER_INTEGRATION_ID = process.env.COMMERCE_LAYER_INTEGRATION_ID;
const COMMERCE_LAYER_INTEGRATION_SECRET = process.env.COMMERCE_LAYER_INTEGRATION_SECRET;
const COMMERCE_LAYER_ORGANIZATION_SLUG = process.env.COMMERCE_LAYER_ORGANIZATION_SLUG;

let commerceLayerClientSingleton: ReturnType<typeof CommerceLayer> | null = null;
let accessToken: string | null = null;
let tokenExpiresAt: number | null = null;

export default async function getCommerceLayerClient() {
	if (!COMMERCE_LAYER_INTEGRATION_ID || !COMMERCE_LAYER_INTEGRATION_SECRET || !COMMERCE_LAYER_ORGANIZATION_SLUG) {
		throw new Error('Commerce Layer Integration ID or Secret is not set.');
	}

	const now = Math.floor(Date.now() / 1000);

	if (
		commerceLayerClientSingleton &&
		accessToken &&
		tokenExpiresAt &&
		now < tokenExpiresAt - 60 // refresh 1 minute before expiry
	) {
		return commerceLayerClientSingleton;
	}

	const auth = await authenticate('client_credentials', {
		clientId: COMMERCE_LAYER_INTEGRATION_ID,
		clientSecret: COMMERCE_LAYER_INTEGRATION_SECRET,
	});

	accessToken = auth.accessToken;
	tokenExpiresAt = auth.expires
		? (typeof auth.expires === 'number'
			? now + auth.expires
			: Math.floor((auth.expires as Date).getTime() / 1000))
		: now + 3600; // fallback to 1 hour if not provided

	commerceLayerClientSingleton = CommerceLayer({
		organization: COMMERCE_LAYER_ORGANIZATION_SLUG,
		accessToken: accessToken
	});

	return commerceLayerClientSingleton;
}