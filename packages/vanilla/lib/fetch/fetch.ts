import { Type, Status, IApp } from "@squzy/core";
import { parseURI } from "uri-parse-lib";

export function createFetch(application: IApp) {
  return (input: RequestInfo, init?: RequestInit, parentId?: string) => {
    return Promise.resolve(application).then((app) => {
      let transactionName;
      let reqUrl;
      let method = "GET";
      let rqOpts: Request;
      let customHeaders = false;
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
        customHeaders = true
      }
      const { host, pathname } = parseURI(reqUrl);
      const trx = app.createTransaction(
        host + pathname,
        Type.TRANSACTION_TYPE_FETCH,
        parentId || null
      );
      if (typeof input === "string") {
        rqOpts = {
          method,
          headers: customHeaders ? new Headers({
            [app.getTracingHeaderKey()]: trx.getId(),
          }) : new Headers({}),
        } as Request;
      } else {
        if (input.headers && customHeaders) {
          input.headers.append(app.getTracingHeaderKey(), trx.getId());
        }
        rqOpts = {
          ...input,
          headers: input.headers
            ? input.headers
            : customHeaders ? new Headers({
                [app.getTracingHeaderKey()]: trx.getId(),
              }) : new Headers({}),
        };
      }
      trx.setMeta({
        host,
        path: pathname,
        method,
      });

      return fetch(input, init)
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
