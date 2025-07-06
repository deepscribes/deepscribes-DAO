# What is this?

This is a DAO (Data Access Object), see [wiki](https://en.wikipedia.org/wiki/Data_access_object) for Deepscribes.

It is the middleman between the database and the application

# Structure

```
src/
    dao/
        <divided by database type>
            <divided by entity type>.ts
    models/
        <model>.ts
test/
    dao/
        <divided by database type>
            <divided by entity type>.test.ts
            <divided by entity type>.integ.test.ts
    constants.ts
```

# Installation

```bash
npm install @deepscribes/deepscribes-dao
```

(you will need to be authenticated)

# Usage

```typescript
import { SubscriptionDao } from "@deepscribes/deepscribes-dao";

const subscriptionDao = new SubscriptionDao();
const subscription = await subscriptionDao.createSubscription({
  userId: "user-123",
  plan: "basic",
  expirationDate: new Date("2024-12-31"),
  isTrial: false,
});
console.log(subscription);
```

Or any other method

# Tests

There is a utility to run the tests, just run:

```bash
npm run test
```

And it will load the environment variables from `.env.integ`, then run first unit tests then integration tests
