# @squzy/angular

## Not work with IVY yet

Middleware for angular applications

## Usage

```bash
npm install @squzy/angular --save
```

```typescript

import { SquzyMonitoringModule } from "@squzy/angular"
import { createApplication } from "@squzy/core"

imports: [
  SquzyMonitoringModule.forRoot(createApplication({
      apiHost: string; // host of api service of squzy
      name: string; // name of application
      host: string; // host of application
  }))
],
```
