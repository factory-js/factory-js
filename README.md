<div align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="logo-invert.svg"><source media="(prefers-color-scheme: light)" srcset="logo.svg"><img width="38px" src="logo.svg" alt=""></picture><h3>factory-js</h3><p>The object generator for testing.<p><p><a href="https://codecov.io/gh/factory-js/factory-js"><img alt="coverage" src="https://codecov.io/gh/factory-js/factory-js/graph/badge.svg?token=KJ4A3X0EJG"></a> <a href="https://bundlephobia.com/package/@factory-js/factory"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/%40factory-js%2Ffactory"></a></p></div><br>

## Features

- 🔌&nbsp;&nbsp;**ORM Agnostic** - Can be used with Prisma and more.
- 💛&nbsp;&nbsp;**Simple API** - Generates objects with a simple, chainable interface.
- ✅&nbsp;&nbsp;**Fully Typed** - Maximize the benefits of TypeScript.

## Installation

Please refer to the section according to the ORM you want to use.

- [with Prisma](#with-prisma)
- [with other ORMs](#with-other-orms)

## API

### .define

You can define a factory with `.define`.  
The following example uses [faker](https://fakerjs.dev/) to generate fake values.

```typescript
import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";

const userFactory = await factory.define({
  props: {
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
    age: () => faker.number.int(99),
  },
  vars: {},
});

const user = await userFactory.build();
console.log(user); // { firstName: 'John', lastName: 'Doe', age: 20 }
```

### .props

Sometimes, you may want to use a fixed value instead of a randomly generated one in a specific test.  
In such cases, you can override property values with `.props` after a factory defined.

```typescript
it("returns a user whose age is 20", async () => {
  const user = await userFactory.props({ age: () => 20 }).build();
  expect(user.age).toBe(20);
});
```

### .vars

You can define variables with `.vars` and use them when defining properties.  
In contrast to `.props`, variables are not added as properties to the built object.

Note that, due to TypeScript limitations, you cannot use variables in `.define`.  
Instead, you need to use them within `.props`.

```typescript
const userFactory = await factory
  .define({
    props: {
      // Set a temporary value to define the type.
      name: () => "",
    },
    vars: {
      title: () => "Mr.",
    },
  })
  .props({
    // Then, use a variable to set the actual value.
    name: async ({ vars }) => `${await vars.title} John`,
  });

const user = await userFactory.build();
console.log(user); // { name: 'Mr. John' }
```

You can override variables with `.vars`.

```typescript
it("uses 'Sir' for the title", async () => {
  const user = await userFactory.vars({ title: () => "Sir" }).build();
  expect(user.name).toBe("Sir John");
});
```

When using a variable, it is recommended to treat the variable as a promise, even if it is not.  
This is because you can always override a non-promise variable with a promise using `.vars`.

### later

Factory-js provides the `later` function, which enables you to specify a type without needing a temporary value.  
We generally recommend using this function because it alerts you by throwing an error if you forget to override.

```typescript
import { factory, later } from "@factory-js/factory";

const userFactory = await factory
  .define({
    props: {
      name: later<string>(),
    },
    vars: {
      title: () => "Mr.",
    },
  })
  .props({
    name: async ({ vars }) => `${await vars.title} John`,
  });
```

### dependent props / vars

You can define properties that depend on other properties.  
Note that, similar to `.vars`, you cannot refer to other properties in `.define`.  
When using this function, be careful not to create circular dependencies that could lead to infinite loops.

```typescript
const user = await factory
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

const user = await userFactory.build();
console.log(user); // { firstName: 'John', lastName: 'Doe', fullName: 'John Doe' }
```

And you can also define variables that depend on other variables.

```typescript
const itemFactory = await factory
  .define({
    props: {
      label: later<string>(),
    },
    vars: {
      price: () => 100,
      discount: () => 0.1,
      actualPrice: later<number>(),
    },
  })
  .vars({
    actualPrice: async ({ price, discount }) =>
      (await price) * (1 - (await discount)),
  })
  .props({
    label: async ({ vars }) => `$${await vars.actualPrice}`,
  });

const item = await itemFactory.build();
console.log(item); // { label: '$90' }
```

### .create

If you want to save the built object in the database, you can use `.create` instead of `.build`.  
You need to pass a function that saves the object in your database as the second argument to `.define`.

```typescript
const userFactory = await factory.define(
  {
    props: {
      firstName: () => "John",
      lastName: () => "Doe",
    },
    vars: {},
  },
  // This implementation depends on the ORM.
  async (props) => await db.user.create({ data: props }),
);

// Returns a saved object.
await userFactory.create();
```

### .buildList

This builds multiple objects and returns them as an array.

```typescript
await userFactory.buildList(3);
```

### .createList

This is the `.create` version of `.buildList`.

```typescript
await userFactory.createList(3);
```

### .after

This is the callback function that is called after `.create` has finished.  
Note that this callback is **not** called when you use `.build`.  
The common use case is creating 1:N or M:N objects.

```typescript
const userFactory = await factory
  .define({
    props: {
      id: () => 1,
      firstName: () => "John",
      lastName: () => "Doe",
    },
    vars: {},
  })
  .after((user) => {
    postFactory.props({ userId: () => user.id }).buildList(3);
  });
```

### .traits

This enables you to manage properties, variables and the after hooks using a key.  
This method is especially useful in cases of [Single-table inheritance](https://www.prisma.io/docs/orm/prisma-schema/data-model/table-inheritance#single-table-inheritance-sti).

```typescript
const userFactory = await factory
  .define({
    props: {
      role: () => "guest",
      isAdmin: () => false,
    },
    vars: {},
  })
  .traits({
    admin: {
      props: {
        role: () => "admin",
        isAdmin: () => true
      },
      vars: { ... },
      after: () => { ... }
    }
  })

// Use the trait with `.use`.
await userFactory.use((t) => t.admin).build();
```

And you can also use a function in a trait.

```typescript
const userFactory = await factory
  .define({
    props: {
      role: () => "guest",
      isAdmin: () => false,
    },
    vars: {},
  })
  .traits({
    withRole: (role: string) => ({
      props: {
        role: () => role,
        isAdmin: () => role === "admin",
      },
    }),
  });

await userFactory.use((t) => t.withRole("admin")).build();
```

### def

You can access the properties and variables of a defined factory by using the `def`.  
This is useful when defining a new factory from an existing one.

```typescript
const userFactory = await factory
  .define({
    props: {
      name: () => "John",
      age: () => 20,
    },
    vars: {
      title: () => "Mr.",
    },
  })
  // Note that `def` returns the original values as defined in `.define`.
  // Thus, `userFactory.def.props.age` would return 20, not 50.
  .props({
    age: () => 50,
  });

const employeeFactory = await factory
  .define({
    props: {
      ...userFactory.def.props, // { name: () => "John", age: () => 20 }
      role: () => "admin",
    },
    vars: {
      ...userFactory.def.vars, // { title: () => "Mr." }
    },
  })
  .props({
    name: async ({ vars }) => `${await vars.title} John`,
  });

await employeeFactory.build(); // { name: "Mr. John", age: 20, role: "admin" }
```

## with Prisma

Factory-js provides a plugin for Prisma.  
This plugin generates factories based on your Prisma schema file, so you don't need to define factories yourself.

### Setup

1. Install core and plugin packages.

   ```sh
   npm i --save-dev @factory-js/factory @factory-js/prisma-factory
   ```

2. Add the generator config to your Prisma schema file.

   ```
   generator factory {
     provider = "prisma-factory"
     output   = "./generated" // optional
   }
   ```

3. Now, you can generate using the following command. The default output is `./generated/factories.ts`.

   ```sh
   prisma generate
   ```

### Usage

To use the generated factories, import the generated file and pass a Prisma client to a function that returns a factory.

```typescript
import { defineUserFactory } from "./generated/factories";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const userFactory = await defineUserFactory(db);

it("returns an admin user", async () => {
  const user = userFactory.props({ role: () => "ADMIN" }).create();
  expect(user.role).toBe("ADMIN");
});
```

You sometimes need to change a default relation in a specific test.  
In this case, you can use `.vars`. The following example creates two objects: an admin user and their profile.

```typescript
const userFactory = await defineUserFactory(db);
const profileFactory = await defineProfileFactory(db);

it("create an admin profile", async () => {
  const user = userFactory.props({ role: () => "ADMIN" }).create();
  const profile = profileFactory.vars({ user: () => user }).create();
  expect(profile.userId).toBe(user.id);
});
```

When you use this plugin in your real project, we recommend creating a `/factories` directory in the project and then customizing the generated factories according to your preferences in each file, as follows:

```
factories/
  - user-factory.ts
  - post-factory.ts
  - profile-factory.ts
```

This is because, although this plugin sets default values that have valid types, it cannot set valid formats for values, such as emails or UUIDs. Therefore, you may sometimes need to manually override property values.

```typescript
// factories/user-factory.ts
export const userFactory = await defineUserFactory(db).props({
  email: () => faker.internet.exampleEmail(),
});
```

## with other ORMs

While Factory-js does not have plugins for all ORMs, it likely has the capability to support almost all ORMs by allowing you to define factories yourself.

### Setup

1. Install the core package.

   ```sh
   npm i --save-dev @factory-js/factory
   ```

2. Define factories yourself following the [EXAMPLES.md](./EXAMPLES.md).

## Contributing

Please make sure to read the [Contributing guide](./CONTRIBUTING.md) before making a pull request or a issue.  
Contributions are welcome!
