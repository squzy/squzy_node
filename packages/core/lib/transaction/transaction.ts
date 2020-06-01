import { nanoid } from "nanoid";
import { Type, Status } from "../enums/enums";

export interface TransactionOpts {
  name: string;
  applicationInfo: {
    id: string;
    host: string;
  };
  parent?: string;
  type: Type;
}

interface Meta {
  host?: string;
  path?: string;
  method: string;
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
  error?: {
    message: string;
  };
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

  private dateTo = null;

  private commited = false;

  private meta: Meta;

  private status: Status;

  constructor(protected opts: TransactionOpts) {}

  setStatus(status: Status, end = true) {
    this.status = status;
    if (end) {
      this.dateTo = new Date();
    }
  }

  setMeta(meta: Meta) {
    if (!meta) {
      return this;
    }
    this.meta = meta;
    return this;
  }

  end(status: Status = Status.TRANSACTION_SUCCESSFUL, error: Error = null) {
    if (!this.meta || this.commited) {
      return;
    }
    this.commited = true;
    const dateTo = new Date();

    const req = {
      id: this.id,
      dateFrom: this.dateFrom.toISOString(),
      dateTo:
        (this.dateTo && this.dateTo.toISOString()) || dateTo.toISOString(),
      parentId: (this.opts.parent && this.opts.parent) || null,
      name: this.opts.name,
      type: this.opts.type,
      status: this.status || status,
      meta: this.meta,
    } as TransactionCommitMsg;

    if (status === Status.TRANSACTION_FAILED) {
      req.error =
        error && error instanceof Error
          ? { message: error.message }
          : undefined;
    }

    try {
      fetch(
        `${this.opts.applicationInfo.host}/v1/applications/${this.opts.applicationInfo.id}/transactions`,
        {
          method: "POST",
          body: JSON.stringify(req),
        }
      );
    } catch (err) {}
  }

  createTransaction<R>(name: string, type: Type): Transaction<R> {
    return new Transaction({
      name,
      parent: this.id,
      applicationInfo: this.opts.applicationInfo,
      type,
    });
  }
}
