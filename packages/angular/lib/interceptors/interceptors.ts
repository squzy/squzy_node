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
import { SquzyAppService } from "../services/app.service";
import { Type, Status } from "./../../../core/lib";

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
    const url = new URL(reqUrl);
    return this.squzyAppService.getApplication().pipe(
      map((app) => {
        return app.createTransaction(
          url.host + url.pathname,
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
                host: url.host,
                path: url.pathname,
              },
            });
            return req;
          }),
          catchError((error: HttpErrorResponse) => {
            trx.setMeta({
              status: Status.TRANSACTION_FAILED,
              meta: {
                host: url.host,
                path: url.pathname,
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
