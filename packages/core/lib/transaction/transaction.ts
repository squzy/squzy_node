import { nanoid } from 'nanoid'

export class Transaction {

    private id = nanoid()

    constructor(
        private name: string,
        private applicationId: string,
        private parentId: string = ""
        ){
    }

    createTransaction(name: string): Transaction {
        return new Transaction(name, this.applicationId, this.id)
    }
}