import { Request, Response } from "express";
import { Application, Type, Status, Transaction } from "@squzy/core";
import * as onFinished from "on-finished";

const _key = "squzy_express";

export function createMiddleware(app: Application) {
  return (req: Request, res: Response) => {
    const path = req.baseUrl + req.route.path;
    const trx = app.createTransaction(
      req.baseUrl + req.route.path,
      Type.TRANSACTION_TYPE_ROUTER
    );
    res.locals[_key] = trx;
    onFinished(res, (err, _) => {
      if (err) {
        return trx
          .setMeta({
            meta: {
              path,
            },
            status: Status.TRANSACTION_FAILED,
            error: err,
          })
          .end();
      }
      return trx
        .setMeta({
          meta: {
            path,
          },
          status: Status.TRANSACTION_SUCCESSFUL,
        })
        .end();
    });
  };
}

export function getCurrentTransaction<T>(res: Response): Transaction<T> {
  return res.locals[_key];
}
