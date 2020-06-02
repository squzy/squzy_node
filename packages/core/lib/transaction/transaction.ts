import { nanoid } from "nanoid";
import { Type, Status } from "../enums/enums";
import { Application } from "../application/application";

export interface TransactionOpts {
  name: string;
  parent?: string;
  type: Type;
}

export interface Meta {
  host?: string;
  path?: string;
  method: string;
}

interface TransactionCommitMsg {
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

export class Transaction<T> {
  id = nanoid();

  private dateFrom = new Date();

  private dateTo = null;

  private commited = false;

  private meta: Meta;

  private error: {
    message: string;
  } = null;

  private status: Status;

  constructor(
    protected opts: TransactionOpts,
    private application: Application
  ) {}

  setStatus(status: Status, end = true) {
    this.status = status;
    if (end) {
      this.dateTo = new Date();
    }
    return this;
  }

  setMeta(meta: Meta) {
    if (!meta) {
      return this;
    }
    this.meta = meta;
    return this;
  }

  setError(error: Error = null) {
    if (!error || !(error instanceof Error) || this.error) {
      return this;
    }
    this.error = {
      message: error.message,
    };
    return this;
  }

  end(status: Status = Status.TRANSACTION_SUCCESSFUL, error: Error = null) {
    if (!this.meta || this.commited || !this.opts) {
      return;
    }
    this.commited = true;
    const finalStatus = this.status || status;
    const req = {
      id: this.id,
      dateFrom: this.dateFrom.toISOString(),
      dateTo:
        (this.dateTo && this.dateTo.toISOString()) || new Date().toISOString(),
      parentId: this.opts.parent || null,
      name: this.opts.name,
      type: this.opts.type,
      status: finalStatus,
      meta: this.meta,
      error: finalStatus === Status.TRANSACTION_SUCCESSFUL ? null : this.error,
    } as TransactionCommitMsg;

    if (status === Status.TRANSACTION_FAILED && !this.error) {
      req.error =
        error && error instanceof Error
          ? { message: error.message }
          : undefined;
    }

    try {
      fetch(
        `${this.application.getMonitoringHost()}/v1/applications/${this.application.getId()}/transactions`,
        {
          method: "POST",
          body: JSON.stringify(req),
        }
      );
    } catch (err) {}
  }

  createTransaction<R>(name: string, type: Type): Transaction<R> {
    return new Transaction(
      {
        name,
        parent: this.id,
        type,
      },
      this.application
    );
  }
}
