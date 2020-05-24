import { nanoid } from "nanoid";
import { Type, Status } from "../enums/enums";

export interface TransactionOpts {
  name: string;
  applicationId: string;
  parent?: Transaction<any>;
  type: Type;
}

export interface CommitMsg {
  error?: Error;
  meta?: {
    host: string;
    path: string;
  };
  status: Status;
}

export class Transaction<T> {
  protected id = nanoid();

  constructor(
    protected opts: TransactionOpts,
    protected fn: (trx: Transaction<T>) => T
  ) {}

  commit(): T {
    const startTime = new Date();
    try {
      // if okey
      const result = this.fn(this);
      this._commit(startTime, new Date());
      return result;
    } catch (err) {
      // if throw error commit and send error
      this._commit(startTime, new Date(), {
        status: Status.TRANSACTION_FAILED,
        error: err,
      });
      throw err;
    }
  }

  getId() {
    return this.id;
  }

  getApplicationId() {
    return this.opts.applicationId;
  }

  protected _commit(from: Date, to: Date, msg?: CommitMsg) {}

  createTransaction<R>(
    name: string,
    type: Type,
    fn: (trx: Transaction<R>) => R
  ): Transaction<R> {
    return new Transaction(
      {
        name,
        parent: this,
        applicationId: this.opts.applicationId,
        type,
      },
      fn
    );
  }
}
