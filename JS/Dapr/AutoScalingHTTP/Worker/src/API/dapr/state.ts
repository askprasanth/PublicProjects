// https://github.com/dapr/docs/blob/master/reference/api/state_api.md

import fetch from 'node-fetch';

interface IKeyValuePair {
  key: string;
  value: string;
}

export default class DaprState {
  url: string;
  urlDapr: string;
  port: number;

  constructor(daprUrl, daprPort) {
    this.url = daprUrl || "127.0.0.1";
    this.port = daprPort || 3500;

    if (!this.url.startsWith('http://') && !this.url.startsWith('https://')) {
      this.url = `http://${this.url}`;
    }

    this.urlDapr = `${this.url}:${this.port}/v1.0`;
  }

  async save(storeName: string, stateObjects: IKeyValuePair[]): Promise<number> {
    const req = await fetch(`${this.urlDapr}/state/${storeName}`, {
      method: 'POST',
      body: JSON.stringify(stateObjects)
    });

    let json;

    switch (req.status) {
      case 200: // OK
        json = await req.json();
        return json;
        break;
      case 204: // NO_CONTENT
        return null;
        break;
      case 400: // BAD_REQUEST
        json = await req.json();
        throw new Error(JSON.stringify(json));
        break;
      case 500: // INTERNAL_SERVER_ERROR
        json = await req.json();
        throw new Error(JSON.stringify(json));
        break;
      default:
        return null;
    }
  }

  async get(storeName: string, key: string): Promise<object> {
    const req = await fetch(`${this.urlDapr}/state/${storeName}/${key}`)

    let json;

    // @todo (200, 204, 400, 500)
    switch (req.status) {
      case 200: // OK
        json = await req.json();
        return json;
        break;
      case 204: // NO_CONTENT
        console.log(req.status);
        console.log(req.statusText);
        return null;
        break;
      case 400: // BAD_REQUEST
        json = await req.json();
        throw new Error(JSON.stringify(json));
        break;
      case 500: // INTERNAL_SERVER_ERROR
        json = await req.json();
        throw new Error(JSON.stringify(json));
        break;
      default:
        return null;
    }
  }

  async delete(storeName: string, key: string): Promise<number> {
    const req = await fetch(`${this.urlDapr}/state/${storeName}/${key}`, {
      method: 'DELETE'
    });

    return req.status;
  }
}
