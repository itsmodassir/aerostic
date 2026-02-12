export { };

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
        _fbInitialized?: boolean;
    }
}
