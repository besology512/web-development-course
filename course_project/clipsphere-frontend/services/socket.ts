import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface Notification {
    id: string;
    type: 'like' | 'tip' | 'comment' | 'follow';
    message: string;
    timestamp: Date;
    read?: boolean;
    likerUsername?: string;
    tiperUsername?: string;
    tipAmount?: number;
    videoTitle?: string;
    videoId?: string;
}

export class SocketService {
    private static instance: SocketService;
    private notificationListeners: Array<(notification: Notification) => void> = [];
    private connectionListeners: Array<(isConnected: boolean) => void> = [];

    private constructor() {}

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(token: string, serverUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') {
        if (socket?.connected) {
            console.log('✅ Socket already connected');
            return;
        }

        try {
            socket = io(serverUrl, {
                auth: {
                    token
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            // Connection events
            socket.on('connect', () => {
                console.log('✅ Socket connected:', socket?.id);
                this.notifyConnectionListeners(true);
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                this.notifyConnectionListeners(false);
            });

            socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });

            // Notification events
            socket.on('notification:new-like', (data) => {
                const notification: Notification = {
                    id: data.id,
                    type: 'like',
                    message: `${data.likerUsername} liked your video "${data.videoTitle}"`,
                    timestamp: new Date(data.timestamp),
                    likerUsername: data.likerUsername,
                    videoTitle: data.videoTitle,
                    videoId: data.videoId
                };
                this.notifyListeners(notification);
            });

            socket.on('notification:new-tip', (data) => {
                const notification: Notification = {
                    id: data.id,
                    type: 'tip',
                    message: `${data.tiperUsername} tipped $${data.tipAmount} on your video "${data.videoTitle}"`,
                    timestamp: new Date(data.timestamp),
                    tiperUsername: data.tiperUsername,
                    tipAmount: data.tipAmount,
                    videoTitle: data.videoTitle,
                    videoId: data.videoId
                };
                this.notifyListeners(notification);
            });

            socket.on('user:connected', (data) => {
                console.log('✅ User connected:', data);
            });

            socket.on('user:disconnected', (data) => {
                console.log('❌ User disconnected:', data);
            });

        } catch (error) {
            console.error('Failed to connect socket:', error);
        }
    }

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    isConnected(): boolean {
        return socket?.connected || false;
    }

    emitLike(videoOwnerId: string, likerUsername: string, videoTitle: string, videoId: string) {
        if (socket?.connected) {
            socket.emit('like:notify', {
                videoOwnerId,
                likerUsername,
                videoTitle,
                videoId
            });
        }
    }

    emitTip(videoOwnerId: string, tiperUsername: string, tipAmount: number, videoTitle: string, videoId: string) {
        if (socket?.connected) {
            socket.emit('tip:notify', {
                videoOwnerId,
                tiperUsername,
                tipAmount,
                videoTitle,
                videoId
            });
        }
    }

    markNotificationAsRead(notificationId: string) {
        if (socket?.connected) {
            socket.emit('notification:read', notificationId);
        }
    }

    onNotification(callback: (notification: Notification) => void): () => void {
        this.notificationListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
        };
    }

    onConnectionChange(callback: (isConnected: boolean) => void): () => void {
        this.connectionListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
        };
    }

    private notifyListeners(notification: Notification) {
        this.notificationListeners.forEach(listener => {
            try {
                listener(notification);
            } catch (error) {
                console.error('Notification listener error:', error);
            }
        });
    }

    private notifyConnectionListeners(isConnected: boolean) {
        this.connectionListeners.forEach(listener => {
            try {
                listener(isConnected);
            } catch (error) {
                console.error('Connection listener error:', error);
            }
        });
    }
}

export default SocketService.getInstance();
