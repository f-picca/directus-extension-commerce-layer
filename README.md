# Directus Extension: Commerce Layer

This extension integrates [Commerce Layer](https://commercelayer.io/) with your Directus project, enabling seamless management of e-commerce data within the Directus interface.

## Features

- Sync skus between Commerce Layer and Directus
- Manage Commerce Layer resources directly from Directus
- Webhook support for real-time updates

## Installation

1. Clone or download this extension into your Directus extensions directory:
    ```bash
    git clone https://github.com/your-org/directus-extension-commerce-layer.git
    ```
2. Restart your Directus instance:
    ```bash
    npx directus start
    ```

## Configuration

1. Set your Commerce Layer API credentials in the extension settings or via environment variables:
    ```
    COMMERCE_LAYER_CLIENT_ID=your-client-id
    COMMERCE_LAYER_CLIENT_SECRET=your-client-secret
    COMMERCE_LAYER_BASE_URL=https://your-domain.commercelayer.io
    ```

2. Configure additional options as needed in the extension's config file.

## Usage

- Access Commerce Layer resources from the Directus admin panel.
- Use the provided endpoints or UI components to manage e-commerce data.

## Support

For issues or feature requests, please open an issue on the [GitHub repository](https://github.com/your-org/directus-extension-commerce-layer).

## License

MIT
