import { createApplication, Options, Type, Status } from "@squzy/core";
import { parseURI } from "uri-parse-lib";

export function createFetch(opts: Options) {
  const _app = createApplication(opts);
  return (input: RequestInfo, init?: RequestInit, parentId?: string) => {
    return _app.then((app) => {
      let transactionName;
      let reqUrl;
      let method = "GET";
      let rqOpts: Request;
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
      if (typeof input === "string") {
        rqOpts = {
          method,
          url: input,
          headers: new Headers({
            [app.getTracingHeaderKey()]: trx.getId(),
          }),
        } as Request;
      } else {
        if (input.headers) {
          input.headers.append(app.getTracingHeaderKey(), trx.getId());
        }
        rqOpts = {
          ...input,
          headers: input.headers
            ? input.headers
            : new Headers({
                [app.getTracingHeaderKey()]: trx.getId(),
              }),
        };
      }
      trx.setMeta({
        host,
        path: pathname,
        method,
      });

      return fetch(rqOpts, init)
        .then((res) => {
          trx.end(Status.TRANSACTION_SUCCESSFUL);
          return res;
        })
        .catch((err) => {
          trx.end(Status.TRANSACTION_FAILED, err);
          return new Error(err);
        });
    });
  };
}
