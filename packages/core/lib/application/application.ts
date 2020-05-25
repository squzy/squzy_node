import fetch from "cross-fetch";
import { Transaction } from "../transaction/transaction";
import { Type } from "../enums/enums";

export interface Options {
  monitoringHost: string;
  name: string;
  host: string;
}

export class Application {
  constructor(private id: string, private host: string) {}

  createTransaction<T>(
    name: string,
    type: Type,
    parent: string = null
  ): Transaction<T> {
    return new Transaction<T>({
      name,
      applicationInfo: {
        id: this.id,
        host: this.host,
      },
      type,
      parent,
    });
  }
}

export function createApplication(opts: Options): Promise<Application> {
  return fetch(`${opts.monitoringHost}/v1/applications`, {
    method: "POST",
    body: JSON.stringify({
      name: opts.name,
      host: opts.monitoringHost,
    }),
  })
    .then<{
      data: {
        application_id: string;
      };
    }>((body) => body.json())
    .then(
      (res) => new Application(res.data.application_id, opts.monitoringHost)
    );
}
