# @squzy/angular

Middleware for angular applications

## Usage

```bash
npm install @squzy/angular --save
```

```typescript

import { SquzyMonitoringModule } from "@squzy/angular"

imports: [
  SquzyMonitoringModule.forRoot({
      apiHost: string; // host of api service of squzy
      name: string; // name of application
      host: string; // host of application
  })
],
```
