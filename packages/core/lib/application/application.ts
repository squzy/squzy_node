import fetch from "cross-fetch";
import { ITransaction, createTransaction } from "../transaction/transaction";
import { Type } from "../enums/enums";

export interface Options {
  apiHost: string;
  host: string;
  name: string;
  agentId?: string;
}

export interface Creator {
  createTransaction(
    name: string,
    type: Type,
    parent?: string | ITransaction
  ): ITransaction;
}

export interface IApp extends Creator {
  getId(): string;
  getHost(): string;
  getTracingHeaderKey(): string;
  getApiHost(): string;
}

class Application implements IApp {
  constructor(
    private id: string,
    private host: string,
    private apiHost: string,
    private tracingHeader: string
  ) {}

  getId() {
    return this.id;
  }

  getHost() {
    return this.host;
  }

  getApiHost() {
    return this.apiHost;
  }

  getTracingHeaderKey() {
    return this.tracingHeader;
  }

  createTransaction<T>(
    name: string,
    type: Type,
    parent: string | ITransaction = null
  ): ITransaction {
    if (!parent) {
      return createTransaction<T>(name, type, this, null);
    }
    if (typeof parent === "string") {
      return createTransaction<T>(name, type, this, parent);
    }
    return createTransaction<T>(name, type, this, parent.getId());
  }
}

export function createApplication(opts: Options): Promise<IApp> {
  return fetch(`${opts.apiHost}/v1/applications`, {
    method: "POST",
    body: JSON.stringify({
      name: opts.name,
      host: opts.host,
    }),
  })
    .then<{
      data: {
        application_id: string;
        tracing_header: string;
      };
    }>((body) => body.json())
    .then(
      (res) =>
        new Application(
          res.data.application_id,
          opts.host,
          opts.apiHost,
          res.data.tracing_header
        )
    );
}
