import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { IMessage, WebsocketService, WS_API } from './websocket/index';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

    private messages$: Observable<IMessage[]>;
    private counter$: Observable<number>;
    private texts$: Observable<string[]>;

    public form: FormGroup;

    constructor(private fb: FormBuilder, private wsService: WebsocketService) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            text: [null, [
                Validators.required
            ]]
        });

        // get messages
        this.messages$ = this.wsService.addEventListener<IMessage[]>(WS_API.EVENTS.MESSAGES);

        // get counter
        this.counter$ = this.wsService.addEventListener<number>(WS_API.EVENTS.COUNTER);

        // get texts
        this.texts$ = this.wsService.addEventListener<string[]>(WS_API.EVENTS.UPDATE_TEXTS);
    }

    ngOnDestroy() {

    }

    public sendText(): void {
        if (this.form.valid) {
            this.wsService.sendMessage(WS_API.COMMANDS.SEND_TEXT, this.form.value.text);
            this.form.reset();
        }
    }

    public removeText(index: number): void {
        this.wsService.sendMessage(WS_API.COMMANDS.REMOVE_TEXT, index);
    }

}
