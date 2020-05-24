import { Request, Response, NextFunction, response } from "express";
import { Application, Type, Transaction } from "@squzy/core";

class ExpressTransaction<T> extends Transaction<T> {
  commit() {
    const startTime = new Date();
    const res = this.fn(this);
    return res;
  }
}

export function createMiddleware(app: Application) {
  return (req: Request, res: Response, next: NextFunction) => {
    const trx = app.createTransaction(
      req.baseUrl + req.path,
      Type.TRANSACTION_TYPE_ROUTER,
      () => next()
    );
    response.locals.__squzy_transaction = trx;
    trx.commit();
  };
}
