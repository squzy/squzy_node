# @squzy/express

Package for usage that inside express application

## How to use

```bash
npm install @squzy/express --save
```

It is should be on route level, because on root level it is impossible to get access to matched router without patching(we dont wanna do that)

```typescript
import { createMiddleware } from "@squzy/express"


const application = await createApplication({
    apiHost: "http://localhost:8080",
    name: "nodejs"
})

const router = express.Router();

router.get('/adamin/:name', createMiddleware(application), function (req, res) {
    //console.log(req.route)
    res.send('hello world')
})

```