import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { map, switchMap, catchError, finalize } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import * as parseURI from "uri-parse-lib";
import { SquzyAppService } from "../services/app.service";
import { Type, Status, Transaction, Application } from "@squzy/core";

@Injectable()
export class SquzyInterceptor implements HttpInterceptor {
  constructor(private squzyAppService: SquzyAppService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let reqUrl = request.url;
    if (reqUrl.startsWith("/")) {
      reqUrl = location.host + reqUrl;
    }
    const method = request.method;
    const { host, pathname } = parseURI(reqUrl);
    return this.squzyAppService.getApplication().pipe(
      map((app) => {
        const trx = app.createTransaction(
          host + pathname,
          Type.TRANSACTION_TYPE_HTTP
        );
        return {
          app,
          trx,
        };
      }),
      switchMap(({ app, trx }) => {
        const clonedRequest = request.clone({
          headers: request.headers.set(app.getTracingHeaderKey(), trx.id),
        });

        return next.handle(clonedRequest).pipe(
          finalize(() => trx.end()),
          map((req) => {
            trx.setMeta({
              status: Status.TRANSACTION_SUCCESSFUL,
              meta: {
                host,
                path: pathname,
                method,
              },
            });
            return req;
          }),
          catchError((error: HttpErrorResponse) => {
            trx.setMeta({
              status: Status.TRANSACTION_FAILED,
              meta: {
                host,
                path: pathname,
                method,
              },
              error: new Error(error.message),
            });
            return throwError(error);
          })
        );
      })
    );
  }
}
