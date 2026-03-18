//format of api response
import { Message } from "../model/User";
import {User} from "../model/User";

export interface ApiResponse {
    success: boolean,
    responseMessage: string,
    isAcceptingMessages?: boolean,
    messages?: Message[] //to send the user messages in response for the user dashboard
    pagination?: {
        page: number,
        pageSize: number,
        totalMessages: number,
        totalPages: number,
        hasNextPage: boolean,
        hasPrevPage: boolean
    },
    user?: User //to send the user data in response for the user dashboard if needed
}