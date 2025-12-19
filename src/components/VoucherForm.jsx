import React, { useState, useEffect } from 'react';
import './VoucherForm.css';
import { createCardToken, getBinInfo } from '../services/pagarme';
import { luhnCheck, validateExpiry, formatCPF, validateCPF } from '../utils/validation';

// Logos: Using local assets uploaded by user for perfect match
const Logos = {
    pluxee: (props) => (
        <div className={`logo-badge ${props.className}`}>
            <img src="/logos/pluxee.png" alt="Pluxee" className="brand-image" />
        </div>
    ),
    vr: (props) => (
        <div className={`logo-badge ${props.className}`}>
            <img src="/logos/vr.png" alt="VR" className="brand-image" />
        </div>
    ),
    alelo: (props) => (
        <div className={`logo-badge ${props.className}`}>
            <img src="/logos/alelo.png" alt="Alelo" className="brand-image" />
        </div>
    ),
    ticket: (props) => (
        <div className={`logo-badge ${props.className}`}>
            <img src="/logos/ticket.png" alt="Ticket" className="brand-image" />
        </div>
    ),
};

const VoucherForm = ({ onSubmit, config }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        cpf: ''
    });

    // State
    const [status, setStatus] = useState('idle'); // idle, validating_bin, processing, error, success
    const [cardBrand, setCardBrand] = useState(null); // 'pluxee', 'vr', 'alelo', 'ticket', or null
    const [binData, setBinData] = useState(null); // Store full BIN response for validation
    const [binError, setBinError] = useState(null); // Specific error for BIN validation
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState(null);
    const [showCVVTooltip, setShowCVVTooltip] = useState(false);

    // Refs
    const cardNumberInputRef = React.useRef(null);

    // Auto-focus on mount
    useEffect(() => {
        // Small timeout to ensure modal transition / render is complete
        const timer = setTimeout(() => {
            if (cardNumberInputRef.current) {
                cardNumberInputRef.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Helpers - dynamic card formatting based on BIN data
    const formatCardNumber = (val) => {
        const digits = val.replace(/\D/g, '');
        // Use gaps from BIN data if available, otherwise default [4, 8, 12]
        const gaps = binData?.raw?.gaps || [4, 8, 12];
        let result = '';
        let lastGap = 0;
        for (const gap of gaps) {
            if (digits.length > lastGap) {
                result += digits.slice(lastGap, gap) + ' ';
                lastGap = gap;
            }
        }
        result += digits.slice(lastGap);
        return result.trim();
    };
    const formatExpiry = (val) => val.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').substr(0, 5);

    // Async BIN Lookup
    useEffect(() => {
        const cleanNumber = formData.cardNumber.replace(/\s/g, '');

        const fetchBin = async () => {
            if (cleanNumber.length >= 6) {
                try {
                    const info = await getBinInfo(cleanNumber.substring(0, 6));
                    if (info.brand !== 'unknown') {
                        const detectedBrand = info.brand.toLowerCase();
                        // Map sodexo to pluxee for logo highlighting
                        const normalizedBrand = detectedBrand === 'sodexo' ? 'pluxee' : detectedBrand;

                        setCardBrand(normalizedBrand);
                        setBinData(info); // Store full BIN data for validation
                        setBinError(null);
                    }
                } catch (e) {
                    console.error("BIN Lookup failed", e);
                }
            } else if (cleanNumber.length < 6) {
                setCardBrand(null);
                setBinError(null);
            }
        };

        const timeoutId = setTimeout(fetchBin, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.cardNumber, config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'cardNumber') {
            finalValue = formatCardNumber(value);
        } else if (name === 'expiry') {
            finalValue = formatExpiry(value);
        } else if (name === 'cvv') {
            finalValue = value.replace(/\D/g, '').slice(0, 4);
        } else if (name === 'cpf') {
            finalValue = formatCPF(value);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        // Clear errors on edit
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        const cleanNumber = formData.cardNumber.replace(/\s/g, '');
        let valid = true;

        if (cleanNumber.length < 13 || !luhnCheck(cleanNumber)) {
            newErrors.cardNumber = "Número de cartão inválido";
            valid = false;
        }

        if (!formData.cardName.trim()) {
            newErrors.cardName = "Nome obrigatório";
            valid = false;
        }

        const [month, year] = formData.expiry.split('/');
        if (!validateExpiry(month, year)) {
            newErrors.expiry = "Data inválida";
            valid = false;
        }

        // Use CVV length from BIN data if available, default to 3
        const expectedCvvLength = binData?.raw?.cvv || 3;
        if (formData.cvv.length < expectedCvvLength) {
            newErrors.cvv = `CVV deve ter ${expectedCvvLength} dígitos`;
            valid = false;
        }

        if (!validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido';
            valid = false;
        }

        if (binError) {
            // Block if there is a BIN error
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setStatus('processing');
        setGlobalError(null); // Clear general errors

        try {
            const [month, year] = formData.expiry.split('/');

            const token = await createCardToken({
                number: formData.cardNumber.replace(/\s/g, ''),
                holder_name: formData.cardName,
                exp_month: month,
                exp_year: year,
                cvv: formData.cvv
            }, config?.publicKey, config?.env);

            setStatus('success');
            onSubmit({ ...formData, token, cardBrand: cardBrand || binData?.brand || 'unknown' });
        } catch (err) {
            setStatus('error');
            const errorMessage = err.message || 'Erro ao processar pagamento. Tente novamente.';
            setGlobalError(errorMessage);
            if (config?.onError) {
                config.onError({ error: errorMessage });
            }
        } finally {
            if (status !== 'success') setStatus('success'); // Ensure status is 'success' if successful, otherwise it remains 'error' or 'idle'
        }
    };

    const getBrandClass = (brand) => {
        if (!cardBrand) return 'initial';
        const normalizedBrand = cardBrand === 'sodexo' ? 'pluxee' : cardBrand;
        return brand === normalizedBrand ? 'active' : 'dimmed';
    };

    return (
        <form className="voucher-form" onSubmit={handleSubmit} noValidate autoComplete="off" data-lpignore="true">

            {(globalError || binError) && (
                <div className="card-error">
                    ⚠️ {globalError || binError}
                </div>
            )}

            {/* Row 1: Card Number */}
            <div className="form-group">
                <div className={`input-wrapper ${errors.cardNumber ? 'error' : ''}`}>
                    <input
                        type="tel"
                        inputMode="numeric"
                        id="cardNumber"
                        name="cardNumber"
                        className="form-input"
                        placeholder=" "
                        value={formData.cardNumber}
                        onChange={handleChange}
                        maxLength="19"
                        disabled={status === 'processing'}
                        autoComplete="off"
                        data-lpignore="true"
                        data-bwignore="true"
                        spellCheck="false"
                        autoCorrect="off"
                        ref={cardNumberInputRef}
                    />
                    <label className="floating-label" htmlFor="cardNumber">Número do cartão</label>
                    <div className="input-icon">
                        {errors.cardNumber ? <span className="invalid">✕</span> : (formData.cardNumber.length >= 19 ? <span className="valid">✓</span> : '')}
                    </div>
                </div>
                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>

            {/* Row 2: Consolidated (Name, Expiry, CVV) */}
            <div className="form-row compact-row" style={{ display: 'flex', gap: '12px' }}>
                {/* Name */}
                <div className="form-group" style={{ flex: '2' }}>
                    <div className={`input-wrapper ${errors.cardName ? 'error' : ''}`}>
                        <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            className="form-input"
                            placeholder=" "
                            value={formData.cardName}
                            onChange={handleChange}
                            disabled={status === 'processing'}
                            autoComplete="off"
                            data-lpignore="true"
                            data-bwignore="true"
                            spellCheck="false"
                            autoCorrect="off"
                        />
                        <label className="floating-label" htmlFor="cardName">Nome impresso</label>
                    </div>
                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>

                {/* Expiry */}
                <div className="form-group" style={{ flex: '1', minWidth: '80px' }}>
                    <div className={`input-wrapper ${errors.expiry ? 'error' : ''}`}>
                        <input
                            type="tel"
                            inputMode="numeric"
                            id="expiry"
                            name="expiry"
                            className="form-input"
                            placeholder=" "
                            value={formData.expiry}
                            onChange={handleChange}
                            maxLength="5"
                            disabled={status === 'processing'}
                            autoComplete="off"
                            data-lpignore="true"
                            data-bwignore="true"
                        />
                        <label className="floating-label" htmlFor="expiry">Validade</label>
                    </div>
                    {errors.expiry && <span className="error-message">{errors.expiry}</span>}
                </div>

                {/* CVV */}
                <div className="form-group" style={{ flex: '1', minWidth: '100px', position: 'relative' }}>
                    <div className={`input-wrapper ${errors.cvv ? 'error' : ''}`}>
                        <input
                            type="tel"
                            inputMode="numeric"
                            id="cvv"
                            name="cvv"
                            className="form-input"
                            placeholder=" "
                            value={formData.cvv}
                            onChange={handleChange}
                            maxLength={binData?.raw?.cvv || 4}
                            disabled={status === 'processing'}
                            autoComplete="off"
                            data-lpignore="true"
                            data-bwignore="true"
                        />
                        <label className="floating-label" htmlFor="cvv">CVV</label>
                        <div
                            className="cvv-hint-icon"
                            onMouseEnter={() => setShowCVVTooltip(true)}
                            onMouseLeave={() => setShowCVVTooltip(false)}
                            aria-label="O que é o CVV?"
                        >
                            ?
                        </div>
                    </div>
                    {/* Full Tooltip Content Restoration */}
                    {showCVVTooltip && (
                        <div className="cvv-tooltip">
                            <div className="tooltip-content">
                                Código de 3 dígitos impresso no verso do cartão
                            </div>
                            <div className="cvv-card-visual">
                                <div className="card-back">
                                    <div className="magnetic-strip"></div>
                                    <div className="signature-strip">
                                        <div className="cvv-code">123</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
            </div>

            {/* Row 3: CPF */}
            <div className="form-group">
                <div className={`input-wrapper ${errors.cpf ? 'error' : ''}`}>
                    <input
                        type="tel"
                        inputMode="numeric"
                        id="cpf"
                        name="cpf"
                        className="form-input"
                        placeholder=" "
                        value={formData.cpf}
                        onChange={handleChange}
                        maxLength="14"
                        disabled={status === 'processing'}
                        autoComplete="off"
                        data-lpignore="true"
                        data-bwignore="true"
                    /><label className="floating-label" htmlFor="cpf">CPF do titular</label>
                </div>
                {errors.cpf && <span className="error-message">{errors.cpf}</span>}
            </div>

            <button type="submit" className="submit-button" disabled={status === 'processing' || !!globalError || !!binError}>
                {status === 'processing' ? (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>
                ) : (
                    <>
                        <span>Pagar {config?.amount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: config.currency || 'BRL' }).format(config.amount) : 'R$ 150,00'}</span>
                        <div className="btn-icon">→</div>
                    </>
                )}
            </button>

            {/* Acceptance Bar */}
            <div className="acceptance-bar" role="group" aria-labelledby="brand-label">
                <div className="acceptance-logos">
                    {(config?.voucherBrands || ['pluxee', 'vr', 'alelo', 'ticket']).map(brand => {
                        const LogoComponent = Logos[brand];
                        if (!LogoComponent) return null;
                        return (
                            <LogoComponent
                                key={brand}
                                className={getBrandClass(brand)}
                                role="img"
                                aria-label={brand.charAt(0).toUpperCase() + brand.slice(1)}
                                aria-pressed={cardBrand === brand}
                            />
                        );
                    })}
                </div>
            </div>

        </form >
    );
};

export default VoucherForm;
