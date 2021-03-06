import { User } from './user'
// import { Action } from '../services/chat.service';

export enum ChatMessageType {
    TEXT,
    FILE,
    LINK,
    GIPHY
}
export interface ChatMessage {
    date: Number,
    user: User;
    content: String;
    type: ChatMessageType;
    // action: Action;
}