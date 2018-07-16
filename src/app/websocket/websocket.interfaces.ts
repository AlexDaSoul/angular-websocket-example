import { Options } from 'reconnecting-websocket';
import { Observable, Subject } from 'rxjs';

export interface IWebsocketService {
    addEventListener<T>(topics: string[], id?: number): Observable<T>;
    sendMessage(event: string, data: any): void;
}

export interface WebSocketConfig {
    url: string;
    ignore?: string[];
    garbageCollectInterval?: number;
    options?: Options;
}

export interface ITopic<T> {
    [hash: string]: Subject<T>;
}

export interface IBuffer {
    type: string;
    data: number[];
}

export interface IWsMessage {
    event: string;
    buffer: IBuffer;
}

export interface IMessage {
    id: number;
    text: string;
}
