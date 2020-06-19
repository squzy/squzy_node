import { Injectable, Inject, InjectionToken } from "@angular/core";
import { Options, IApp } from "@squzy/core";
import { of } from "rxjs";
import { publishReplay, refCount } from "rxjs/operators";

export const SQUZY_APPLICATION_TOKEN = new InjectionToken<Options>(
  "SQUZY_APPLICATION_TOKEN"
);

@Injectable({
  providedIn: "root",
})
export class SquzyAppService {
  private app$ = of(this.application).pipe(publishReplay(1), refCount());

  constructor(@Inject(SQUZY_APPLICATION_TOKEN) private application: IApp) {}

  getApplication() {
    return this.app$;
  }
}
