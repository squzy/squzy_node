# @squzy/core

Core package for transaction inside node applications

## How to use

```bash
npm install @squzy/core --save
```

```typescript
import { createApplication, createTransaction, Type } from "@squzy/core"


const application = await createApplication({
    apiHost: "http://localhost:8080",
    name: "nodejs"
})

const transaction = createTransaction("do magic", Type.TRANSACTION_TYPE_INTERNAL, application)

transaction.end()
```