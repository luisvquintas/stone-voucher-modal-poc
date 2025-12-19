import React from 'react';
import ReactDOM from 'react-dom/client';
import VoucherCheckoutLib from './lib/VoucherCheckoutLib';

// Identifier for the host element
const MOUNT_ID = 'nuvemshop-voucher-checkout-root';

// Function to initialize the React app
const init = (initialConfig) => {
    if (document.getElementById(MOUNT_ID)) return; // Already initialized

    const mountNode = document.createElement('div');
    mountNode.id = MOUNT_ID;
    document.body.appendChild(mountNode);

    const root = ReactDOM.createRoot(mountNode);
    root.render(
        <React.StrictMode>
            <VoucherCheckoutLib initialConfig={initialConfig} />
        </React.StrictMode>
    );
    return root;
};

// Public API
window.StoneVoucherModal = {
    /**
     * Open the Voucher Checkout Modal
     * @param {Object} config
     * @param {number} config.amount - Total amount (e.g., 150.00)
     * @param {string} config.currency - 'BRL'
     * @param {string[]} config.voucherTypes - ['alimentação', 'refeição']
     * @param {string[]} config.voucherBrands - ['pluxee', 'vr', 'alelo', 'ticket']
     * @param {string} config.publicKey - Pagar.me Public Key
     * @param {string} [config.env='production'] - 'staging' or 'production'
     * @param {Function} [config.onSuccess] - Callback ({ card_token, card_brand }) => {}
     * @param {Function} [config.onError] - Callback ({ error: string }) => {}
     * @param {Function} [config.onClose] - Callback () => {}
     */
    open: (config) => {
        // Ensure initialized
        if (!document.getElementById(MOUNT_ID)) {
            init(config);
        } else {
            // Dispatch event to React component for subsequent calls
            const event = new CustomEvent('voucher-checkout:open', { detail: config });
            window.dispatchEvent(event);
        }
    }
};

// Auto-init if script is loaded defer? No, lazy init on 'open' is better to avoid DOM thrashing if never used.

