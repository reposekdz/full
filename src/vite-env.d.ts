/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_MTN_FEE_PERCENT: string;
    readonly VITE_BPR_FEE_PERCENT: string;
    readonly VITE_EQUITY_FEE_PERCENT: string;
    readonly VITE_AIRTEL_FEE_PERCENT: string;
    readonly VITE_GT_BANK_ENABLED: string;
    readonly VITE_GT_BANK_NAME: string;
    readonly VITE_GT_BANK_API_URL: string;
    readonly VITE_GT_BANK_MERCHANT_ID: string;
    readonly VITE_BPR_ENABLED: string;
    readonly VITE_BPR_NAME: string;
    readonly VITE_BPR_API_URL: string;
    readonly VITE_BPR_MERCHANT_ID: string;
    readonly VITE_EQUITY_ENABLED: string;
    readonly VITE_EQUITY_NAME: string;
    readonly VITE_EQUITY_API_URL: string;
    readonly VITE_EQUITY_MERCHANT_ID: string;
    readonly VITE_MTN_ENABLED: string;
    readonly VITE_MTN_NAME: string;
    readonly VITE_MTN_API_URL: string;
    readonly VITE_MTN_COLLECTION_ID: string;
    readonly VITE_AIRTEL_ENABLED: string;
    readonly VITE_AIRTEL_NAME: string;
    readonly VITE_AIRTEL_API_URL: string;
    readonly VITE_AIRTEL_MERCHANT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
