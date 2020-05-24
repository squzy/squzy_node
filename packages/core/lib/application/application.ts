import fetch from "cross-fetch";
import { Transaction } from "../transaction/transaction";
import { Type } from "../enums/enums";

export class Application {
  constructor(private id: string) {}

  createTransaction<T>(
    name: string,
    type: Type,
    fn: (trx: Transaction<T>) => T
  ): Transaction<T> {
    return new Transaction(
      {
        name,
        applicationId: this.id,
        type,
      },
      fn
    );
  }
}

export function createApplication(
  monitoringHost: string,
  name: string,
  host: string
): Promise<Application> {
  return fetch(`${monitoringHost}/v1/applications`, {
    method: "POST",
    body: JSON.stringify({
      name,
      host,
    }),
  })
    .then<{
      data: {
        application_id: string;
      };
    }>((body) => body.json())
    .then((res) => new Application(res.data.application_id));
}
