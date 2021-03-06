// https://github.com/dapr/docs/blob/master/reference/api/state_api.md

import fetch from 'node-fetch';
import express from 'express';

interface FunctionDaprInputCallback {
  (data: object): Promise<any>;
}

export default class DaprBinding {
  url: string;
  urlDapr: string;
  port: number;

  constructor(daprUrl: string, daprPort) {
    this.url = daprUrl || "127.0.0.1";
    this.port = daprPort || 3500;

    if (!this.url.startsWith('http://') && !this.url.startsWith('https://')) {
      this.url = `http://${this.url}`;
    }

    this.urlDapr = `${this.url}:${this.port}/v1.0`;
  }

  // Receive an input from an external system
  receive(app: express, bindingName: string, cb: FunctionDaprInputCallback) {
    // app.use(express.json({ type: 'application/*+json' })); // Accept dapr format
    app.use(express.json()); // Accept dapr format

    app.post(`/${bindingName}`, async (req, res) => {
      await cb(req?.body);
      res.status(200).send();
    });
  }

  // Send an event to an external system
  async send(bindingName: string, data: object) {
    const req = await fetch(`${this.urlDapr}/bindings/${bindingName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data,
        operation: "create"
      })
    });

    let json;

    switch (req.status) {
      case 200: // OK
        return;
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
}
