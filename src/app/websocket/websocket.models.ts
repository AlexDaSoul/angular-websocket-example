import { IMessage, IWsMessage } from './websocket.interfaces';
import { WS_API } from './websocket.events';


export class Message implements IMessage {
    constructor(public id: number, public text: string) {
    }
}

export const modelParser = (message: IWsMessage) => {
    if (message && message.buffer) {
        /* binary parse */
        const encodeUint8Array = String.fromCharCode.apply(String, new Uint8Array(message.buffer.data));
        const parseData = JSON.parse(encodeUint8Array);

        let data: IMessage[] | number | string[];

        switch (message.event) {
            case WS_API.EVENTS.MESSAGES: // if messages set IMessage[]
                const messages = [];

                parseData.forEach((messageData: IMessage) => {
                    messages.push(
                        new Message(messageData.id, messageData.text)
                    );
                });

                data = messages;
                break;

            case WS_API.EVENTS.COUNTER: // if counter set number
                data = parseData;
                break;

            case WS_API.EVENTS.UPDATE_TEXTS: // if text set string
                const texts = [];

                parseData.forEach((textData: string) => {
                    texts.push(textData);
                });

                data = texts;
                break;
        }

        return data;
    } else {
        console.log(`[${Date()}] Buffer is "undefined"`);
    }
};
