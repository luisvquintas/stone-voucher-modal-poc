/**
 * Service to handle Pagar.me interactions.
 * 
 * Documentation: https://docs.pagar.me/reference/criar-token-cart%C3%A3o-1
 */

// TODO: Replace with actual Pagar.me Public Key
// TODO: Replace with actual Pagar.me Public Key
const PAGARME_PUBLIC_KEY = 'pk_test_todo_replace_me';

/**
 * Fetches BIN information to identify card brand from Pagar.me API.
 * 
 * API Endpoint: GET https://api.pagar.me/bin/v1/{bin}
 * Documentation: https://docs.pagar.me/reference/obter-informações-do-bin
 * 
 * @param {string} bin - First 6 digits of the card
 * @returns {Promise<Object>} BIN data with brand and card_type
 */
export const getBinInfo = async (bin) => {
    console.log('[Pagar.me] Fetching BIN info for:', bin);

    try {
        const response = await fetch(`https://api.pagar.me/bin/v1/${bin}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('[Pagar.me] BIN lookup failed with status:', response.status);
            return { brand: 'unknown', card_type: 'unknown' };
        }

        const data = await response.json();
        console.log('[Pagar.me] BIN data received:', data);

        /**
         * Expected response format:
         * {
         *   "bin": "603512",
         *   "brand": "sodexo",
         *   "card_type": "voucher",
         *   "card_sub_type": "alimentacao",
         *   "issuer": "Sodexo",
         *   "issuer_code": "000"
         * }
         */
        return {
            brand: data.brand || 'unknown',
            type: data.card_type || 'unknown',
            subType: data.card_sub_type || null,
            issuer: data.issuer || null,
            raw: data
        };

    } catch (error) {
        console.error('[Pagar.me] BIN lookup error:', error);
        // Return unknown on network/CORS errors
        return { brand: 'unknown', type: 'unknown' };
    }
};


/**
 * Creates a card token via Pagar.me API.
 * 
 * @param {Object} cardData 
 * @param {string} cardData.number
 * @param {string} cardData.holder_name
 * @param {string} cardData.exp_month
 * @param {string} cardData.exp_year
 * @param {string} cardData.cvv
 * @param {string} publicKey - Pagar.me Public Key
 * @param {string} [env='production'] - 'staging' or 'production'
 * @returns {Promise<string>} The card token
 */
export const createCardToken = async (cardData, publicKey = PAGARME_PUBLIC_KEY, env = 'production') => {
    console.log('[Pagar.me] Tokenizing card...', { publicKey, env });

    // Determine Base URL
    const baseUrl = env === 'staging'
        ? 'https://stgapi.mundipagg.com/core/v5/tokens'
        : 'https://api.pagar.me/core/v5/tokens';

    const url = `${baseUrl}?appId=${publicKey}`;

    const payload = {
        type: "card",
        card: {
            number: cardData.number.replace(/\s/g, ''),
            holder_name: cardData.holder_name,
            exp_month: parseInt(cardData.exp_month, 10),
            exp_year: parseInt(cardData.exp_year, 10),
            cvv: cardData.cvv
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Pagar.me] Tokenization error:', data);
            // Attempt to extract a friendly error message
            const message = data.message || (data.errors ? JSON.stringify(data.errors) : 'Erro ao gerar token');
            throw new Error(message);
        }

        console.log('[Pagar.me] Token created successfully:', data.id);
        return data.id; // The token ID, e.g., "token_xxxxxxxx"

    } catch (error) {
        console.error('[Pagar.me] Network/System error:', error);
        throw error;
    }
};
