import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

console.log('Echo.ts: Initializing Pusher and Echo');
console.log('VITE_PUSHER_APP_KEY:', import.meta.env.VITE_PUSHER_APP_KEY);
console.log('VITE_PUSHER_APP_CLUSTER:', import.meta.env.VITE_PUSHER_APP_CLUSTER);

// @ts-expect-error Pusher types not available globally
window.Pusher = Pusher;

try {
    // @ts-expect-error Echo types not available globally
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming'],
    });

    // Add connection event listeners for debugging
    if (window.Echo && window.Echo.connector && window.Echo.connector.pusher) {
        const pusher = window.Echo.connector.pusher;

        pusher.connection.bind('connected', () => {
            console.log('Echo: Successfully connected to Pusher');
        });

        pusher.connection.bind('connecting', () => {
            console.log('Echo: Connecting to Pusher...');
        });

        pusher.connection.bind('disconnected', () => {
            console.log('Echo: Disconnected from Pusher');
        });

        pusher.connection.bind('error', (error: unknown) => {
            console.error('Echo: Connection error:', error);
        });

        pusher.connection.bind('unavailable', () => {
            console.error('Echo: Connection unavailable');
        });

        pusher.connection.bind('failed', () => {
            console.error('Echo: Connection failed');
        });
    }

    console.log('Echo.ts: Echo initialized successfully:', !!window.Echo);
} catch (error) {
    console.error('Echo.ts: Failed to initialize Echo:', error);
    // Set a fallback mechanism if Echo fails to initialize
    window.Echo = undefined;
}
