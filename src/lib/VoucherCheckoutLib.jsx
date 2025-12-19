import React, { useState, useEffect } from 'react';
import CheckoutModal from '../components/CheckoutModal';
import VoucherForm from '../components/VoucherForm';
import '../styles/main.css'; // Ensure styles are included

const VoucherCheckoutLib = ({ initialConfig }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState(null);

    // Initial mount handling
    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
            setIsOpen(true);
        }
    }, []); // Only run once on mount

    useEffect(() => {
        const handleOpen = (event) => {
            const { detail } = event;
            setConfig(detail);
            setIsOpen(true);
        };

        window.addEventListener('voucher-checkout:open', handleOpen);
        return () => window.removeEventListener('voucher-checkout:open', handleOpen);
    }, []);

    const handleClose = () => {
        setIsOpen(false);

        // Try config callback first, then global fallback
        if (config && typeof config.onClose === 'function') {
            config.onClose();
        }
    };

    const handleSubmit = (data) => {
        // Success
        setIsOpen(false);

        // Feedback
        const result = {
            card_token: data.token,
            card_brand: data.cardBrand || 'unknown'
        };

        if (config && typeof config.onSuccess === 'function') {
            config.onSuccess(result);
        }
    };

    const handleError = (error) => {
        if (config && typeof config.onError === 'function') {
            config.onError(error);
        } else {
            console.warn('[StoneVoucherModal] Unhandled error:', error);
        }
    };

    return (
        <CheckoutModal
            isOpen={isOpen}
            onClose={handleClose}
            config={config || {}}
        >
            {isOpen && (
                <VoucherForm
                    onSubmit={handleSubmit}
                    config={{
                        ...config,
                        onError: handleError
                    }}
                />
            )}
        </CheckoutModal>
    );
};

export default VoucherCheckoutLib;
