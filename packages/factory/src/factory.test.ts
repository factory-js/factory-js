import { expect, it, describe, expectTypeOf, vi } from "vitest";
import { factory } from "./factory";
import { later, seq } from ".";

describe("#factory", () => {
  describe("when a factory has props", () => {
    it("can build an object", async () => {
      const user = await factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .build();
      expect(user).toStrictEqual({
        name: "John",
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
      }>();
    });
  });

  describe("when a factory has a promise prop", () => {
    it("can build an object", async () => {
      const user = await factory
        .define({
          props: {
            name: () => Promise.resolve("John"),
          },
          vars: {},
        })
        .build();
      expect(user).toStrictEqual({
        name: "John",
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
      }>();
    });
  });

  describe("when a factory has a function prop", () => {
    it("can build an object", async () => {
      const greet = () => "hello";
      const user = await factory
        .define({
          props: {
            greet: () => greet,
          },
          vars: {},
        })
        .build();
      expect(user.greet()).toBe("hello");
      expectTypeOf(user).toEqualTypeOf<{
        greet: () => string;
      }>();
    });
  });

  describe("when a factory has a const prop", () => {
    it("can build an object", async () => {
      const user = await factory
        .define({
          props: {
            name: () => "John" as const,
          },
          vars: {},
        })
        .build();
      expect(user).toStrictEqual({
        name: "John",
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: "John";
      }>();
    });
  });

  describe("when a const prop is overridden", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John" as const,
          },
          vars: {},
        })
        .props({
          // @ts-expect-error throw a type error
          name: () => "Tom",
        });
    });
  });

  describe("when a factory has nested props", () => {
    it("can build an object", async () => {
      const user = await factory
        .define({
          props: {
            id: () => 1,
            profile: () => ({
              bio: "I'm John",
              age: 20,
              address: {
                city: "New York",
              },
            }),
          },
          vars: {},
        })
        .props({
          profile: () => ({
            bio: "I'm Tom",
            age: 18,
            address: {
              city: "Tokyo",
            },
          }),
        })
        .build();
      expect(user).toStrictEqual({
        id: 1,
        profile: {
          bio: "I'm Tom",
          age: 18,
          address: {
            city: "Tokyo",
          },
        },
      });
      expectTypeOf(user).toEqualTypeOf<{
        id: number;
        profile: {
          bio: string;
          age: number;
          address: {
            city: string;
          };
        };
      }>();
    });
  });

  describe("when a factory has vars", () => {
    it("can build an object with vars", async () => {
      const user = await factory
        .define({
          props: {
            name: later<string>(),
          },
          vars: {
            title: () => "Ms.",
          },
        })
        .props({
          name: async ({ vars }) => `${await vars.title} John`,
        })
        .vars({
          title: () => "Mr.",
        })
        .build();
      expect(user).toStrictEqual({
        name: "Mr. John",
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
      }>();
    });
  });

  describe("when a var depends on other vars", () => {
    it("can build an object with vars", async () => {
      const user = await factory
        .define({
          props: {
            name: () => "John",
            ageText: later<string>(),
          },
          vars: {
            now: () => 2000,
            birth: () => 1980,
            age: later<number>(),
          },
        })
        .vars({
          age: async ({ now, birth }) => (await now) - (await birth),
        })
        .props({
          ageText: async ({ vars }) => `${await vars.age} years old`,
        })
        .build();
      expect(user).toStrictEqual({
        name: "John",
        ageText: "20 years old",
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
        ageText: string;
      }>();
    });
  });

  describe("when a prop depends on other props and vars", () => {
    it("can build an object with props and vars", async () => {
      const user = await factory
        .define({
          props: {
            bio: later<string>(),
            fullName: later<string>(),
            firstName: () => "John",
            lastName: () => "Doe",
          },
          vars: {
            greet: () => () => "Hello",
            title: () => `Mr.`,
          },
        })
        .props({
          fullName: async ({ vars, props }) =>
            `${await vars.title} ${await props.firstName} ${await props.lastName}`,
          bio: async ({ props, vars }) =>
            `${(await vars.greet)()}, I'm ${await props.fullName}`,
        })
        .build();
      expect(user).toStrictEqual({
        firstName: "John",
        lastName: "Doe",
        fullName: "Mr. John Doe",
        bio: "Hello, I'm Mr. John Doe",
      });
      expectTypeOf(user).toEqualTypeOf<{
        firstName: string;
        lastName: string;
        fullName: string;
        bio: string;
      }>();
    });
  });

  describe("when a prop depends on a function prop and vars", () => {
    it("can build an object with props and vars", async () => {
      const greet = () => "Hello";
      const user = await factory
        .define({
          props: {
            bio: later<string>(),
            name: () => "John Doe",
            greet: () => greet,
          },
          vars: {
            title: () => `Mr.`,
          },
        })
        .props({
          bio: async ({ props, vars }) =>
            `${(await props.greet)()}, I'm ${await vars.title} ${await props.name}.`,
        })
        .build();
      expect(user.bio).toBe("Hello, I'm Mr. John Doe.");
      expectTypeOf(user).toEqualTypeOf<{
        greet: () => string;
        name: string;
        bio: string;
      }>();
    });
  });

  describe("when a prop is called from other props multiple times", () => {
    it("memos a value and returns the same value", async () => {
      let count = 1;
      const user = await factory
        .define({
          props: {
            id: () => count++,
            cardId: later<string>(),
            roomId: later<string>(),
            employeeId: later<string>(),
          },
          vars: {},
        })
        .props({
          cardId: async ({ props }) => `card:${await props.id}`,
          roomId: async ({ props }) => `room:${await props.id}`,
          employeeId: async ({ props }) => `employee:${await props.id}`,
        })
        .build();
      expect(user).toStrictEqual({
        id: 1,
        cardId: "card:1",
        roomId: "room:1",
        employeeId: "employee:1",
      });
      expectTypeOf(user).toEqualTypeOf<{
        id: number;
        cardId: string;
        roomId: string;
        employeeId: string;
      }>();
    });
  });

  describe("when a var is called from other vars and props multiple times", () => {
    it("memos a value and returns the same value", async () => {
      let count = 1;
      const user = await factory
        .define({
          props: {
            id: later<number>(),
            cardId: later<string>(),
            roomId: later<string>(),
            employeeId: later<string>(),
          },
          vars: {
            id: () => count++,
            cardId: later<string>(),
            roomId: later<string>(),
            employeeId: later<string>(),
          },
        })
        .vars({
          cardId: async ({ id }) => `card:${await id}`,
          roomId: async ({ id }) => `room:${await id}`,
          employeeId: async ({ id }) => `employee:${await id}`,
        })
        .props({
          id: async ({ vars }) => await vars.id,
          cardId: async ({ vars }) => await vars.cardId,
          roomId: async ({ vars }) => await vars.roomId,
          employeeId: async ({ vars }) => await vars.employeeId,
        })
        .build();
      expect(user).toStrictEqual({
        id: 1,
        cardId: "card:1",
        roomId: "room:1",
        employeeId: "employee:1",
      });
      expectTypeOf(user).toEqualTypeOf<{
        id: number;
        cardId: string;
        roomId: string;
        employeeId: string;
      }>();
    });
  });

  describe("when a factory uses a trait", () => {
    it("can build an object with a trait", async () => {
      const user = await factory
        .define(
          {
            props: {
              name: () => "John",
              isAdmin: later<boolean>(),
            },
            vars: {
              role: () => "manager",
            },
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .props({
          isAdmin: async ({ vars }) => (await vars.role) === "admin",
        })
        .traits({
          guest: {
            vars: {
              role: () => "guest",
            },
          },
        })
        .traits({
          manager: () => ({
            vars: {
              role: () => "manager",
            },
          }),
          admin: (name: string) => ({
            props: {
              name: () => `${name} (admin)`,
            },
            vars: {
              role: () => "admin",
            },
          }),
        })
        .use((t) => t.guest)
        .use((t) => t.manager())
        .use((t) => t.admin("Tom"))
        .create();
      expect(user).toStrictEqual({
        name: "Tom (admin)",
        isAdmin: true,
        isSaved: true,
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
        isAdmin: boolean;
        isSaved: boolean;
      }>();
    });
  });

  describe("when a factory uses a function trait without invoking it", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
            isAdmin: later<boolean>(),
          },
          vars: {},
        })
        .traits({
          admin: (name: string) => ({
            props: {
              name: () => `${name} (admin)`,
              isAdmin: () => true,
            },
          }),
        })
        // @ts-expect-error throw a type error
        .use((t) => t.admin);
    });
  });

  describe("when a factory uses a function trait with invalid arguments", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
            isAdmin: later<boolean>(),
          },
          vars: {},
        })
        .traits({
          admin: (name: string) => ({
            props: {
              name: () => `${name} (admin)`,
              isAdmin: () => true,
            },
          }),
        })
        // @ts-expect-error throw a type error
        .use((t) => t.admin(1));
    });
  });

  describe("when an unknown prop is added", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .props({
          // @ts-expect-error throw a type error
          age: () => 20,
        });
    });
  });

  describe("when a prop that has an invalid type is added", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .props({
          // @ts-expect-error throw a type error
          name: () => 1,
        });
    });
  });

  describe("when an unknown var is added", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {
            isAdmin: () => true,
          },
        })
        .vars({
          isAdmin: () => true,
          // @ts-expect-error throw a type error
          role: () => "admin",
        });
    });
  });

  describe("when a var that has an invalid type is added", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {
            isAdmin: () => true,
          },
        })
        .vars({
          // @ts-expect-error throw a type error
          isAdmin: () => "true",
        });
    });
  });

  describe("when a trait has an unknown prop", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .traits({
          admin: {
            props: {
              name: () => "Admin",
              // @ts-expect-error throw a type error
              isAdmin: () => true,
            },
            vars: {},
          },
        });
    });
  });

  describe("when a trait has an unknown var", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {
            isAdmin: () => true,
            age: () => 20,
          },
        })
        .traits({
          admin: {
            vars: {
              isAdmin: () => true,
              // @ts-expect-error throw a type error
              role: () => "admin",
            },
          },
        });
    });
  });

  describe("when a function trait has a prop that has invalid type", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {
            isAdmin: () => true,
            age: () => 20,
          },
        })
        .traits({
          // @ts-expect-error throw a type error
          admin: () => ({
            props: {
              name: () => 1,
            },
          }),
        });
    });
  });

  describe("when a function trait has a var that has invalid type", () => {
    it("throws a type error", () => {
      factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {
            isAdmin: () => true,
            age: () => 20,
          },
        })
        .traits({
          // @ts-expect-error throw a type error
          admin: () => ({
            vars: {
              isAdmin: () => 1,
            },
          }),
        });
    });
  });

  describe("when a factory has the create function", () => {
    it("can create an object", async () => {
      const user = await factory
        .define(
          {
            props: {
              name: () => "John",
            },
            vars: {},
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .create();
      expect(user).toStrictEqual({
        name: "John",
        isSaved: true,
      });
      expectTypeOf(user).toEqualTypeOf<{
        name: string;
        isSaved: boolean;
      }>();
    });
  });

  describe("when a factory does not have the create function", () => {
    it("throws an error", async () => {
      await expect(() =>
        factory
          .define({
            props: {
              name: () => "John",
            },
            vars: {},
          })
          .create(),
      ).rejects.toThrow(
        "You must specify the 2nd argument to use the create method.",
      );
    });
  });

  describe("when a factory has the after hooks", () => {
    it("calls the after hooks after creating an object", async () => {
      const afterHooks = [vi.fn(), vi.fn()] as const;
      await factory
        .define(
          {
            props: {
              name: () => "John",
            },
            vars: {},
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .after((user) => {
          afterHooks[0](user);
        })
        .after((user) => {
          afterHooks[1](user);
        })
        .create();
      expect(afterHooks[0]).toHaveBeenCalledWith({
        name: "John",
        isSaved: true,
      });
      expect(afterHooks[1]).toHaveBeenCalledWith({
        name: "John",
        isSaved: true,
      });
    });
  });

  describe("when a factory that has the after hook builds an object", () => {
    it("does not call the after hooks", async () => {
      const after = vi.fn();
      await factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .after((user) => {
          after(user);
        })
        .build();
      expect(after).not.toHaveBeenCalled();
    });
  });

  describe("when a factory is extended", () => {
    it("can create an object", async () => {
      const { props, vars } = factory.define({
        props: {
          name: () => "John",
          unusedProp: () => "",
        },
        vars: {
          permissions: () => ["read", "write"],
          unusedVar: () => "",
        },
      }).def;
      const employee = await factory
        .define(
          {
            props: {
              name: props.name,
              isAdmin: () => false,
              canRead: later<boolean>(),
            },
            vars: {
              permissions: vars.permissions,
              role: () => "admin",
            },
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .props({
          canRead: async ({ vars }) =>
            (await vars.permissions).includes("read"),
          isAdmin: async ({ vars }) => (await vars.role) === "admin",
        })
        .create();
      expect(employee).toStrictEqual({
        name: "John",
        isSaved: true,
        isAdmin: true,
        canRead: true,
      });
      expectTypeOf(employee).toEqualTypeOf<{
        name: string;
        isSaved: boolean;
        isAdmin: boolean;
        canRead: boolean;
      }>();
    });
  });

  describe("when a factory builds multiple objects", () => {
    it("can build multiple objects", async () => {
      const users = await factory
        .define({
          props: {
            name: () => "John",
          },
          vars: {},
        })
        .buildList(2);
      expect(users).toStrictEqual([{ name: "John" }, { name: "John" }]);
      expectTypeOf(users).toEqualTypeOf<{ name: string }[]>();
    });
  });

  describe("when a factory creates multiple objects", () => {
    it("can create multiple objects", async () => {
      const users = await factory
        .define(
          {
            props: {
              name: () => "John",
            },
            vars: {},
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .createList(2);
      expect(users).toStrictEqual([
        { name: "John", isSaved: true },
        { name: "John", isSaved: true },
      ]);
      expectTypeOf(users).toEqualTypeOf<{ name: string; isSaved: boolean }[]>();
    });
  });

  describe("when a factory that has the after hooks creates multiple objects", () => {
    it("calls the after hooks after creating objects", async () => {
      const after = vi.fn();
      await factory
        .define(
          {
            props: {
              name: () => "John",
            },
            vars: {},
          },
          (props) => ({ ...props, isSaved: true }),
        )
        .after((user) => {
          after(user);
        })
        .createList(2);
      expect(after).toHaveBeenCalledTimes(2);
    });
  });

  describe("when a factory has 1:1 relation", () => {
    it("can build objects", async () => {
      const profileFactory = factory.define({
        props: {
          id: seq(1, (n) => n),
        },
        vars: {},
      });
      const userFactory = factory
        .define({
          props: {
            id: seq(1, (n) => n),
            profileId: later<number>(),
          },
          vars: {
            profile: async () => await profileFactory.build(),
          },
        })
        .props({
          profileId: async ({ vars }) => (await vars.profile).id,
        });
      const user = await userFactory.build();
      expect(user).toStrictEqual({
        id: 1,
        profileId: 1,
      });
      expectTypeOf(user).toEqualTypeOf<{
        id: number;
        profileId: number;
      }>();
    });
  });

  describe("when a factory has 1:N relation", () => {
    it("can build objects", async () => {
      const userFactory = factory.define({
        props: {
          id: seq(1, (n) => n),
        },
        vars: {},
      });
      const postFactory = factory
        .define({
          props: {
            id: seq(1, (n) => n),
            authorId: later<number>(),
          },
          vars: {
            author: async () => await userFactory.build(),
          },
        })
        .props({
          authorId: async ({ vars }) => (await vars.author).id,
        });
      const user = await userFactory.props({ id: () => 1 }).build();
      const posts = await postFactory.vars({ author: () => user }).buildList(2);
      expect(posts).toStrictEqual([
        { id: 1, authorId: 1 },
        { id: 2, authorId: 1 },
      ]);
      expectTypeOf(posts).toEqualTypeOf<{ id: number; authorId: number }[]>();
    });
  });

  describe("when a factory has the M:N relation", () => {
    it("can build objects", async () => {
      const reviewerFactory = factory.define({
        props: {
          id: seq(1, (n) => n),
        },
        vars: {},
      });
      const postFactory = factory.define({
        props: {
          id: seq(1, (n) => n),
        },
        vars: {},
      });
      const reviewerToUserFactory = factory
        .define({
          props: {
            reviewerId: later<number>(),
            postId: later<number>(),
          },
          vars: {
            reviewer: async () => await reviewerFactory.build(),
            post: async () => await postFactory.build(),
          },
        })
        .props({
          reviewerId: async ({ vars }) => (await vars.reviewer).id,
          postId: async ({ vars }) => (await vars.post).id,
        });
      const post = await postFactory.build();
      const reviewerToUser = await reviewerToUserFactory
        .vars({ post: () => post })
        .buildList(2);
      expect(reviewerToUser).toStrictEqual([
        { postId: 1, reviewerId: 1 },
        { postId: 1, reviewerId: 2 },
      ]);
      expectTypeOf(reviewerToUser).toEqualTypeOf<
        {
          reviewerId: number;
          postId: number;
        }[]
      >();
    });
  });

  describe("when a factory has the self relation", () => {
    it("can build objects", async () => {
      type User = { id: number; teacherId: number | undefined };
      const userFactory = factory
        .define({
          props: {
            id: seq(1, (n) => n),
            teacherId: later<number | undefined>(),
          },
          vars: {
            teacher: later<User | undefined>(),
          },
        })
        .vars({
          teacher: () => undefined,
        })
        .props({
          teacherId: async ({ vars }) => (await vars.teacher)?.id,
        });
      const teacher = await userFactory.build();
      const students = await userFactory
        .vars({ teacher: () => teacher })
        .buildList(2);
      expect(students).toStrictEqual([
        { id: 2, teacherId: 1 },
        { id: 3, teacherId: 1 },
      ]);
      expectTypeOf(students).toEqualTypeOf<
        {
          id: number;
          teacherId: number | undefined;
        }[]
      >();
    });
  });
});
