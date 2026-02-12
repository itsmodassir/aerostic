export { };

declare global {
    interface Window {
        FB: any;
        _fbInitialized: boolean;
    }
}
