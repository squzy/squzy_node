# @squzy/vanilla

Package for usage that inside vanilla applications

## How to use

```bash
npm install @squzy/vanilla --save
```

```typescript
import { createFetch } from "@squzy/vanilla"
import { createApplication } from "@squzy/core"

const application = await createApplication({
    apiHost: "http://localhost:8080",
    name: "nodejs"
})

const fetch = createFetch(application)

fetch("https://google.ru") - same like native

```
