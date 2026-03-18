export interface Message {
    id: string;
    content: string;
    createdAt: Date;
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}