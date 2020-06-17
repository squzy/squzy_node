# @squzy/vanilla

Package for usage that inside vanilla applications

## How to use

```bash
npm install @squzy/vanilla --save
```

```typescript
import { createFetch } from "@squzy/vanilla"

const fetch = createFetch({
    apiHost: "http://localhost:8080",
    name: "nodejs"
})

fetch("https://google.ru") - same like native

```