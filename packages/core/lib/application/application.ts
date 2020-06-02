import fetch from "cross-fetch";
import { Transaction } from "../transaction/transaction";
import { Type } from "../enums/enums";

export interface Options {
  monitoringHost: string;
  host: string;
  name: string;
}

export class Application {
  constructor(
    private id: string,
    private host: string,
    private monitoringHost: string,
    private tracingHeader: string
  ) {}

  getId() {
    return this.id;
  }

  getHost() {
    return this.host;
  }

  getMonitoringHost() {
    return this.monitoringHost;
  }

  getTracingHeaderKey() {
    return this.tracingHeader;
  }

  createTransaction<T>(
    name: string,
    type: Type,
    parent: string = null
  ): Transaction<T> {
    return new Transaction<T>(
      {
        name,
        type,
        parent,
      },
      this
    );
  }
}

export function createApplication(opts: Options): Promise<Application> {
  return fetch(`${opts.monitoringHost}/v1/applications`, {
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
          opts.monitoringHost,
          res.data.tracing_header
        )
    );
}
