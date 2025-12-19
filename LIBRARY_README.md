# Stone Voucher Modal Library

Biblioteca JavaScript para renderizar um modal de pagamento estilo "Voucher" com validação de bin, tokenização (mock/real) e estilização da Stone (Jade Design System).

## Instalação

Inclua os arquivos de distribuição no seu projeto:

- `dist/stone-voucher-modal.umd.js`
- `dist/frontend.css`

## Uso Básico

Adicione um container onde o modal será montado (opcional, a lib cria se não existir) e inicialize o modal.

```html
<!-- Importar CSS -->
<link rel="stylesheet" href="path/to/dist/frontend.css">

<!-- Importar JS -->
<script src="path/to/dist/stone-voucher-modal.umd.js"></script>

<script>
  // Configuração e Abertura do Modal
  window.StoneVoucherModal.open({
    publicKey: 'pk_test_123456', // Sua chave pública Pagar.me
    amount: 15000, // Valor em centavos (R$ 150,00)
    currency: 'BRL',
    voucherBrands: ['pluxee', 'vr', 'alelo', 'ticket'],
    
    // Callbacks
    onSuccess: function(result) {
      console.log('Pagamento com sucesso!', result);
      // result = { 
      //   card_token: "token_xyz...", 
      //   card_brand: "pluxee" 
      // }
      alert('Token gerado: ' + result.card_token);
    },
    
    onError: function(error) {
      console.error('Erro no pagamento:', error);
      alert('Erro: ' + error.error);
    },
    
    onClose: function() {
      console.log('Modal fechado pelo usuário');
    }
  });
</script>
```

## Configuração

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `publicKey` | String | Sim | Chave pública do Pagar.me (pk_...) |
| `amount` | Number | Sim | Valor da transação em centavos |
| `currency` | String | Não | Moeda (padrão 'BRL') |
| `voucherBrands` | Array | Não | Lista de bandeiras aceitas |
| `onSuccess` | Function | Sim | Callback de sucesso |
| `onError` | Function | Sim | Callback de erro |
| `onClose` | Function | Não | Callback ao fechar modal |

## Funcionalidades

- **Detecção de Bandeira**: Automática via API de BIN.
- **Validação Dinâmica**: Formato do cartão e comprimento do CVV ajustam-se conforme a bandeira.
- **Design System**: Estilos visuais baseados na marca Stone (Verde/Neutros).
- **Responsivo**: Adaptado para mobile e desktop.
