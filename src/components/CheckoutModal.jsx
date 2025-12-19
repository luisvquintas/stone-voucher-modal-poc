import React, { useEffect } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, config, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const title = config?.voucherTypes
        ? `Vale ${config.voucherTypes.join(' ou ')}`
        : 'Vale alimentação ou refeição';

    const formattedPrice = config?.amount
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: config.currency || 'BRL' }).format(config.amount)
        : 'R$ 0,00';

    const handleCloseClick = (e) => {
        console.log('[CheckoutModal] Close triggered, onClose prop:', typeof onClose);
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleCloseClick}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <div className="transaction-summary">
                        <span className="summary-label">Total a pagar</span>
                        <span className="summary-value">{formattedPrice}</span>
                    </div>
                </div>

                <div className="modal-content">
                    {children}
                    <button className="modal-link-action" onClick={handleCloseClick}>
                        escolher outra forma de pagamento
                    </button>
                </div>

                <div className="modal-footer-security">
                    <span>🔒</span> Pagamento processado com segurança
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
