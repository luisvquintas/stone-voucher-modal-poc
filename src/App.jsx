import React, { useState } from 'react';
import CheckoutModal from './components/CheckoutModal';
import VoucherForm from './components/VoucherForm';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const paymentConfig = {
    amount: 150.00,
    currency: 'BRL',
    voucherTypes: ['alimentação', 'refeição'],
    voucherBrands: ['pluxee', 'vr', 'alelo', 'ticket'],
    publicKey: 'pk_moNn00LhxPH2nedP',
    env: 'staging'
  };

  const handleVoucherSubmit = (data) => {
    console.log('Voucher Data Submitted:', data);
    alert('Dados enviados para console! (Simulação de Tokenização)');
    handleCloseModal();
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Nuvemshop Voucher Integration</h1>
      <p style={{ margin: '20px 0', color: 'var(--color-text-muted)' }}>
        Simulação do checkout com Voucher
      </p>

      <button
        onClick={handleOpenModal}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Finalizar Compra com Voucher
      </button>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        config={paymentConfig}
      >
        <VoucherForm onSubmit={handleVoucherSubmit} config={paymentConfig} />
      </CheckoutModal>
    </div>
  );
}

export default App;
