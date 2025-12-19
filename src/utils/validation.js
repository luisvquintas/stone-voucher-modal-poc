/**
 * Validates a credit card number using the Luhn algorithm.
 * @param {string} value - The card number to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const luhnCheck = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return false;

    let nCheck = 0;
    let bEven = false;

    for (let n = cleanValue.length - 1; n >= 0; n--) {
        let cDigit = cleanValue.charAt(n),
            nDigit = parseInt(cDigit, 10);

        if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck % 10) === 0;
};

/**
 * Validates expiry date.
 * @param {string} month - 2 digit month
 * @param {string} year - 2 digit year
 * @returns {boolean} True if future date, false otherwise.
 */
export const validateExpiry = (month, year) => {
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    if (expMonth < 1 || expMonth > 12) return false;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
};

export const formatCPF = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/[^\d]+/g, '');
    if (cleanCPF === '' || cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cleanCPF.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cleanCPF.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) return false;
    return true;
};
