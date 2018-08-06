# Angular Websocket Example

> Angular service for WebSocket with Rx WebSocketSubject

## Installation
For angular 6:
```bash
$ git clone https://github.com/Angular-RU/angular-websocket-starter.git
$ cd angular-websocket-starter
$ npm install
$ npm run start
$ npm run server
```

## Example

#### Add WebSockets to your project

> in app module

Config ReconnectingWebSocket:
```typescript
Options = {
    WebSocket?: any; // WebSocket constructor, if none provided, defaults to global WebSocket
    maxReconnectionDelay?: number; // max delay in ms between reconnections
    minReconnectionDelay?: number; // min delay in ms between reconnections
    reconnectionDelayGrowFactor?: number; // how fast the reconnection delay grows
    minUptime?: number; // min time in ms do consider connection as stable
    connectionTimeout?: number; // retry connect if not connected after this time, in ms
    maxRetries?: number; // maximum number of retries
    debug?: boolean; // enables debug output
};
```

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebsocketModule } from './websocket';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        WebsocketModule.config({
            url: 'http:localhost:8080', // websocket url
			ignore: [WS_API.EVENTS.MESSAGES], // ignore events
			garbageCollectInterval: 30000, // remove topics without subscribes. default 10000
			options: { // ReconnectingWebSocket
				connectionTimeout: 5000,
				maxRetries: 10
			}
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
```


> in components

```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IMessage, WebsocketService, WS_API } from './websocket/index';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    private messages$: Observable<IMessage[]>;

    constructor(private wsService: WebsocketService) {
    }

    ngOnInit() {
        // get messages
        this.messages$ = this.wsService.on<IMessage[]>(WS_API.EVENTS.MESSAGES);
        // or
        this.messages$ = this.wsService.on<IMessage[]>([WS_API.EVENTS.MESSAGES, WS_API.EVENTS.MESSAGES_NEW]);
    }

    public sendMessge(): void {
        this.wsService.send(WS_API.COMMANDS.SEND_TEXT, 'My Message Text');
    }

}
```
