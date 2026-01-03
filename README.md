<div align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="logo-invert.svg"><source media="(prefers-color-scheme: light)" srcset="logo.svg"><img width="38px" src="logo.svg" alt=""></picture><h3>FactoryJS</h3><p>The object generator for testing.<p><p><a href="https://codecov.io/gh/factory-js/factory-js"><img alt="coverage" src="https://codecov.io/gh/factory-js/factory-js/graph/badge.svg?token=KJ4A3X0EJG"></a> <a href="https://bundlephobia.com/package/@factory-js/factory"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40factory-js%2Ffactory"></a></p></div><br>

## Features

- ✅ **Type Safety** - Catches configuration errors and typos at compile time
- ⚙️ **Flexible** - Define variables, traits, and properties that depend on each other
- 🪶 **Lightweight** - Zero dependencies
- 📦 **ORM-Friendly API** - Works seamlessly with Prisma, Drizzle, and other ORMs

## Documentation

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [`.define`](#define)
  - [`.build` / `.buildList`](#build--buildlist)
  - [`.create` / `.createList`](#create--createlist)
  - [`.props`](#props)
  - [`.vars`](#vars)
  - [`.use` (Traits)](#use-traits)
  - [`later`](#later)
  - [`seq`](#seq)
  - [`.after`](#after)
  - [`.extend`](#extend)
- [Prisma Plugin](#prisma-plugin)
  - [Setup](#setup)
  - [Usage](#usage)
  - [Options](#options)
- [Other ORMs](#other-orms)
- [Contributing](#contributing)
- [License](#license)

## Installation

```sh
pnpm add -D @factory-js/factory
```

```sh
npm install --save-dev @factory-js/factory
```

```sh
yarn add -D @factory-js/factory
```

## Quick Start

To define a factory, use `.define`. In the example below, we use [Faker](https://fakerjs.dev/) to generate values, but you can use any library or fixed values.

```ts
import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";

const userFactory = factory.define({
  props: {
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
    role: () => "employee",
  },
  vars: {},
});
```

Use `.build` to generate objects. You can use `.props` to override property values for each test case.

```ts
import { expect, it, describe } from "vitest";
import { userFactory } from "../factories/user-factory";
import { isAdmin } from "./is-admin";

describe("when a user is admin", () => {
  it("returns true", async () => {
    const user = await userFactory.props({ role: () => "admin" }).build();
    expect(isAdmin(user)).toBe(true);
  });
});

describe("when a user is guest", () => {
  it("returns false", async () => {
    const user = await userFactory.props({ role: () => "guest" }).build();
    expect(isAdmin(user)).toBe(false);
  });
});
```

By only specifying `role`, the test clearly shows which property matters. FactoryJS handles the rest.

To save objects to a database, pass a save function as the second argument to `.define`:

```ts
import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { db } from "../db";

const userFactory = factory.define(
  {
    props: {
      firstName: () => faker.person.firstName(),
      lastName: () => faker.person.lastName(),
      role: () => "employee",
    },
    vars: {},
  },
  async (user) => {
    return db.user.create({ data: user });
  },
);
```

Use `.create` instead of `.build` to call the save function:

```ts
const user = await userFactory.props({ role: () => "admin" }).create();
```

FactoryJS simply runs the function and returns the result, without relying on any specific ORM. You can use it with Prisma, Drizzle, or any other data layer.

> **Note:** FactoryJS has a dedicated plugin for Prisma that automatically generates factories from schema files. See [Prisma Plugin](#prisma-plugin) for details.

## API Reference

### `.define`

Each property must be a function that returns the value.

```ts
import { factory } from "@factory-js/factory";

const userFactory = factory.define({
  props: {
    firstName: () => "John",
    lastName: () => "Doe",
    age: () => Promise.resolve(20),
  },
  vars: {},
});

const user = await userFactory.build();
console.log(user); // { "firstName": "John", "lastName": "Doe", "age": 20 }
```

Use [Faker](https://fakerjs.dev/) or similar libraries to generate random values:

```ts
import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";

const userFactory = factory.define({
  props: {
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
  },
  vars: {},
});

console.log(await userFactory.build()); // e.g. { firstName: "Alice", lastName: "Smith" }
console.log(await userFactory.build()); // e.g. { firstName: "Bob", lastName: "Johnson" }
```

FactoryJS infers types automatically, but you can specify them explicitly:

```ts
type User = { firstName: string; lastName: string };

const userFactory = factory.define<User>({
  props: {
    firstName: () => "John",
    lastName: () => "Doe",
  },
  vars: {},
});
```

### `.build` / `.buildList`

Use `.build` to generate an object.

```ts
const user = await userFactory.build();
```

Use `.buildList` to generate multiple objects at once:

```ts
const users = await userFactory.buildList(3);
// Returns an array of 3 user objects
```

### `.create` / `.createList`

Use `.create` to run the save function and persist the object:

```ts
const userFactory = factory.define(
  {
    props: { firstName: () => "John", lastName: () => "Doe" },
    vars: {},
  },
  async (user) => db.user.create({ data: user }),
);

await userFactory.create();
await userFactory.createList(2);
```

### `.props`

Use `.props` to override property values:

```ts
const user = await userFactory.props({ firstName: () => "Alice" }).build();
console.log(user); // { "firstName": "Alice", "lastName": "Doe" }
```

`.props` can be chained multiple times. The last value takes precedence:

```ts
const user = await userFactory
  .props({ firstName: () => "Alice" })
  .props({ firstName: () => "Bob" })
  .props({ firstName: () => "Tom" })
  .build();

console.log(user); // { firstName: "Tom", lastName: "Doe" }
```

> **Warning:** `.props` only overrides existing properties. To add new ones, see [`.extend`](#extend).

You can define properties that reference other properties:

```ts
const userFactory = factory
  .define({
    props: {
      firstName: () => "John",
      lastName: () => "Doe",
      fullName: later<string>(),
    },
    vars: {},
  })
  .props({
    fullName: async ({ props }) =>
      `${await props.firstName} ${await props.lastName}`,
  });

console.log(await userFactory.build());
// { fullName: "John Doe", firstName: "John", lastName: "Doe" }
```

> **Warning:** Avoid circular references between properties, as this could cause an infinite loop.

### `.vars`

Variables are internal values used to compute properties but excluded from the output.

```ts
import { factory, later } from "@factory-js/factory";

const userFactory = factory
  .define({
    props: {
      bio: later<string>(),
    },
    vars: {
      greeting: () => "I'm",
    },
  })
  .props({
    bio: async ({ vars }) => `${await vars.greeting} John`,
  });

console.log(await userFactory.build()); // { bio: "I'm John" }
```

Use `.vars` to overwrite variables:

```ts
const user = await userFactory.vars({ greeting: () => "Hello, I'm" }).build();

console.log(user); // { bio: "Hello, I'm John" }
```

Variables are especially useful when working with ORMs, particularly for defining relationships:

```ts
const userFactory = factory.define(
  {
    props: { id: () => 1, name: () => "John" },
    vars: {},
  },
  async (user) => db.user.create({ data: user }),
);

const profileFactory = factory
  .define(
    {
      props: {
        userId: later<number>(),
        bio: () => "Hello",
      },
      vars: {
        user: () => userFactory.create(),
      },
    },
    async (profile) => db.profile.create({ data: profile }),
  )
  .props({
    userId: async ({ vars }) => (await vars.user).id,
  });

const profile = await profileFactory.create();
```

Variables are cached—each is computed only once, even if referenced multiple times.

> **Warning:** `.vars` only overrides existing variables. To add new ones, see [`.extend`](#extend).

### `.use` (Traits)

Traits group related properties, variables, and hooks into reusable presets.

```ts
const userFactory = factory
  .define({
    props: {
      role: () => "guest",
      isAdmin: () => false,
    },
    vars: {
      greeting: () => "Hi",
    },
  })
  .traits({
    admin: {
      props: {
        role: () => "admin",
        isAdmin: () => true,
      },
      vars: {
        greeting: () => "Hello",
      },
      after: () => {
        console.log("Admin created");
      },
    },
  });

await userFactory.use((t) => t.admin).build();
```

You can define multiple traits and apply them:

```ts
await userFactory
  .use((t) => t.employee)
  .use((t) => t.admin)
  .use((t) => t.maskedName)
  .build(); // { name: "***", role: "admin", isAdmin: true }
```

### `later`

Use `later` as a placeholder for properties that must be set before building.

```ts
import { factory, later } from "@factory-js/factory";

const userFactory = factory
  .define({
    props: {
      firstName: () => "John",
      lastName: () => "Doe",
      fullName: later<string>(),
    },
    vars: {},
  })
  .props({
    fullName: async ({ props }) =>
      `${await props.firstName} ${await props.lastName}`,
  });
```

If you build without setting the value, `later` will throw an exception:

```ts
const itemFactory = factory.define({
  props: {
    type: later<"book" | "food">(),
    price: () => 0,
  },
  vars: {},
});

await itemFactory.build(); // ❌ Throws an exception

await itemFactory.props({ type: () => "food" }).build(); // ✅ Works
```

This prevents building objects with missing required values.

### `seq`

Use `seq` to generate sequential values. The first argument is the starting number, and the second is a generator function:

```ts
import { factory, seq } from "@factory-js/factory";

const userFactory = factory.define({
  props: {
    id: seq(1, (n) => n),
    name: seq(1, (n) => `user-${n}`),
  },
  vars: {},
});

console.log(await userFactory.buildList(2));
// [{ id: 1, name: "user-1" }, { id: 2, name: "user-2" }]
```

> **Note:** Test libraries like Vitest and Jest run tests in parallel by default, so values generated by `seq` may not be unique across workers. If you need unique values for database constraints, combine `seq` with `VITEST_WORKER_ID`.

### `.after`

Use `.after` to run a callback after `.create`:

```ts
const userFactory = factory
  .define(
    {
      props: { name: () => "John" },
      vars: { greeting: () => "Hello" },
    },
    async (user) => db.user.create({ data: user }),
  )
  .after((user, vars) => {
    console.log(user, vars.greeting);
  });

await userFactory.create(); // Logs { name: "John" }, Hello
```

> **Note:** `.after` runs only with `.create`, not `.build`.

A common use case for `.after` is creating one-to-many relationships:

```ts
await userFactory
  .after((user) => postFactory.vars({ user: () => user }).createList(3))
  .create();
```

> **Note:** It's often more convenient to combine `.after` with `.traits`.

### `.extend`

Use `.def` to access a factory's definition and extend it:

```ts
const userFactory = factory.define({
  props: {
    name: () => "John",
    age: () => 20,
  },
  vars: {
    title: () => "Mr.",
  },
});

const { props, vars } = userFactory.def;

const employeeFactory = factory.define({
  props: {
    ...props,
    role: () => "admin",
  },
  vars: {
    ...vars,
    greeting: () => "Hello",
  },
});
```

> **Note:** `.def` returns only the properties and variables from the original `.define` call. Changes made via `.props` or `.vars` in the method chain are not included.

## Prisma Plugin

The Prisma plugin automatically generates factories from your schema.

> **Note:** Currently, FactoryJS only provides a plugin for Prisma. For other ORMs, see [Other ORMs](#other-orms).

### Setup

Install the packages:

```sh
pnpm add -D @factory-js/factory @factory-js/prisma-factory
```

```sh
npm install --save-dev @factory-js/factory @factory-js/prisma-factory
```

```sh
yarn add -D @factory-js/factory @factory-js/prisma-factory
```

Add the generator to your Prisma schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

generator factory {
  provider = "prisma-factory"
}
```

Run `prisma generate` to generate the factories:

```sh
prisma generate
```

### Usage

Import and use the generated factories:

```ts
import { defineUserFactory } from "./generated/factories";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const userFactory = await defineUserFactory(db);

it("returns an admin user", async () => {
  const user = await userFactory.props({ role: () => "ADMIN" }).create();
  expect(user.role).toBe("ADMIN");
});
```

The plugin handles relationships automatically. Override them with `.vars`:

```ts
const userFactory = await defineUserFactory(db);
const profileFactory = await defineProfileFactory(db);

it("creates an admin profile", async () => {
  const user = await userFactory.props({ role: () => "ADMIN" }).create();
  const profile = await profileFactory.vars({ user: () => user }).create();
  expect(profile.userId).toBe(user.id);
});
```

> **Note:** While you can import generated factories directly, it's recommended to create a `/factories` directory for easier customization.

```
factories/
├── user-factory.ts
├── post-factory.ts
├── profile-factory.ts
└── ...
```

Generated values have correct types but may lack proper format (e.g., valid emails). Customize as needed:

```ts
import { defineUserFactory } from "./generated/factories";
import { db } from "../db";
import { faker } from "@faker-js/faker";

export const userFactory = await defineUserFactory(db).props({
  email: () => faker.internet.exampleEmail(),
});
```

### Options

The Prisma generator has the following options:

```prisma
generator factory {
  provider           = "prisma-factory"
  output             = "./generated"
  randModule         = "./rand"
  prismaClientModule = "./dist"
}
```

#### output

Specifies the output directory for generated factories. Default: `./generated`

#### randModule

Specifies the module used to generate random values. Default: `@factory-js/prisma-factory`

You can customize the random value generation:

```ts
import { rands as originalRands } from "@factory-js/prisma-factory";
import { faker } from "@faker-js/faker";

export const rands = {
  ...originalRands,
  String: () => faker.string.uuid(),
};
```

> **Note:** See [rands.ts](https://github.com/factory-js/factory-js/blob/main/packages/prisma-factory/src/rands.ts) for default implementations.

#### prismaClientModule

Specifies the import path for PrismaClient. Default: `@prisma/client`

## Other ORMs

For other ORMs, define factories manually.

Here's an example with [Drizzle ORM](https://orm.drizzle.team/):

```ts
import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { create } from "./utils/create";

export const userFactory = factory.define(
  {
    props: {
      name: () => faker.string.alphanumeric(40),
      email: () => faker.internet.exampleEmail(),
      role: () => faker.helpers.arrayElement(["guest", "admin"] as const),
    },
    vars: {},
  },
  (props) => create(users, props),
);
```

> **Note:** For working sample code, check the [example directory](https://github.com/factory-js/factory-js/tree/main/examples/basic).

Use variables to define default relationships:

```ts
const profileFactory = factory
  .define(
    {
      props: {
        userId: later<number>(),
        bio: () => faker.string.alphanumeric(40),
      },
      vars: {
        user: () => userFactory.create(),
      },
    },
    (props) => create(profiles, props),
  )
  .props({
    userId: async ({ vars }) => (await vars.user).id,
  });
```

This allows you to create profiles without explicitly creating users:

```ts
const profile = await profileFactory.create();
```

Or change the relationship as needed:

```ts
const user = await userFactory.props({ role: () => "admin" }).create();
const profile = await profileFactory.vars({ user: () => user }).create();
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

[MIT](https://github.com/factory-js/factory-js/blob/main/LICENSE)
