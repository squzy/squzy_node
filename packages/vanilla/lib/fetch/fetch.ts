import {
  createApplication,
  Options,
  Type,
  Status,
  Transaction,
} from "@squzy/core";
import * as parseURI from "uri-parse-lib";

export function createFetch(opts: Options) {
  const _app = createApplication(opts);
  return (input: RequestInfo, init?: RequestInit, parentId?: string) => {
    return _app.then((app) => {
      let transactionName;
      let reqUrl;
      let method = "GET";
      if (typeof input === "string") {
        transactionName = input;
        reqUrl = input;
      } else {
        transactionName = input.url;
        reqUrl = input.url;
        method = input.method || "GET";
      }
      if (reqUrl.startsWith("/")) {
        reqUrl = location.host + reqUrl;
      }
      const { host, pathname } = parseURI(reqUrl);
      const trx = app.createTransaction(
        transactionName,
        Type.TRANSACTION_TYPE_FETCH,
        parentId || null
      );
      return fetch(input, init)
        .then((res) => {
          trx
            .setMeta({
              status: Status.TRANSACTION_SUCCESSFUL,
              meta: {
                host,
                path: pathname,
                method,
              },
            })
            .end();
          return res;
        })
        .catch((err) => {
          trx
            .setMeta({
              status: Status.TRANSACTION_FAILED,
              meta: {
                host,
                path: pathname,
                method,
              },
              error: err,
            })
            .end();
          return new Error(err);
        });
    });
  };
}
