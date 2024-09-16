<div align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="logo-invert.svg"><source media="(prefers-color-scheme: light)" srcset="logo.svg"><img width="38px" src="logo.svg" alt=""></picture><h3>FactoryJS</h3><p>The object generator for testing.<p><p><a href="https://codecov.io/gh/factory-js/factory-js"><img alt="coverage" src="https://codecov.io/gh/factory-js/factory-js/graph/badge.svg?token=KJ4A3X0EJG"></a> <a href="https://bundlephobia.com/package/@factory-js/factory"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40factory-js%2Ffactory"></a></p><a href="https://factory-js.github.io">Documentation</a>・<a href="./CONTRIBUTING.md">Contributing Guide</a></div><br>

## Features

- ✅ **Type Safety** - It helps prevent configuration errors and typos.
- ⚙️ **Highly Functional** - You can define variables, traits, and properties that depend on other properties.
- 🪶 **Lightweight** - It is very lightweight as it does not depend on any other packages.
- 📦 **ORM-Friendly API** - Designed to be used also with ORMs like Prisma and Drizzle.

## Quick Start

1. Install FactoryJS.

```sh
pnpm add -D @factory-js/factory
```

2. Define a factory and use it in your tests, database seeds, etc.

```ts
import { factory } from "@factory-js/factory";

// Define the factory
const userFactory = factory.define({
  props: {
    firstName: () => "John",
    lastName: () => "Doe",
    role: () => "guest",
  },
  vars: {},
});

describe("when a user is admin", () => {
  it("returns true", async () => {
    const user = await userFactory(db)
      .props({ role: () => "admin" }) // Override role to admin
      .build();
    expect(isAdmin(user)).toBe(true);
  });
});
```

To learn more about FactoryJS, check the [Documentation](https://factory-js.github.io/).

## License

[MIT](https://github.com/factory-js/factory-js/blob/main/LICENSE)
