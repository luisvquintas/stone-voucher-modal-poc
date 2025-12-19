import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/embed.jsx'),
            name: 'StoneVoucherModal',
            fileName: (format) => `stone-voucher-modal.${format}.js`,
            formats: ['umd'] // UMD for script tag usage
        },
        rollupOptions: {
            // For a standalone widget, we usually BUNDLE React to avoid dependency hell for the host site
            // unless we know the host provides it. For an ecommerce plugin, safe bet is to bundle.
            external: [],
            output: {
                globals: {}
            }
        },
        // Ensure CSS is output
        cssCodeSplit: false
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});
