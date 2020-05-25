import { Injectable, Inject, InjectionToken } from "@angular/core";
import { createApplication, Options } from "@squzy/core";
import { from } from "rxjs";
import { publishReplay, refCount, tap } from "rxjs/operators";

export const SQUZY_APPLICATION_TOKEN = new InjectionToken<Options>(
  "SQUZY_APPLICATION_TOKEN"
);

@Injectable()
export class SquzyAppService {
  private app$ = from(createApplication(this.opts)).pipe(
    publishReplay(1),
    refCount()
  );

  constructor(@Inject(SQUZY_APPLICATION_TOKEN) private opts: Options) {}

  getApplication() {
    return this.app$;
  }
}
