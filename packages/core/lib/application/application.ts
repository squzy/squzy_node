import fetch from 'cross-fetch';
import { Transaction } from '../transaction/transaction';

class Application {
    constructor(private id: string, private parentId: string = "") {}

    createTransaction(name: string): Transaction {
        return new Transaction(name, this.id)
    }

}

export function createApplication(monitoringHost: string, name: string, host: string): Promise<Application> {
    return fetch(`${monitoringHost}/v1/applications`, {
        method: "POST",
        body: JSON.stringify({
            name,
            host,
        })
    }).then<{data: {
        application_id: string
    }}>((body) => body.json())
    .then((res) => new Application(res.data.application_id))
}