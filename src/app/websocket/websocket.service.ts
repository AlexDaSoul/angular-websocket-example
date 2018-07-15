import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { sha256 } from 'js-sha256';

import { ITopic, IWebsocketService, WebSocketConfig } from './websocket.interfaces';
import { config } from './websocket.config';
import { WS_API } from './websocket.events';
import { modelParser } from './websocket.models';


@Injectable({
    providedIn: 'root'
})
export class WebsocketService implements IWebsocketService, OnDestroy {

    private listeners: { [topic: string]: ITopic<any> };
    private uniqueId: number;
    private websocket: ReconnectingWebSocket;

    constructor(@Inject(config) private wsConfig: WebSocketConfig) {
        this.uniqueId = -1;
        this.listeners = {};

        // run connection
        this.connect();
    }

    ngOnDestroy() {
        this.websocket.close();
    }


    /*
    * connect to WebSocked
    * */
    private connect(): void {
        // ReconnectingWebSocket config
        const options = {
            connectionTimeout: 1000,
            maxRetries: 10,
            ...this.wsConfig.options
        };

        // connect to WebSocked
        this.websocket = new ReconnectingWebSocket(this.wsConfig.url, [], options);

        this.websocket.addEventListener('open', (event: Event) => {
            console.log(`[${Date()}] WebSocket connected!`);
        });

        this.websocket.addEventListener('close', (event: CloseEvent) => {
            console.log(`[${Date()}] WebSocket close!`);
        });

        this.websocket.addEventListener('error', (event: ErrorEvent) => {
            console.error(`[${Date()}] WebSocket error!`);
        });

        this.websocket.addEventListener('message', (event: MessageEvent) => {
            // dispatch message to subscribers
            this.onMessage(event);
        });
    }


    /*
    * call messages to Subject
    * */
    private callMessage<T>(topic: ITopic<T>, data: T): void {
        for (const key in topic) {
            if (topic.hasOwnProperty(key)) {
                const subject = topic[key];

                if (subject) {
                    // dispatch message to subscriber
                    subject.next(data);
                } else {
                    console.log(`[${Date()}] Topic Subject is "undefined"`);
                }
            }
        }
    }


    /*
    * dispatch messages to subscribers
    * */
    private onMessage(event: MessageEvent): void {
        const message = JSON.parse(event.data);

        for (const name in this.listeners) {
            if (this.listeners.hasOwnProperty(name) && !(this.wsConfig.ignore || []).includes(message.event)) {
                const topic = this.listeners[name];
                const keys = name.split('/'); // if multiple events
                const isMessage = keys.includes(message.event);
                const data = modelParser(message); // get model

                if (isMessage && typeof data !== 'undefined') {
                    this.callMessage<any>(topic, data);
                }
            }
        }
    }


    /*
    * add topic for subscribers
    * */
    private addTopic<T>(topic: string, id?: number): Subject<T> {
        const token = (++this.uniqueId).toString(); // token for personal subject
        const key = id ? token + id : token; // id for more personal subject
        const hash = sha256.hex(key); // set hash for personal

        if (!this.listeners[topic]) {
            this.listeners[topic] = <any>{};
        }

        if (this.listeners[topic][hash]) { // if double subscribe to one subject
            const filterKey = Object.keys(WS_API.EVENTS).filter(k => WS_API.EVENTS[k] === topic)[0];
            console.log(`[${Date()}] addEventListener try's to add duplicate callback function for event \ ${filterKey} \.`);
        }

        return this.listeners[topic][hash] = new Subject<T>();
    }


    /*
    * remove topic
    * */
    private removeTopic(topic: string, id?: number): void {
        const token = (++this.uniqueId).toString(); // token for personal subject
        const key = id ? token + id : token; // id for more personal subject
        const hash = sha256.hex(key); // set hash for personal

        if (this.listeners[topic][hash]) {
            delete this.listeners[topic][hash];
        } else {
            // if not topic
            const filterKey = Object.keys(WS_API.EVENTS).filter(k => WS_API.EVENTS[k] === topic)[0];
            console.log(`[${Date()}] removeEventListener try's to unsubscribe
            callback from event \ ${filterKey} \ but already unsubscribed.`);
        }
    }


    /*
    * subscribe method
    * */
    public addEventListener<T>(topics: string | string[], id?: number): Observable<T> {
        if (topics) {
            const topicsKey = typeof topics === 'string' ? topics : topics.join('/'); // one or multiple

            return this.addTopic<T>(topicsKey, id).asObservable();
        } else {
            console.log(`[${Date()}] Can't add EventListener. Type of event is "undefined".`);
        }
    }


    /*
    * unsubscribe method
    * */
    public removeEventListener(topics: string | string[], id?: number): void {
        if (topics) {
            const topicsKey = typeof topics === 'string' ? topics : topics.join('/');  // one or multiple

            return this.removeTopic(topicsKey, id);
        } else {
            console.log(`[${Date()}] Can't remove EventListener. Type of event is "undefined".`);
        }
    }


    /*
    * on message to server
    * */
    public sendMessage(event: string, data: any = {}): void {
        if (event && this.websocket.readyState === 1) {
            this.websocket.send(JSON.stringify({event, data}));
        } else {
            console.log('Send error!');
        }
    }

}
