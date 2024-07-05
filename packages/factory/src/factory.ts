import type { After } from "../types/after";
import type { Create } from "../types/create";
import type { Deps } from "../types/deps";
import type { InitProps } from "../types/init-props";
import type { InitVars } from "../types/init-vars";
import type { PromisableRecord } from "../types/promisable-record";
import type { Props } from "../types/props";
import type { Trait } from "../types/trait";
import type { TraitSet } from "../types/trait-set";
import type { UnknownRecord } from "../types/unknown-record";
import type { Vars } from "../types/vars";
import { mapValues } from "./utils/map-values";
import { mapValuesAsync } from "./utils/map-values-async";
import { proxyDeps } from "./utils/proxy-deps";

export class Factory<
  P extends UnknownRecord,
  O,
  V extends UnknownRecord,
  T extends TraitSet<P, V, O>,
> {
  readonly #initProps: InitProps<P>;
  readonly #initVars: InitVars<V>;
  readonly #props: Props<P, V>;
  readonly #vars: Vars<V>;
  readonly #create: Create<P, O>;
  readonly #afterHooks: After<O, V>[];
  readonly #traits: T;

  constructor({
    initProps,
    initVars,
    props,
    vars,
    create,
    traits,
    afterHooks,
  }: {
    initProps: InitProps<P>;
    initVars: InitVars<V>;
    props: Props<P, V>;
    vars: Vars<V>;
    create: Create<P, O>;
    traits: T;
    afterHooks: After<O, V>[];
  }) {
    this.#initProps = initProps;
    this.#initVars = initVars;
    this.#props = props;
    this.#vars = vars;
    this.#create = create;
    this.#traits = traits;
    this.#afterHooks = afterHooks;
  }

  props(props: Partial<Props<P, V>>) {
    return new Factory({
      ...this.#clone,
      props: {
        ...this.#props,
        ...props,
      },
    });
  }

  vars(vars: Partial<Vars<V>>) {
    return new Factory({
      ...this.#clone,
      vars: {
        ...this.#vars,
        ...vars,
      },
    });
  }

  traits<T2 extends TraitSet<P, V, O>>(traits: T2 & TraitSet<P, V, O>) {
    return new Factory({
      ...this.#clone,
      traits: {
        ...this.#traits,
        ...traits,
      },
    });
  }

  use(pick: (traits: T) => Trait<P, V, O>) {
    const { props = {}, vars = {}, after } = pick(this.#traits);
    return new Factory({
      ...this.#clone,
      props: {
        ...this.#props,
        ...props,
      },
      vars: {
        ...this.#vars,
        ...vars,
      },
      afterHooks: [
        ...this.#afterHooks,
        ...(after !== undefined ? [after] : []),
      ],
    });
  }

  after(after: After<O, V>) {
    return new Factory({
      ...this.#clone,
      afterHooks: [...this.#afterHooks, after],
    });
  }

  async build() {
    const vars = proxyDeps(this.#vars);
    const props = this.#proxyProps(vars);
    return (await mapValuesAsync(props, (prop) => prop)) as P;
  }

  async buildList(count: number) {
    const objects: P[] = [];
    for (let i = 0; i < count; i++) {
      objects.push(await this.build());
    }
    return objects;
  }

  async create() {
    const vars = proxyDeps(this.#vars);
    const props = this.#proxyProps(vars);
    const object = await this.#create(
      (await mapValuesAsync(props, (prop) => prop)) as P,
    );
    for (const after of this.#afterHooks) await after(object, vars);
    return object;
  }

  async createList(count: number) {
    const objects: O[] = [];
    for (let i = 0; i < count; i++) {
      objects.push(await this.create());
    }
    return objects;
  }

  get def() {
    return {
      props: this.#initProps,
      vars: this.#initVars,
    };
  }

  get #clone() {
    return {
      initProps: this.#initProps,
      initVars: this.#initVars,
      props: this.#props,
      create: this.#create,
      traits: this.#traits,
      afterHooks: this.#afterHooks,
      vars: this.#vars,
    };
  }

  #proxyProps(vars: PromisableRecord<V>) {
    return proxyDeps(
      mapValues(
        this.#props,
        (prop) => (props) => prop({ props, vars }),
      ) as Deps<P>,
    );
  }
}

const noCreate = () => {
  throw new Error(
    "You must specify the 2nd argument to use the create method.",
  );
};

const define = <
  P extends UnknownRecord,
  O = never,
  V extends UnknownRecord = Record<never, never>,
>(
  { props, vars }: { props: InitProps<P>; vars: InitVars<V> },
  create: Create<P, O> = noCreate,
) =>
  new Factory({
    initProps: props,
    initVars: vars,
    traits: {},
    afterHooks: [],
    props,
    vars,
    create,
  });

export const factory = { define };
