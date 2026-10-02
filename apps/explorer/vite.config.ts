import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({root: fileURLToPath(new URL('.', import.meta.url)), plugins:[react()], build:{outDir:'../../dist/explorer',emptyOutDir:true, rollupOptions:{treeshake:false,output:{manualChunks:{three:['three','three/addons/controls/OrbitControls.js'],react:['react','react-dom/client']}}}}, server:{host:'0.0.0.0'}});
