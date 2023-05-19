// stores/counter.js
import { defineStore } from 'pinia';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { devEndpoint, prodEndpoint } from '../helpers/endpoint';

export const useDataStore = defineStore('data', {
    state: () => {
        return { codeInputValue: '', backendResponse: 'RefactorAI will respond here!' };
    },
    // could also be defined as
    // state: () => ({ count: 0 })
    actions: {
        async createRequest(prompt) {
            try {
                console.log('NODE_ENV: ', process.env.NODE_ENV);
                console.log('TEST ENV VAR: ', process.env.MY_ENV_VAR_1);
                // Prompt example: "Refactor: let x = 5; console.log('this is x:', x)"
                const endpoint = prodEndpoint;
                this.backendResponse = 'Thinking...';
                console.log(`${endpoint}/api`);
                const response = await axios.post(`${endpoint}/api`, {
                    prompt: `${prompt}: ${this.codeInputValue}`,
                });
                this.backendResponse = response.data.message.content;
                console.log('OpenAI Response! ', response);
                this.writeToMemento(this.$state);
            } catch (error) {
                console.error('There was a problem creating the non-stream server request!\n', error);
            }
        },
        async createStreamRequest(prompt) {
            try {
                // console.log('NODE_ENV: ', process.env.NODE_ENV);
                // console.log('TEST ENV VAR: ', process.env.MY_ENV_VAR_1);
                // Prompt example: "Refactor: let x = 5; console.log('this is x:', x)"
                const endpoint = prodEndpoint;
                this.backendResponse = 'Thinking...';
                // set up connection, then send POST request

                // const response = await axios.post(`${endpoint}/api/stream`, {
                //     prompt: `${prompt}: ${this.codeInputValue}`,
                // });
                const events = new EventSource(`${endpoint}/api/stream`);
                axios.post(`${endpoint}/api/stream`, {
                    prompt: `${prompt}: ${this.codeInputValue}`,
                });
                let response = '';
                events.addEventListener('message', (message) => {
                    console.log(message.data);
                    response = `${response} ${message.data}`;
                    this.backendResponse = response;
                });
                this.writeToMemento(this.$state);
            } catch (error) {
                console.error('There was a problem with creating the stream request!\n', error);
            }
        },
        async writeToMemento() {
            try {
                // console.log('Writing to memento:', this.$state);
                // Write to extension package, then write to Memento from there.
                // console.log('Writing to Memento:', this.$state);
                // eslint-disable-next-line no-undef
                await vscode.postMessage({
                    message: JSON.stringify(this.$state),
                });
            } catch (error) {
                console.error('There was a problem writing to Memento!\n ', error);
            }
        },
        async getFromMemento() {
            try {
                // console.log('getting from memento!');
                // eslint-disable-next-line no-undef
                await vscode.postMessage({
                    message: '{}',
                });
            } catch (error) {
                console.error('There was a problem with getting from Memento!\n ', error);
            }
        },
    },
});
