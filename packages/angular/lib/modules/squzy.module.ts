import { NgModule, ModuleWithProviders } from "@angular/core";
import {
  SquzyAppService,
  SQUZY_APPLICATION_TOKEN,
} from "../services/app.service";
import { Options } from "@squzy/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { SquzyInterceptor } from "../interceptors/interceptors";

@NgModule({})
export class SquzyMonitoringModule {
  static forRoot(options: Options): ModuleWithProviders {
    return {
      ngModule: SquzyMonitoringModule,
      providers: [
        SquzyAppService,
        {
          provide: SQUZY_APPLICATION_TOKEN,
          useFactory: () => options,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: SquzyInterceptor,
          multi: true,
          deps: [SquzyAppService],
        },
      ],
    };
  }
}
