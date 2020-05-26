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
import { Type, Status } from "@squzy/core";

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
    const { host, pathname } = parseURI(reqUrl);
    return this.squzyAppService.getApplication().pipe(
      map((app) => {
        return app.createTransaction(
          host + pathname,
          Type.TRANSACTION_TYPE_HTTP
        );
      }),
      switchMap((trx) =>
        next.handle(request).pipe(
          finalize(() => trx.end()),
          map((req) => {
            trx.setMeta({
              status: Status.TRANSACTION_SUCCESSFUL,
              meta: {
                host,
                path: pathname,
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
              },
              error: new Error(error.message),
            });
            return throwError(error);
          })
        )
      )
    );
  }
}
