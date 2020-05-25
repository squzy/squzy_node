import { nanoid } from "nanoid";
import { Type, Status } from "../enums/enums";

export interface TransactionOpts {
  name: string;
  applicationInfo: {
    id: string;
    host: string;
  };
  parent?: Transaction<any>;
  type: Type;
}

interface Meta {
  host?: string;
  path?: string;
}

export interface CommitMsg {
  error?: Error;
  meta?: Meta;
  status: Status;
}

export interface TransactionCommitMsg {
  id: string;
  parentId?: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  status: Status;
  type: Type;
  error?: string;
  meta?: Meta;
}

export interface CommitMsg {
  status: Status;
  meta?: Meta;
  error?: Error;
}

export class Transaction<T> {
  id = nanoid();

  private dateFrom = new Date();

  private meta: TransactionCommitMsg;

  constructor(protected opts: TransactionOpts) {}

  setMeta(msg: CommitMsg) {
    if (!msg) {
      return this;
    }
    const dateTo = new Date();
    const basicMeta = {
      id: this.id,
      dateFrom: this.dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      parentId: (this.opts.parent && this.opts.parent.id) || null,
      name: this.opts.name,
      type: this.opts.type,
    };
    if (msg.status === Status.TRANSACTION_SUCCESSFUL) {
      this.meta = {
        ...basicMeta,
        meta: msg.meta || null,
        status: Status.TRANSACTION_SUCCESSFUL,
      };
      return this;
    }
    this.meta = {
      ...basicMeta,
      status: Status.TRANSACTION_FAILED,
      error: msg.error.message && null,
    };

    return this;
  }

  end() {
    if (!this.meta) {
      return;
    }
    fetch(
      `${this.opts}/v1/applications/${this.opts.applicationInfo.id}/transactions`,
      {
        method: "POST",
        body: JSON.stringify(this.meta),
      }
    );
  }

  createTransaction<R>(name: string, type: Type): Transaction<R> {
    return new Transaction({
      name,
      parent: this,
      applicationInfo: this.opts.applicationInfo,
      type,
    });
  }
}
