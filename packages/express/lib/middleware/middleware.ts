import { Request, Response, NextFunction } from "express";
import { IApp, Type, Status, ITransaction } from "@squzy/core";
import * as onFinished from "on-finished";

const _key = "__squzy_transaction";

export function createMiddleware(app: IApp) {
  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.baseUrl + ((req.route && req.route.path) || "");
    const trx = app.createTransaction(
      path,
      Type.TRANSACTION_TYPE_ROUTER,
      req.header(app.getTracingHeaderKey())
    );
    const method = req.method;
    trx.setMeta({
      path,
      method,
      host: app.getHost(),
    });
    res.locals[_key] = trx;

    onFinished(res, (err, _) => {
      if (err) {
        return trx.end(Status.TRANSACTION_FAILED, err);
      }
      return trx.end(Status.TRANSACTION_SUCCESSFUL);
    });
    next();
  };
}

export function getCurrentTransaction<T>(res: Response): ITransaction {
  return res.locals[_key];
}
