export { };

declare global {
    interface Window {
        fbAsyncInit: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FB: any;
        _fbInitialized?: string | boolean;
    }
}
