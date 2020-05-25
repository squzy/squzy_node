# `angular`

## Usage

```
providers: [
    {
      provide: SQUZY_APPLICATION_TOKEN,
      useFactory: () => ({
        monitoringHost: "/api",
        name: "FE",
        host: window.location.host,
      })
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SquzyInterceptor,
      multi: true,
      deps: [
        SquzyAppService,
      ]
    },
    SquzyAppService,
]
```
