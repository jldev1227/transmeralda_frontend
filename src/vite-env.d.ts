/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Añade aquí otras variables de entorno que vayas a usar
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  