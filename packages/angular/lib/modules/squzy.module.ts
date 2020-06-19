import { NgModule, ModuleWithProviders } from "@angular/core";
import {
  SquzyAppService,
  SQUZY_APPLICATION_TOKEN,
} from "../services/app.service";
import { IApp } from "@squzy/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { SquzyInterceptor } from "../interceptors/interceptors";

@NgModule({})
export class SquzyMonitoringModule {
  static forRoot(
    application: Promise<IApp>
  ): ModuleWithProviders<SquzyMonitoringModule> {
    return {
      ngModule: SquzyMonitoringModule,
      providers: [
        SquzyAppService,
        {
          provide: SQUZY_APPLICATION_TOKEN,
          useValue: application,
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
