//format of api response
import { Message } from "../model/User";

export interface ApiResponse {
    success: boolean,
    responseMessage: string,
    isAcceptingMessages?: boolean,
    messages?: Message[] //to send the user messages in response for the user dashboard
}