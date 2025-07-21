/**
 * Client
 **/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model chamados
 *
 */
export type chamados = $Result.DefaultSelection<Prisma.$chamadosPayload>;
/**
 * Model chamados_apontamentos
 *
 */
export type chamados_apontamentos =
  $Result.DefaultSelection<Prisma.$chamados_apontamentosPayload>;
/**
 * Model Apontamentos
 *
 */
export type Apontamentos =
  $Result.DefaultSelection<Prisma.$ApontamentosPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Chamados
 * const chamados = await prisma.chamados.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Chamados
   * const chamados = await prisma.chamados.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.chamados`: Exposes CRUD operations for the **chamados** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Chamados
   * const chamados = await prisma.chamados.findMany()
   * ```
   */
  get chamados(): Prisma.chamadosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chamados_apontamentos`: Exposes CRUD operations for the **chamados_apontamentos** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Chamados_apontamentos
   * const chamados_apontamentos = await prisma.chamados_apontamentos.findMany()
   * ```
   */
  get chamados_apontamentos(): Prisma.chamados_apontamentosDelegate<
    ExtArgs,
    ClientOptions
  >;

  /**
   * `prisma.apontamentos`: Exposes CRUD operations for the **Apontamentos** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Apontamentos
   * const apontamentos = await prisma.apontamentos.findMany()
   * ```
   */
  get apontamentos(): Prisma.ApontamentosDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    chamados: 'chamados';
    chamados_apontamentos: 'chamados_apontamentos';
    Apontamentos: 'Apontamentos';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    solutiiDb?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<
      { extArgs: $Extensions.InternalArgs },
      $Utils.Record<string, any>
    > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: 'chamados' | 'chamados_apontamentos' | 'apontamentos';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      chamados: {
        payload: Prisma.$chamadosPayload<ExtArgs>;
        fields: Prisma.chamadosFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.chamadosFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.chamadosFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          findFirst: {
            args: Prisma.chamadosFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.chamadosFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          findMany: {
            args: Prisma.chamadosFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>[];
          };
          create: {
            args: Prisma.chamadosCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          createMany: {
            args: Prisma.chamadosCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.chamadosCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>[];
          };
          delete: {
            args: Prisma.chamadosDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          update: {
            args: Prisma.chamadosUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          deleteMany: {
            args: Prisma.chamadosDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.chamadosUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.chamadosUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>[];
          };
          upsert: {
            args: Prisma.chamadosUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamadosPayload>;
          };
          aggregate: {
            args: Prisma.ChamadosAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateChamados>;
          };
          groupBy: {
            args: Prisma.chamadosGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ChamadosGroupByOutputType>[];
          };
          count: {
            args: Prisma.chamadosCountArgs<ExtArgs>;
            result: $Utils.Optional<ChamadosCountAggregateOutputType> | number;
          };
        };
      };
      chamados_apontamentos: {
        payload: Prisma.$chamados_apontamentosPayload<ExtArgs>;
        fields: Prisma.chamados_apontamentosFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.chamados_apontamentosFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.chamados_apontamentosFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          findFirst: {
            args: Prisma.chamados_apontamentosFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.chamados_apontamentosFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          findMany: {
            args: Prisma.chamados_apontamentosFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>[];
          };
          create: {
            args: Prisma.chamados_apontamentosCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          createMany: {
            args: Prisma.chamados_apontamentosCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.chamados_apontamentosCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>[];
          };
          delete: {
            args: Prisma.chamados_apontamentosDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          update: {
            args: Prisma.chamados_apontamentosUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          deleteMany: {
            args: Prisma.chamados_apontamentosDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.chamados_apontamentosUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.chamados_apontamentosUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>[];
          };
          upsert: {
            args: Prisma.chamados_apontamentosUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$chamados_apontamentosPayload>;
          };
          aggregate: {
            args: Prisma.Chamados_apontamentosAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateChamados_apontamentos>;
          };
          groupBy: {
            args: Prisma.chamados_apontamentosGroupByArgs<ExtArgs>;
            result: $Utils.Optional<Chamados_apontamentosGroupByOutputType>[];
          };
          count: {
            args: Prisma.chamados_apontamentosCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<Chamados_apontamentosCountAggregateOutputType>
              | number;
          };
        };
      };
      Apontamentos: {
        payload: Prisma.$ApontamentosPayload<ExtArgs>;
        fields: Prisma.ApontamentosFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ApontamentosFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ApontamentosFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          findFirst: {
            args: Prisma.ApontamentosFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ApontamentosFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          findMany: {
            args: Prisma.ApontamentosFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>[];
          };
          create: {
            args: Prisma.ApontamentosCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          createMany: {
            args: Prisma.ApontamentosCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ApontamentosCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>[];
          };
          delete: {
            args: Prisma.ApontamentosDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          update: {
            args: Prisma.ApontamentosUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          deleteMany: {
            args: Prisma.ApontamentosDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ApontamentosUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ApontamentosUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>[];
          };
          upsert: {
            args: Prisma.ApontamentosUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ApontamentosPayload>;
          };
          aggregate: {
            args: Prisma.ApontamentosAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateApontamentos>;
          };
          groupBy: {
            args: Prisma.ApontamentosGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ApontamentosGroupByOutputType>[];
          };
          count: {
            args: Prisma.ApontamentosCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<ApontamentosCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    chamados?: chamadosOmit;
    chamados_apontamentos?: chamados_apontamentosOmit;
    apontamentos?: ApontamentosOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type GetLogType<T extends LogLevel | LogDefinition> =
    T extends LogDefinition
      ? T['emit'] extends 'event'
        ? T['level']
        : never
      : never;
  export type GetEvents<T extends any> =
    T extends Array<LogLevel | LogDefinition>
      ?
          | GetLogType<T[0]>
          | GetLogType<T[1]>
          | GetLogType<T[2]>
          | GetLogType<T[3]>
      : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>;

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type ChamadosCountOutputType
   */

  export type ChamadosCountOutputType = {
    apontamentos: number;
  };

  export type ChamadosCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apontamentos?: boolean | ChamadosCountOutputTypeCountApontamentosArgs;
  };

  // Custom InputTypes
  /**
   * ChamadosCountOutputType without action
   */
  export type ChamadosCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ChamadosCountOutputType
     */
    select?: ChamadosCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * ChamadosCountOutputType without action
   */
  export type ChamadosCountOutputTypeCountApontamentosArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: chamados_apontamentosWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model chamados
   */

  export type AggregateChamados = {
    _count: ChamadosCountAggregateOutputType | null;
    _avg: ChamadosAvgAggregateOutputType | null;
    _sum: ChamadosSumAggregateOutputType | null;
    _min: ChamadosMinAggregateOutputType | null;
    _max: ChamadosMaxAggregateOutputType | null;
  };

  export type ChamadosAvgAggregateOutputType = {
    qtd_limmes_tarefa: number | null;
  };

  export type ChamadosSumAggregateOutputType = {
    qtd_limmes_tarefa: number | null;
  };

  export type ChamadosMinAggregateOutputType = {
    cod_chamado: string | null;
    data_chamado: string | null;
    hora_chamado: string | null;
    data_hora_chamado: Date | null;
    conclusao_chamado: string | null;
    status_chamado: string | null;
    dtenvio_chamado: Date | null;
    cod_recurso: string | null;
    nome_recurso: string | null;
    cod_cliente: string | null;
    nome_cliente: string | null;
    razao_cliente: string | null;
    assunto_chamado: string | null;
    email_chamado: string | null;
    prior_chamado: string | null;
    cod_classificacao: string | null;
    qtd_limmes_tarefa: number | null;
    dat_load: Date | null;
  };

  export type ChamadosMaxAggregateOutputType = {
    cod_chamado: string | null;
    data_chamado: string | null;
    hora_chamado: string | null;
    data_hora_chamado: Date | null;
    conclusao_chamado: string | null;
    status_chamado: string | null;
    dtenvio_chamado: Date | null;
    cod_recurso: string | null;
    nome_recurso: string | null;
    cod_cliente: string | null;
    nome_cliente: string | null;
    razao_cliente: string | null;
    assunto_chamado: string | null;
    email_chamado: string | null;
    prior_chamado: string | null;
    cod_classificacao: string | null;
    qtd_limmes_tarefa: number | null;
    dat_load: Date | null;
  };

  export type ChamadosCountAggregateOutputType = {
    cod_chamado: number;
    data_chamado: number;
    hora_chamado: number;
    data_hora_chamado: number;
    conclusao_chamado: number;
    status_chamado: number;
    dtenvio_chamado: number;
    cod_recurso: number;
    nome_recurso: number;
    cod_cliente: number;
    nome_cliente: number;
    razao_cliente: number;
    assunto_chamado: number;
    email_chamado: number;
    prior_chamado: number;
    cod_classificacao: number;
    qtd_limmes_tarefa: number;
    dat_load: number;
    _all: number;
  };

  export type ChamadosAvgAggregateInputType = {
    qtd_limmes_tarefa?: true;
  };

  export type ChamadosSumAggregateInputType = {
    qtd_limmes_tarefa?: true;
  };

  export type ChamadosMinAggregateInputType = {
    cod_chamado?: true;
    data_chamado?: true;
    hora_chamado?: true;
    data_hora_chamado?: true;
    conclusao_chamado?: true;
    status_chamado?: true;
    dtenvio_chamado?: true;
    cod_recurso?: true;
    nome_recurso?: true;
    cod_cliente?: true;
    nome_cliente?: true;
    razao_cliente?: true;
    assunto_chamado?: true;
    email_chamado?: true;
    prior_chamado?: true;
    cod_classificacao?: true;
    qtd_limmes_tarefa?: true;
    dat_load?: true;
  };

  export type ChamadosMaxAggregateInputType = {
    cod_chamado?: true;
    data_chamado?: true;
    hora_chamado?: true;
    data_hora_chamado?: true;
    conclusao_chamado?: true;
    status_chamado?: true;
    dtenvio_chamado?: true;
    cod_recurso?: true;
    nome_recurso?: true;
    cod_cliente?: true;
    nome_cliente?: true;
    razao_cliente?: true;
    assunto_chamado?: true;
    email_chamado?: true;
    prior_chamado?: true;
    cod_classificacao?: true;
    qtd_limmes_tarefa?: true;
    dat_load?: true;
  };

  export type ChamadosCountAggregateInputType = {
    cod_chamado?: true;
    data_chamado?: true;
    hora_chamado?: true;
    data_hora_chamado?: true;
    conclusao_chamado?: true;
    status_chamado?: true;
    dtenvio_chamado?: true;
    cod_recurso?: true;
    nome_recurso?: true;
    cod_cliente?: true;
    nome_cliente?: true;
    razao_cliente?: true;
    assunto_chamado?: true;
    email_chamado?: true;
    prior_chamado?: true;
    cod_classificacao?: true;
    qtd_limmes_tarefa?: true;
    dat_load?: true;
    _all?: true;
  };

  export type ChamadosAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which chamados to aggregate.
     */
    where?: chamadosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados to fetch.
     */
    orderBy?:
      | chamadosOrderByWithRelationInput
      | chamadosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: chamadosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned chamados
     **/
    _count?: true | ChamadosCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: ChamadosAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: ChamadosSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ChamadosMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ChamadosMaxAggregateInputType;
  };

  export type GetChamadosAggregateType<T extends ChamadosAggregateArgs> = {
    [P in keyof T & keyof AggregateChamados]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChamados[P]>
      : GetScalarType<T[P], AggregateChamados[P]>;
  };

  export type chamadosGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: chamadosWhereInput;
    orderBy?:
      | chamadosOrderByWithAggregationInput
      | chamadosOrderByWithAggregationInput[];
    by: ChamadosScalarFieldEnum[] | ChamadosScalarFieldEnum;
    having?: chamadosScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ChamadosCountAggregateInputType | true;
    _avg?: ChamadosAvgAggregateInputType;
    _sum?: ChamadosSumAggregateInputType;
    _min?: ChamadosMinAggregateInputType;
    _max?: ChamadosMaxAggregateInputType;
  };

  export type ChamadosGroupByOutputType = {
    cod_chamado: string;
    data_chamado: string | null;
    hora_chamado: string | null;
    data_hora_chamado: Date | null;
    conclusao_chamado: string | null;
    status_chamado: string | null;
    dtenvio_chamado: Date | null;
    cod_recurso: string | null;
    nome_recurso: string | null;
    cod_cliente: string | null;
    nome_cliente: string | null;
    razao_cliente: string | null;
    assunto_chamado: string | null;
    email_chamado: string | null;
    prior_chamado: string | null;
    cod_classificacao: string | null;
    qtd_limmes_tarefa: number | null;
    dat_load: Date | null;
    _count: ChamadosCountAggregateOutputType | null;
    _avg: ChamadosAvgAggregateOutputType | null;
    _sum: ChamadosSumAggregateOutputType | null;
    _min: ChamadosMinAggregateOutputType | null;
    _max: ChamadosMaxAggregateOutputType | null;
  };

  type GetChamadosGroupByPayload<T extends chamadosGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ChamadosGroupByOutputType, T['by']> & {
          [P in keyof T & keyof ChamadosGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChamadosGroupByOutputType[P]>
            : GetScalarType<T[P], ChamadosGroupByOutputType[P]>;
        }
      >
    >;

  export type chamadosSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      cod_chamado?: boolean;
      data_chamado?: boolean;
      hora_chamado?: boolean;
      data_hora_chamado?: boolean;
      conclusao_chamado?: boolean;
      status_chamado?: boolean;
      dtenvio_chamado?: boolean;
      cod_recurso?: boolean;
      nome_recurso?: boolean;
      cod_cliente?: boolean;
      nome_cliente?: boolean;
      razao_cliente?: boolean;
      assunto_chamado?: boolean;
      email_chamado?: boolean;
      prior_chamado?: boolean;
      cod_classificacao?: boolean;
      qtd_limmes_tarefa?: boolean;
      dat_load?: boolean;
      apontamentos?: boolean | chamados$apontamentosArgs<ExtArgs>;
      _count?: boolean | ChamadosCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['chamados']
  >;

  export type chamadosSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      cod_chamado?: boolean;
      data_chamado?: boolean;
      hora_chamado?: boolean;
      data_hora_chamado?: boolean;
      conclusao_chamado?: boolean;
      status_chamado?: boolean;
      dtenvio_chamado?: boolean;
      cod_recurso?: boolean;
      nome_recurso?: boolean;
      cod_cliente?: boolean;
      nome_cliente?: boolean;
      razao_cliente?: boolean;
      assunto_chamado?: boolean;
      email_chamado?: boolean;
      prior_chamado?: boolean;
      cod_classificacao?: boolean;
      qtd_limmes_tarefa?: boolean;
      dat_load?: boolean;
    },
    ExtArgs['result']['chamados']
  >;

  export type chamadosSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      cod_chamado?: boolean;
      data_chamado?: boolean;
      hora_chamado?: boolean;
      data_hora_chamado?: boolean;
      conclusao_chamado?: boolean;
      status_chamado?: boolean;
      dtenvio_chamado?: boolean;
      cod_recurso?: boolean;
      nome_recurso?: boolean;
      cod_cliente?: boolean;
      nome_cliente?: boolean;
      razao_cliente?: boolean;
      assunto_chamado?: boolean;
      email_chamado?: boolean;
      prior_chamado?: boolean;
      cod_classificacao?: boolean;
      qtd_limmes_tarefa?: boolean;
      dat_load?: boolean;
    },
    ExtArgs['result']['chamados']
  >;

  export type chamadosSelectScalar = {
    cod_chamado?: boolean;
    data_chamado?: boolean;
    hora_chamado?: boolean;
    data_hora_chamado?: boolean;
    conclusao_chamado?: boolean;
    status_chamado?: boolean;
    dtenvio_chamado?: boolean;
    cod_recurso?: boolean;
    nome_recurso?: boolean;
    cod_cliente?: boolean;
    nome_cliente?: boolean;
    razao_cliente?: boolean;
    assunto_chamado?: boolean;
    email_chamado?: boolean;
    prior_chamado?: boolean;
    cod_classificacao?: boolean;
    qtd_limmes_tarefa?: boolean;
    dat_load?: boolean;
  };

  export type chamadosOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'cod_chamado'
    | 'data_chamado'
    | 'hora_chamado'
    | 'data_hora_chamado'
    | 'conclusao_chamado'
    | 'status_chamado'
    | 'dtenvio_chamado'
    | 'cod_recurso'
    | 'nome_recurso'
    | 'cod_cliente'
    | 'nome_cliente'
    | 'razao_cliente'
    | 'assunto_chamado'
    | 'email_chamado'
    | 'prior_chamado'
    | 'cod_classificacao'
    | 'qtd_limmes_tarefa'
    | 'dat_load',
    ExtArgs['result']['chamados']
  >;
  export type chamadosInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    apontamentos?: boolean | chamados$apontamentosArgs<ExtArgs>;
    _count?: boolean | ChamadosCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type chamadosIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type chamadosIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $chamadosPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'chamados';
    objects: {
      apontamentos: Prisma.$chamados_apontamentosPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        cod_chamado: string;
        data_chamado: string | null;
        hora_chamado: string | null;
        data_hora_chamado: Date | null;
        conclusao_chamado: string | null;
        status_chamado: string | null;
        dtenvio_chamado: Date | null;
        cod_recurso: string | null;
        nome_recurso: string | null;
        cod_cliente: string | null;
        nome_cliente: string | null;
        razao_cliente: string | null;
        assunto_chamado: string | null;
        email_chamado: string | null;
        prior_chamado: string | null;
        cod_classificacao: string | null;
        qtd_limmes_tarefa: number | null;
        dat_load: Date | null;
      },
      ExtArgs['result']['chamados']
    >;
    composites: {};
  };

  type chamadosGetPayload<
    S extends boolean | null | undefined | chamadosDefaultArgs,
  > = $Result.GetResult<Prisma.$chamadosPayload, S>;

  type chamadosCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<chamadosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ChamadosCountAggregateInputType | true;
  };

  export interface chamadosDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['chamados'];
      meta: { name: 'chamados' };
    };
    /**
     * Find zero or one Chamados that matches the filter.
     * @param {chamadosFindUniqueArgs} args - Arguments to find a Chamados
     * @example
     * // Get one Chamados
     * const chamados = await prisma.chamados.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends chamadosFindUniqueArgs>(
      args: SelectSubset<T, chamadosFindUniqueArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Chamados that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {chamadosFindUniqueOrThrowArgs} args - Arguments to find a Chamados
     * @example
     * // Get one Chamados
     * const chamados = await prisma.chamados.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends chamadosFindUniqueOrThrowArgs>(
      args: SelectSubset<T, chamadosFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Chamados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosFindFirstArgs} args - Arguments to find a Chamados
     * @example
     * // Get one Chamados
     * const chamados = await prisma.chamados.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends chamadosFindFirstArgs>(
      args?: SelectSubset<T, chamadosFindFirstArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Chamados that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosFindFirstOrThrowArgs} args - Arguments to find a Chamados
     * @example
     * // Get one Chamados
     * const chamados = await prisma.chamados.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends chamadosFindFirstOrThrowArgs>(
      args?: SelectSubset<T, chamadosFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Chamados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Chamados
     * const chamados = await prisma.chamados.findMany()
     *
     * // Get first 10 Chamados
     * const chamados = await prisma.chamados.findMany({ take: 10 })
     *
     * // Only select the `cod_chamado`
     * const chamadosWithCod_chamadoOnly = await prisma.chamados.findMany({ select: { cod_chamado: true } })
     *
     */
    findMany<T extends chamadosFindManyArgs>(
      args?: SelectSubset<T, chamadosFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Chamados.
     * @param {chamadosCreateArgs} args - Arguments to create a Chamados.
     * @example
     * // Create one Chamados
     * const Chamados = await prisma.chamados.create({
     *   data: {
     *     // ... data to create a Chamados
     *   }
     * })
     *
     */
    create<T extends chamadosCreateArgs>(
      args: SelectSubset<T, chamadosCreateArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Chamados.
     * @param {chamadosCreateManyArgs} args - Arguments to create many Chamados.
     * @example
     * // Create many Chamados
     * const chamados = await prisma.chamados.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends chamadosCreateManyArgs>(
      args?: SelectSubset<T, chamadosCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Chamados and returns the data saved in the database.
     * @param {chamadosCreateManyAndReturnArgs} args - Arguments to create many Chamados.
     * @example
     * // Create many Chamados
     * const chamados = await prisma.chamados.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Chamados and only return the `cod_chamado`
     * const chamadosWithCod_chamadoOnly = await prisma.chamados.createManyAndReturn({
     *   select: { cod_chamado: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends chamadosCreateManyAndReturnArgs>(
      args?: SelectSubset<T, chamadosCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Chamados.
     * @param {chamadosDeleteArgs} args - Arguments to delete one Chamados.
     * @example
     * // Delete one Chamados
     * const Chamados = await prisma.chamados.delete({
     *   where: {
     *     // ... filter to delete one Chamados
     *   }
     * })
     *
     */
    delete<T extends chamadosDeleteArgs>(
      args: SelectSubset<T, chamadosDeleteArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Chamados.
     * @param {chamadosUpdateArgs} args - Arguments to update one Chamados.
     * @example
     * // Update one Chamados
     * const chamados = await prisma.chamados.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends chamadosUpdateArgs>(
      args: SelectSubset<T, chamadosUpdateArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Chamados.
     * @param {chamadosDeleteManyArgs} args - Arguments to filter Chamados to delete.
     * @example
     * // Delete a few Chamados
     * const { count } = await prisma.chamados.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends chamadosDeleteManyArgs>(
      args?: SelectSubset<T, chamadosDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Chamados
     * const chamados = await prisma.chamados.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends chamadosUpdateManyArgs>(
      args: SelectSubset<T, chamadosUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Chamados and returns the data updated in the database.
     * @param {chamadosUpdateManyAndReturnArgs} args - Arguments to update many Chamados.
     * @example
     * // Update many Chamados
     * const chamados = await prisma.chamados.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Chamados and only return the `cod_chamado`
     * const chamadosWithCod_chamadoOnly = await prisma.chamados.updateManyAndReturn({
     *   select: { cod_chamado: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends chamadosUpdateManyAndReturnArgs>(
      args: SelectSubset<T, chamadosUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Chamados.
     * @param {chamadosUpsertArgs} args - Arguments to update or create a Chamados.
     * @example
     * // Update or create a Chamados
     * const chamados = await prisma.chamados.upsert({
     *   create: {
     *     // ... data to create a Chamados
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Chamados we want to update
     *   }
     * })
     */
    upsert<T extends chamadosUpsertArgs>(
      args: SelectSubset<T, chamadosUpsertArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosCountArgs} args - Arguments to filter Chamados to count.
     * @example
     * // Count the number of Chamados
     * const count = await prisma.chamados.count({
     *   where: {
     *     // ... the filter for the Chamados we want to count
     *   }
     * })
     **/
    count<T extends chamadosCountArgs>(
      args?: Subset<T, chamadosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChamadosCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ChamadosAggregateArgs>(
      args: Subset<T, ChamadosAggregateArgs>,
    ): Prisma.PrismaPromise<GetChamadosAggregateType<T>>;

    /**
     * Group by Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamadosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends chamadosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: chamadosGroupByArgs['orderBy'] }
        : { orderBy?: chamadosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, chamadosGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetChamadosGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the chamados model
     */
    readonly fields: chamadosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for chamados.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__chamadosClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    apontamentos<T extends chamados$apontamentosArgs<ExtArgs> = {}>(
      args?: Subset<T, chamados$apontamentosArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$chamados_apontamentosPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the chamados model
   */
  interface chamadosFieldRefs {
    readonly cod_chamado: FieldRef<'chamados', 'String'>;
    readonly data_chamado: FieldRef<'chamados', 'String'>;
    readonly hora_chamado: FieldRef<'chamados', 'String'>;
    readonly data_hora_chamado: FieldRef<'chamados', 'DateTime'>;
    readonly conclusao_chamado: FieldRef<'chamados', 'String'>;
    readonly status_chamado: FieldRef<'chamados', 'String'>;
    readonly dtenvio_chamado: FieldRef<'chamados', 'DateTime'>;
    readonly cod_recurso: FieldRef<'chamados', 'String'>;
    readonly nome_recurso: FieldRef<'chamados', 'String'>;
    readonly cod_cliente: FieldRef<'chamados', 'String'>;
    readonly nome_cliente: FieldRef<'chamados', 'String'>;
    readonly razao_cliente: FieldRef<'chamados', 'String'>;
    readonly assunto_chamado: FieldRef<'chamados', 'String'>;
    readonly email_chamado: FieldRef<'chamados', 'String'>;
    readonly prior_chamado: FieldRef<'chamados', 'String'>;
    readonly cod_classificacao: FieldRef<'chamados', 'String'>;
    readonly qtd_limmes_tarefa: FieldRef<'chamados', 'Float'>;
    readonly dat_load: FieldRef<'chamados', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * chamados findUnique
   */
  export type chamadosFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados to fetch.
     */
    where: chamadosWhereUniqueInput;
  };

  /**
   * chamados findUniqueOrThrow
   */
  export type chamadosFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados to fetch.
     */
    where: chamadosWhereUniqueInput;
  };

  /**
   * chamados findFirst
   */
  export type chamadosFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados to fetch.
     */
    where?: chamadosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados to fetch.
     */
    orderBy?:
      | chamadosOrderByWithRelationInput
      | chamadosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for chamados.
     */
    cursor?: chamadosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of chamados.
     */
    distinct?: ChamadosScalarFieldEnum | ChamadosScalarFieldEnum[];
  };

  /**
   * chamados findFirstOrThrow
   */
  export type chamadosFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados to fetch.
     */
    where?: chamadosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados to fetch.
     */
    orderBy?:
      | chamadosOrderByWithRelationInput
      | chamadosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for chamados.
     */
    cursor?: chamadosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of chamados.
     */
    distinct?: ChamadosScalarFieldEnum | ChamadosScalarFieldEnum[];
  };

  /**
   * chamados findMany
   */
  export type chamadosFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados to fetch.
     */
    where?: chamadosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados to fetch.
     */
    orderBy?:
      | chamadosOrderByWithRelationInput
      | chamadosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing chamados.
     */
    cursor?: chamadosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados.
     */
    skip?: number;
    distinct?: ChamadosScalarFieldEnum | ChamadosScalarFieldEnum[];
  };

  /**
   * chamados create
   */
  export type chamadosCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * The data needed to create a chamados.
     */
    data: XOR<chamadosCreateInput, chamadosUncheckedCreateInput>;
  };

  /**
   * chamados createMany
   */
  export type chamadosCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many chamados.
     */
    data: chamadosCreateManyInput | chamadosCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * chamados createManyAndReturn
   */
  export type chamadosCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * The data used to create many chamados.
     */
    data: chamadosCreateManyInput | chamadosCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * chamados update
   */
  export type chamadosUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * The data needed to update a chamados.
     */
    data: XOR<chamadosUpdateInput, chamadosUncheckedUpdateInput>;
    /**
     * Choose, which chamados to update.
     */
    where: chamadosWhereUniqueInput;
  };

  /**
   * chamados updateMany
   */
  export type chamadosUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update chamados.
     */
    data: XOR<
      chamadosUpdateManyMutationInput,
      chamadosUncheckedUpdateManyInput
    >;
    /**
     * Filter which chamados to update
     */
    where?: chamadosWhereInput;
    /**
     * Limit how many chamados to update.
     */
    limit?: number;
  };

  /**
   * chamados updateManyAndReturn
   */
  export type chamadosUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * The data used to update chamados.
     */
    data: XOR<
      chamadosUpdateManyMutationInput,
      chamadosUncheckedUpdateManyInput
    >;
    /**
     * Filter which chamados to update
     */
    where?: chamadosWhereInput;
    /**
     * Limit how many chamados to update.
     */
    limit?: number;
  };

  /**
   * chamados upsert
   */
  export type chamadosUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * The filter to search for the chamados to update in case it exists.
     */
    where: chamadosWhereUniqueInput;
    /**
     * In case the chamados found by the `where` argument doesn't exist, create a new chamados with this data.
     */
    create: XOR<chamadosCreateInput, chamadosUncheckedCreateInput>;
    /**
     * In case the chamados was found with the provided `where` argument, update it with this data.
     */
    update: XOR<chamadosUpdateInput, chamadosUncheckedUpdateInput>;
  };

  /**
   * chamados delete
   */
  export type chamadosDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    /**
     * Filter which chamados to delete.
     */
    where: chamadosWhereUniqueInput;
  };

  /**
   * chamados deleteMany
   */
  export type chamadosDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which chamados to delete
     */
    where?: chamadosWhereInput;
    /**
     * Limit how many chamados to delete.
     */
    limit?: number;
  };

  /**
   * chamados.apontamentos
   */
  export type chamados$apontamentosArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    where?: chamados_apontamentosWhereInput;
    orderBy?:
      | chamados_apontamentosOrderByWithRelationInput
      | chamados_apontamentosOrderByWithRelationInput[];
    cursor?: chamados_apontamentosWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | Chamados_apontamentosScalarFieldEnum
      | Chamados_apontamentosScalarFieldEnum[];
  };

  /**
   * chamados without action
   */
  export type chamadosDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
  };

  /**
   * Model chamados_apontamentos
   */

  export type AggregateChamados_apontamentos = {
    _count: Chamados_apontamentosCountAggregateOutputType | null;
    _avg: Chamados_apontamentosAvgAggregateOutputType | null;
    _sum: Chamados_apontamentosSumAggregateOutputType | null;
    _min: Chamados_apontamentosMinAggregateOutputType | null;
    _max: Chamados_apontamentosMaxAggregateOutputType | null;
  };

  export type Chamados_apontamentosAvgAggregateOutputType = {
    limmes_tarefa: number | null;
  };

  export type Chamados_apontamentosSumAggregateOutputType = {
    limmes_tarefa: number | null;
  };

  export type Chamados_apontamentosMinAggregateOutputType = {
    chamado_os: string | null;
    cod_os: string | null;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
  };

  export type Chamados_apontamentosMaxAggregateOutputType = {
    chamado_os: string | null;
    cod_os: string | null;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
  };

  export type Chamados_apontamentosCountAggregateOutputType = {
    chamado_os: number;
    cod_os: number;
    dtini_os: number;
    hrini_os: number;
    hrfim_os: number;
    dthrini_apont: number;
    dthrfim_apont: number;
    respcli_os: number;
    obs: number;
    codrec_os: number;
    cod_cliente: number;
    limmes_tarefa: number;
    dat_load: number;
    _all: number;
  };

  export type Chamados_apontamentosAvgAggregateInputType = {
    limmes_tarefa?: true;
  };

  export type Chamados_apontamentosSumAggregateInputType = {
    limmes_tarefa?: true;
  };

  export type Chamados_apontamentosMinAggregateInputType = {
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
  };

  export type Chamados_apontamentosMaxAggregateInputType = {
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
  };

  export type Chamados_apontamentosCountAggregateInputType = {
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
    _all?: true;
  };

  export type Chamados_apontamentosAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which chamados_apontamentos to aggregate.
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados_apontamentos to fetch.
     */
    orderBy?:
      | chamados_apontamentosOrderByWithRelationInput
      | chamados_apontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: chamados_apontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados_apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados_apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned chamados_apontamentos
     **/
    _count?: true | Chamados_apontamentosCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: Chamados_apontamentosAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: Chamados_apontamentosSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: Chamados_apontamentosMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: Chamados_apontamentosMaxAggregateInputType;
  };

  export type GetChamados_apontamentosAggregateType<
    T extends Chamados_apontamentosAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateChamados_apontamentos]: P extends
      | '_count'
      | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChamados_apontamentos[P]>
      : GetScalarType<T[P], AggregateChamados_apontamentos[P]>;
  };

  export type chamados_apontamentosGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: chamados_apontamentosWhereInput;
    orderBy?:
      | chamados_apontamentosOrderByWithAggregationInput
      | chamados_apontamentosOrderByWithAggregationInput[];
    by:
      | Chamados_apontamentosScalarFieldEnum[]
      | Chamados_apontamentosScalarFieldEnum;
    having?: chamados_apontamentosScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: Chamados_apontamentosCountAggregateInputType | true;
    _avg?: Chamados_apontamentosAvgAggregateInputType;
    _sum?: Chamados_apontamentosSumAggregateInputType;
    _min?: Chamados_apontamentosMinAggregateInputType;
    _max?: Chamados_apontamentosMaxAggregateInputType;
  };

  export type Chamados_apontamentosGroupByOutputType = {
    chamado_os: string | null;
    cod_os: string;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
    _count: Chamados_apontamentosCountAggregateOutputType | null;
    _avg: Chamados_apontamentosAvgAggregateOutputType | null;
    _sum: Chamados_apontamentosSumAggregateOutputType | null;
    _min: Chamados_apontamentosMinAggregateOutputType | null;
    _max: Chamados_apontamentosMaxAggregateOutputType | null;
  };

  type GetChamados_apontamentosGroupByPayload<
    T extends chamados_apontamentosGroupByArgs,
  > = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Chamados_apontamentosGroupByOutputType, T['by']> & {
        [P in keyof T &
          keyof Chamados_apontamentosGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], Chamados_apontamentosGroupByOutputType[P]>
          : GetScalarType<T[P], Chamados_apontamentosGroupByOutputType[P]>;
      }
    >
  >;

  export type chamados_apontamentosSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
    },
    ExtArgs['result']['chamados_apontamentos']
  >;

  export type chamados_apontamentosSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
    },
    ExtArgs['result']['chamados_apontamentos']
  >;

  export type chamados_apontamentosSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
    },
    ExtArgs['result']['chamados_apontamentos']
  >;

  export type chamados_apontamentosSelectScalar = {
    chamado_os?: boolean;
    cod_os?: boolean;
    dtini_os?: boolean;
    hrini_os?: boolean;
    hrfim_os?: boolean;
    dthrini_apont?: boolean;
    dthrfim_apont?: boolean;
    respcli_os?: boolean;
    obs?: boolean;
    codrec_os?: boolean;
    cod_cliente?: boolean;
    limmes_tarefa?: boolean;
    dat_load?: boolean;
  };

  export type chamados_apontamentosOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'chamado_os'
    | 'cod_os'
    | 'dtini_os'
    | 'hrini_os'
    | 'hrfim_os'
    | 'dthrini_apont'
    | 'dthrfim_apont'
    | 'respcli_os'
    | 'obs'
    | 'codrec_os'
    | 'cod_cliente'
    | 'limmes_tarefa'
    | 'dat_load',
    ExtArgs['result']['chamados_apontamentos']
  >;
  export type chamados_apontamentosInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
  };
  export type chamados_apontamentosIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
  };
  export type chamados_apontamentosIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    chamado?: boolean | chamados_apontamentos$chamadoArgs<ExtArgs>;
  };

  export type $chamados_apontamentosPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'chamados_apontamentos';
    objects: {
      chamado: Prisma.$chamadosPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        chamado_os: string | null;
        cod_os: string;
        dtini_os: string | null;
        hrini_os: string | null;
        hrfim_os: string | null;
        dthrini_apont: Date | null;
        dthrfim_apont: Date | null;
        respcli_os: string | null;
        obs: string | null;
        codrec_os: string | null;
        cod_cliente: string | null;
        limmes_tarefa: number | null;
        dat_load: Date | null;
      },
      ExtArgs['result']['chamados_apontamentos']
    >;
    composites: {};
  };

  type chamados_apontamentosGetPayload<
    S extends boolean | null | undefined | chamados_apontamentosDefaultArgs,
  > = $Result.GetResult<Prisma.$chamados_apontamentosPayload, S>;

  type chamados_apontamentosCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    chamados_apontamentosFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: Chamados_apontamentosCountAggregateInputType | true;
  };

  export interface chamados_apontamentosDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['chamados_apontamentos'];
      meta: { name: 'chamados_apontamentos' };
    };
    /**
     * Find zero or one Chamados_apontamentos that matches the filter.
     * @param {chamados_apontamentosFindUniqueArgs} args - Arguments to find a Chamados_apontamentos
     * @example
     * // Get one Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends chamados_apontamentosFindUniqueArgs>(
      args: SelectSubset<T, chamados_apontamentosFindUniqueArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Chamados_apontamentos that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {chamados_apontamentosFindUniqueOrThrowArgs} args - Arguments to find a Chamados_apontamentos
     * @example
     * // Get one Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends chamados_apontamentosFindUniqueOrThrowArgs>(
      args: SelectSubset<
        T,
        chamados_apontamentosFindUniqueOrThrowArgs<ExtArgs>
      >,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Chamados_apontamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosFindFirstArgs} args - Arguments to find a Chamados_apontamentos
     * @example
     * // Get one Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends chamados_apontamentosFindFirstArgs>(
      args?: SelectSubset<T, chamados_apontamentosFindFirstArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Chamados_apontamentos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosFindFirstOrThrowArgs} args - Arguments to find a Chamados_apontamentos
     * @example
     * // Get one Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends chamados_apontamentosFindFirstOrThrowArgs>(
      args?: SelectSubset<
        T,
        chamados_apontamentosFindFirstOrThrowArgs<ExtArgs>
      >,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Chamados_apontamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findMany()
     *
     * // Get first 10 Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.findMany({ take: 10 })
     *
     * // Only select the `chamado_os`
     * const chamados_apontamentosWithChamado_osOnly = await prisma.chamados_apontamentos.findMany({ select: { chamado_os: true } })
     *
     */
    findMany<T extends chamados_apontamentosFindManyArgs>(
      args?: SelectSubset<T, chamados_apontamentosFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Chamados_apontamentos.
     * @param {chamados_apontamentosCreateArgs} args - Arguments to create a Chamados_apontamentos.
     * @example
     * // Create one Chamados_apontamentos
     * const Chamados_apontamentos = await prisma.chamados_apontamentos.create({
     *   data: {
     *     // ... data to create a Chamados_apontamentos
     *   }
     * })
     *
     */
    create<T extends chamados_apontamentosCreateArgs>(
      args: SelectSubset<T, chamados_apontamentosCreateArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Chamados_apontamentos.
     * @param {chamados_apontamentosCreateManyArgs} args - Arguments to create many Chamados_apontamentos.
     * @example
     * // Create many Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends chamados_apontamentosCreateManyArgs>(
      args?: SelectSubset<T, chamados_apontamentosCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Chamados_apontamentos and returns the data saved in the database.
     * @param {chamados_apontamentosCreateManyAndReturnArgs} args - Arguments to create many Chamados_apontamentos.
     * @example
     * // Create many Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Chamados_apontamentos and only return the `chamado_os`
     * const chamados_apontamentosWithChamado_osOnly = await prisma.chamados_apontamentos.createManyAndReturn({
     *   select: { chamado_os: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends chamados_apontamentosCreateManyAndReturnArgs>(
      args?: SelectSubset<
        T,
        chamados_apontamentosCreateManyAndReturnArgs<ExtArgs>
      >,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Chamados_apontamentos.
     * @param {chamados_apontamentosDeleteArgs} args - Arguments to delete one Chamados_apontamentos.
     * @example
     * // Delete one Chamados_apontamentos
     * const Chamados_apontamentos = await prisma.chamados_apontamentos.delete({
     *   where: {
     *     // ... filter to delete one Chamados_apontamentos
     *   }
     * })
     *
     */
    delete<T extends chamados_apontamentosDeleteArgs>(
      args: SelectSubset<T, chamados_apontamentosDeleteArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Chamados_apontamentos.
     * @param {chamados_apontamentosUpdateArgs} args - Arguments to update one Chamados_apontamentos.
     * @example
     * // Update one Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends chamados_apontamentosUpdateArgs>(
      args: SelectSubset<T, chamados_apontamentosUpdateArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Chamados_apontamentos.
     * @param {chamados_apontamentosDeleteManyArgs} args - Arguments to filter Chamados_apontamentos to delete.
     * @example
     * // Delete a few Chamados_apontamentos
     * const { count } = await prisma.chamados_apontamentos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends chamados_apontamentosDeleteManyArgs>(
      args?: SelectSubset<T, chamados_apontamentosDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Chamados_apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends chamados_apontamentosUpdateManyArgs>(
      args: SelectSubset<T, chamados_apontamentosUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Chamados_apontamentos and returns the data updated in the database.
     * @param {chamados_apontamentosUpdateManyAndReturnArgs} args - Arguments to update many Chamados_apontamentos.
     * @example
     * // Update many Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Chamados_apontamentos and only return the `chamado_os`
     * const chamados_apontamentosWithChamado_osOnly = await prisma.chamados_apontamentos.updateManyAndReturn({
     *   select: { chamado_os: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends chamados_apontamentosUpdateManyAndReturnArgs>(
      args: SelectSubset<
        T,
        chamados_apontamentosUpdateManyAndReturnArgs<ExtArgs>
      >,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Chamados_apontamentos.
     * @param {chamados_apontamentosUpsertArgs} args - Arguments to update or create a Chamados_apontamentos.
     * @example
     * // Update or create a Chamados_apontamentos
     * const chamados_apontamentos = await prisma.chamados_apontamentos.upsert({
     *   create: {
     *     // ... data to create a Chamados_apontamentos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Chamados_apontamentos we want to update
     *   }
     * })
     */
    upsert<T extends chamados_apontamentosUpsertArgs>(
      args: SelectSubset<T, chamados_apontamentosUpsertArgs<ExtArgs>>,
    ): Prisma__chamados_apontamentosClient<
      $Result.GetResult<
        Prisma.$chamados_apontamentosPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Chamados_apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosCountArgs} args - Arguments to filter Chamados_apontamentos to count.
     * @example
     * // Count the number of Chamados_apontamentos
     * const count = await prisma.chamados_apontamentos.count({
     *   where: {
     *     // ... the filter for the Chamados_apontamentos we want to count
     *   }
     * })
     **/
    count<T extends chamados_apontamentosCountArgs>(
      args?: Subset<T, chamados_apontamentosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<
              T['select'],
              Chamados_apontamentosCountAggregateOutputType
            >
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Chamados_apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Chamados_apontamentosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends Chamados_apontamentosAggregateArgs>(
      args: Subset<T, Chamados_apontamentosAggregateArgs>,
    ): Prisma.PrismaPromise<GetChamados_apontamentosAggregateType<T>>;

    /**
     * Group by Chamados_apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {chamados_apontamentosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends chamados_apontamentosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: chamados_apontamentosGroupByArgs['orderBy'] }
        : { orderBy?: chamados_apontamentosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<
        T,
        chamados_apontamentosGroupByArgs,
        OrderByArg
      > &
        InputErrors,
    ): {} extends InputErrors
      ? GetChamados_apontamentosGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the chamados_apontamentos model
     */
    readonly fields: chamados_apontamentosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for chamados_apontamentos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__chamados_apontamentosClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    chamado<T extends chamados_apontamentos$chamadoArgs<ExtArgs> = {}>(
      args?: Subset<T, chamados_apontamentos$chamadoArgs<ExtArgs>>,
    ): Prisma__chamadosClient<
      $Result.GetResult<
        Prisma.$chamadosPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the chamados_apontamentos model
   */
  interface chamados_apontamentosFieldRefs {
    readonly chamado_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly cod_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly dtini_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly hrini_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly hrfim_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly dthrini_apont: FieldRef<'chamados_apontamentos', 'DateTime'>;
    readonly dthrfim_apont: FieldRef<'chamados_apontamentos', 'DateTime'>;
    readonly respcli_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly obs: FieldRef<'chamados_apontamentos', 'String'>;
    readonly codrec_os: FieldRef<'chamados_apontamentos', 'String'>;
    readonly cod_cliente: FieldRef<'chamados_apontamentos', 'String'>;
    readonly limmes_tarefa: FieldRef<'chamados_apontamentos', 'Float'>;
    readonly dat_load: FieldRef<'chamados_apontamentos', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * chamados_apontamentos findUnique
   */
  export type chamados_apontamentosFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados_apontamentos to fetch.
     */
    where: chamados_apontamentosWhereUniqueInput;
  };

  /**
   * chamados_apontamentos findUniqueOrThrow
   */
  export type chamados_apontamentosFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados_apontamentos to fetch.
     */
    where: chamados_apontamentosWhereUniqueInput;
  };

  /**
   * chamados_apontamentos findFirst
   */
  export type chamados_apontamentosFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados_apontamentos to fetch.
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados_apontamentos to fetch.
     */
    orderBy?:
      | chamados_apontamentosOrderByWithRelationInput
      | chamados_apontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for chamados_apontamentos.
     */
    cursor?: chamados_apontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados_apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados_apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of chamados_apontamentos.
     */
    distinct?:
      | Chamados_apontamentosScalarFieldEnum
      | Chamados_apontamentosScalarFieldEnum[];
  };

  /**
   * chamados_apontamentos findFirstOrThrow
   */
  export type chamados_apontamentosFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados_apontamentos to fetch.
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados_apontamentos to fetch.
     */
    orderBy?:
      | chamados_apontamentosOrderByWithRelationInput
      | chamados_apontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for chamados_apontamentos.
     */
    cursor?: chamados_apontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados_apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados_apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of chamados_apontamentos.
     */
    distinct?:
      | Chamados_apontamentosScalarFieldEnum
      | Chamados_apontamentosScalarFieldEnum[];
  };

  /**
   * chamados_apontamentos findMany
   */
  export type chamados_apontamentosFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter, which chamados_apontamentos to fetch.
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of chamados_apontamentos to fetch.
     */
    orderBy?:
      | chamados_apontamentosOrderByWithRelationInput
      | chamados_apontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing chamados_apontamentos.
     */
    cursor?: chamados_apontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` chamados_apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` chamados_apontamentos.
     */
    skip?: number;
    distinct?:
      | Chamados_apontamentosScalarFieldEnum
      | Chamados_apontamentosScalarFieldEnum[];
  };

  /**
   * chamados_apontamentos create
   */
  export type chamados_apontamentosCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * The data needed to create a chamados_apontamentos.
     */
    data: XOR<
      chamados_apontamentosCreateInput,
      chamados_apontamentosUncheckedCreateInput
    >;
  };

  /**
   * chamados_apontamentos createMany
   */
  export type chamados_apontamentosCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many chamados_apontamentos.
     */
    data:
      | chamados_apontamentosCreateManyInput
      | chamados_apontamentosCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * chamados_apontamentos createManyAndReturn
   */
  export type chamados_apontamentosCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * The data used to create many chamados_apontamentos.
     */
    data:
      | chamados_apontamentosCreateManyInput
      | chamados_apontamentosCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * chamados_apontamentos update
   */
  export type chamados_apontamentosUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * The data needed to update a chamados_apontamentos.
     */
    data: XOR<
      chamados_apontamentosUpdateInput,
      chamados_apontamentosUncheckedUpdateInput
    >;
    /**
     * Choose, which chamados_apontamentos to update.
     */
    where: chamados_apontamentosWhereUniqueInput;
  };

  /**
   * chamados_apontamentos updateMany
   */
  export type chamados_apontamentosUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update chamados_apontamentos.
     */
    data: XOR<
      chamados_apontamentosUpdateManyMutationInput,
      chamados_apontamentosUncheckedUpdateManyInput
    >;
    /**
     * Filter which chamados_apontamentos to update
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * Limit how many chamados_apontamentos to update.
     */
    limit?: number;
  };

  /**
   * chamados_apontamentos updateManyAndReturn
   */
  export type chamados_apontamentosUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * The data used to update chamados_apontamentos.
     */
    data: XOR<
      chamados_apontamentosUpdateManyMutationInput,
      chamados_apontamentosUncheckedUpdateManyInput
    >;
    /**
     * Filter which chamados_apontamentos to update
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * Limit how many chamados_apontamentos to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * chamados_apontamentos upsert
   */
  export type chamados_apontamentosUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * The filter to search for the chamados_apontamentos to update in case it exists.
     */
    where: chamados_apontamentosWhereUniqueInput;
    /**
     * In case the chamados_apontamentos found by the `where` argument doesn't exist, create a new chamados_apontamentos with this data.
     */
    create: XOR<
      chamados_apontamentosCreateInput,
      chamados_apontamentosUncheckedCreateInput
    >;
    /**
     * In case the chamados_apontamentos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<
      chamados_apontamentosUpdateInput,
      chamados_apontamentosUncheckedUpdateInput
    >;
  };

  /**
   * chamados_apontamentos delete
   */
  export type chamados_apontamentosDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
    /**
     * Filter which chamados_apontamentos to delete.
     */
    where: chamados_apontamentosWhereUniqueInput;
  };

  /**
   * chamados_apontamentos deleteMany
   */
  export type chamados_apontamentosDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which chamados_apontamentos to delete
     */
    where?: chamados_apontamentosWhereInput;
    /**
     * Limit how many chamados_apontamentos to delete.
     */
    limit?: number;
  };

  /**
   * chamados_apontamentos.chamado
   */
  export type chamados_apontamentos$chamadoArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados
     */
    select?: chamadosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados
     */
    omit?: chamadosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamadosInclude<ExtArgs> | null;
    where?: chamadosWhereInput;
  };

  /**
   * chamados_apontamentos without action
   */
  export type chamados_apontamentosDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the chamados_apontamentos
     */
    select?: chamados_apontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the chamados_apontamentos
     */
    omit?: chamados_apontamentosOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: chamados_apontamentosInclude<ExtArgs> | null;
  };

  /**
   * Model Apontamentos
   */

  export type AggregateApontamentos = {
    _count: ApontamentosCountAggregateOutputType | null;
    _avg: ApontamentosAvgAggregateOutputType | null;
    _sum: ApontamentosSumAggregateOutputType | null;
    _min: ApontamentosMinAggregateOutputType | null;
    _max: ApontamentosMaxAggregateOutputType | null;
  };

  export type ApontamentosAvgAggregateOutputType = {
    limmes_tarefa: number | null;
  };

  export type ApontamentosSumAggregateOutputType = {
    limmes_tarefa: number | null;
  };

  export type ApontamentosMinAggregateOutputType = {
    id: string | null;
    chamado_os: string | null;
    cod_os: string | null;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
    status_chamado: string | null;
    nome_cliente: string | null;
    nome_recurso: string | null;
  };

  export type ApontamentosMaxAggregateOutputType = {
    id: string | null;
    chamado_os: string | null;
    cod_os: string | null;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
    status_chamado: string | null;
    nome_cliente: string | null;
    nome_recurso: string | null;
  };

  export type ApontamentosCountAggregateOutputType = {
    id: number;
    chamado_os: number;
    cod_os: number;
    dtini_os: number;
    hrini_os: number;
    hrfim_os: number;
    dthrini_apont: number;
    dthrfim_apont: number;
    respcli_os: number;
    obs: number;
    codrec_os: number;
    cod_cliente: number;
    limmes_tarefa: number;
    dat_load: number;
    status_chamado: number;
    nome_cliente: number;
    nome_recurso: number;
    _all: number;
  };

  export type ApontamentosAvgAggregateInputType = {
    limmes_tarefa?: true;
  };

  export type ApontamentosSumAggregateInputType = {
    limmes_tarefa?: true;
  };

  export type ApontamentosMinAggregateInputType = {
    id?: true;
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
    status_chamado?: true;
    nome_cliente?: true;
    nome_recurso?: true;
  };

  export type ApontamentosMaxAggregateInputType = {
    id?: true;
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
    status_chamado?: true;
    nome_cliente?: true;
    nome_recurso?: true;
  };

  export type ApontamentosCountAggregateInputType = {
    id?: true;
    chamado_os?: true;
    cod_os?: true;
    dtini_os?: true;
    hrini_os?: true;
    hrfim_os?: true;
    dthrini_apont?: true;
    dthrfim_apont?: true;
    respcli_os?: true;
    obs?: true;
    codrec_os?: true;
    cod_cliente?: true;
    limmes_tarefa?: true;
    dat_load?: true;
    status_chamado?: true;
    nome_cliente?: true;
    nome_recurso?: true;
    _all?: true;
  };

  export type ApontamentosAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Apontamentos to aggregate.
     */
    where?: ApontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apontamentos to fetch.
     */
    orderBy?:
      | ApontamentosOrderByWithRelationInput
      | ApontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ApontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Apontamentos
     **/
    _count?: true | ApontamentosCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: ApontamentosAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: ApontamentosSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ApontamentosMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ApontamentosMaxAggregateInputType;
  };

  export type GetApontamentosAggregateType<
    T extends ApontamentosAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateApontamentos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApontamentos[P]>
      : GetScalarType<T[P], AggregateApontamentos[P]>;
  };

  export type ApontamentosGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ApontamentosWhereInput;
    orderBy?:
      | ApontamentosOrderByWithAggregationInput
      | ApontamentosOrderByWithAggregationInput[];
    by: ApontamentosScalarFieldEnum[] | ApontamentosScalarFieldEnum;
    having?: ApontamentosScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ApontamentosCountAggregateInputType | true;
    _avg?: ApontamentosAvgAggregateInputType;
    _sum?: ApontamentosSumAggregateInputType;
    _min?: ApontamentosMinAggregateInputType;
    _max?: ApontamentosMaxAggregateInputType;
  };

  export type ApontamentosGroupByOutputType = {
    id: string;
    chamado_os: string | null;
    cod_os: string | null;
    dtini_os: string | null;
    hrini_os: string | null;
    hrfim_os: string | null;
    dthrini_apont: Date | null;
    dthrfim_apont: Date | null;
    respcli_os: string | null;
    obs: string | null;
    codrec_os: string | null;
    cod_cliente: string | null;
    limmes_tarefa: number | null;
    dat_load: Date | null;
    status_chamado: string | null;
    nome_cliente: string | null;
    nome_recurso: string | null;
    _count: ApontamentosCountAggregateOutputType | null;
    _avg: ApontamentosAvgAggregateOutputType | null;
    _sum: ApontamentosSumAggregateOutputType | null;
    _min: ApontamentosMinAggregateOutputType | null;
    _max: ApontamentosMaxAggregateOutputType | null;
  };

  type GetApontamentosGroupByPayload<T extends ApontamentosGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<ApontamentosGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof ApontamentosGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApontamentosGroupByOutputType[P]>
            : GetScalarType<T[P], ApontamentosGroupByOutputType[P]>;
        }
      >
    >;

  export type ApontamentosSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      status_chamado?: boolean;
      nome_cliente?: boolean;
      nome_recurso?: boolean;
    },
    ExtArgs['result']['apontamentos']
  >;

  export type ApontamentosSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      status_chamado?: boolean;
      nome_cliente?: boolean;
      nome_recurso?: boolean;
    },
    ExtArgs['result']['apontamentos']
  >;

  export type ApontamentosSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      chamado_os?: boolean;
      cod_os?: boolean;
      dtini_os?: boolean;
      hrini_os?: boolean;
      hrfim_os?: boolean;
      dthrini_apont?: boolean;
      dthrfim_apont?: boolean;
      respcli_os?: boolean;
      obs?: boolean;
      codrec_os?: boolean;
      cod_cliente?: boolean;
      limmes_tarefa?: boolean;
      dat_load?: boolean;
      status_chamado?: boolean;
      nome_cliente?: boolean;
      nome_recurso?: boolean;
    },
    ExtArgs['result']['apontamentos']
  >;

  export type ApontamentosSelectScalar = {
    id?: boolean;
    chamado_os?: boolean;
    cod_os?: boolean;
    dtini_os?: boolean;
    hrini_os?: boolean;
    hrfim_os?: boolean;
    dthrini_apont?: boolean;
    dthrfim_apont?: boolean;
    respcli_os?: boolean;
    obs?: boolean;
    codrec_os?: boolean;
    cod_cliente?: boolean;
    limmes_tarefa?: boolean;
    dat_load?: boolean;
    status_chamado?: boolean;
    nome_cliente?: boolean;
    nome_recurso?: boolean;
  };

  export type ApontamentosOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'chamado_os'
    | 'cod_os'
    | 'dtini_os'
    | 'hrini_os'
    | 'hrfim_os'
    | 'dthrini_apont'
    | 'dthrfim_apont'
    | 'respcli_os'
    | 'obs'
    | 'codrec_os'
    | 'cod_cliente'
    | 'limmes_tarefa'
    | 'dat_load'
    | 'status_chamado'
    | 'nome_cliente'
    | 'nome_recurso',
    ExtArgs['result']['apontamentos']
  >;

  export type $ApontamentosPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Apontamentos';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        chamado_os: string | null;
        cod_os: string | null;
        dtini_os: string | null;
        hrini_os: string | null;
        hrfim_os: string | null;
        dthrini_apont: Date | null;
        dthrfim_apont: Date | null;
        respcli_os: string | null;
        obs: string | null;
        codrec_os: string | null;
        cod_cliente: string | null;
        limmes_tarefa: number | null;
        dat_load: Date | null;
        status_chamado: string | null;
        nome_cliente: string | null;
        nome_recurso: string | null;
      },
      ExtArgs['result']['apontamentos']
    >;
    composites: {};
  };

  type ApontamentosGetPayload<
    S extends boolean | null | undefined | ApontamentosDefaultArgs,
  > = $Result.GetResult<Prisma.$ApontamentosPayload, S>;

  type ApontamentosCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    ApontamentosFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: ApontamentosCountAggregateInputType | true;
  };

  export interface ApontamentosDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Apontamentos'];
      meta: { name: 'Apontamentos' };
    };
    /**
     * Find zero or one Apontamentos that matches the filter.
     * @param {ApontamentosFindUniqueArgs} args - Arguments to find a Apontamentos
     * @example
     * // Get one Apontamentos
     * const apontamentos = await prisma.apontamentos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApontamentosFindUniqueArgs>(
      args: SelectSubset<T, ApontamentosFindUniqueArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Apontamentos that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApontamentosFindUniqueOrThrowArgs} args - Arguments to find a Apontamentos
     * @example
     * // Get one Apontamentos
     * const apontamentos = await prisma.apontamentos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApontamentosFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ApontamentosFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Apontamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosFindFirstArgs} args - Arguments to find a Apontamentos
     * @example
     * // Get one Apontamentos
     * const apontamentos = await prisma.apontamentos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApontamentosFindFirstArgs>(
      args?: SelectSubset<T, ApontamentosFindFirstArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Apontamentos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosFindFirstOrThrowArgs} args - Arguments to find a Apontamentos
     * @example
     * // Get one Apontamentos
     * const apontamentos = await prisma.apontamentos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApontamentosFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ApontamentosFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Apontamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Apontamentos
     * const apontamentos = await prisma.apontamentos.findMany()
     *
     * // Get first 10 Apontamentos
     * const apontamentos = await prisma.apontamentos.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const apontamentosWithIdOnly = await prisma.apontamentos.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ApontamentosFindManyArgs>(
      args?: SelectSubset<T, ApontamentosFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Apontamentos.
     * @param {ApontamentosCreateArgs} args - Arguments to create a Apontamentos.
     * @example
     * // Create one Apontamentos
     * const Apontamentos = await prisma.apontamentos.create({
     *   data: {
     *     // ... data to create a Apontamentos
     *   }
     * })
     *
     */
    create<T extends ApontamentosCreateArgs>(
      args: SelectSubset<T, ApontamentosCreateArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Apontamentos.
     * @param {ApontamentosCreateManyArgs} args - Arguments to create many Apontamentos.
     * @example
     * // Create many Apontamentos
     * const apontamentos = await prisma.apontamentos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ApontamentosCreateManyArgs>(
      args?: SelectSubset<T, ApontamentosCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Apontamentos and returns the data saved in the database.
     * @param {ApontamentosCreateManyAndReturnArgs} args - Arguments to create many Apontamentos.
     * @example
     * // Create many Apontamentos
     * const apontamentos = await prisma.apontamentos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Apontamentos and only return the `id`
     * const apontamentosWithIdOnly = await prisma.apontamentos.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ApontamentosCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ApontamentosCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Apontamentos.
     * @param {ApontamentosDeleteArgs} args - Arguments to delete one Apontamentos.
     * @example
     * // Delete one Apontamentos
     * const Apontamentos = await prisma.apontamentos.delete({
     *   where: {
     *     // ... filter to delete one Apontamentos
     *   }
     * })
     *
     */
    delete<T extends ApontamentosDeleteArgs>(
      args: SelectSubset<T, ApontamentosDeleteArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Apontamentos.
     * @param {ApontamentosUpdateArgs} args - Arguments to update one Apontamentos.
     * @example
     * // Update one Apontamentos
     * const apontamentos = await prisma.apontamentos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ApontamentosUpdateArgs>(
      args: SelectSubset<T, ApontamentosUpdateArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Apontamentos.
     * @param {ApontamentosDeleteManyArgs} args - Arguments to filter Apontamentos to delete.
     * @example
     * // Delete a few Apontamentos
     * const { count } = await prisma.apontamentos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ApontamentosDeleteManyArgs>(
      args?: SelectSubset<T, ApontamentosDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Apontamentos
     * const apontamentos = await prisma.apontamentos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ApontamentosUpdateManyArgs>(
      args: SelectSubset<T, ApontamentosUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Apontamentos and returns the data updated in the database.
     * @param {ApontamentosUpdateManyAndReturnArgs} args - Arguments to update many Apontamentos.
     * @example
     * // Update many Apontamentos
     * const apontamentos = await prisma.apontamentos.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Apontamentos and only return the `id`
     * const apontamentosWithIdOnly = await prisma.apontamentos.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ApontamentosUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ApontamentosUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Apontamentos.
     * @param {ApontamentosUpsertArgs} args - Arguments to update or create a Apontamentos.
     * @example
     * // Update or create a Apontamentos
     * const apontamentos = await prisma.apontamentos.upsert({
     *   create: {
     *     // ... data to create a Apontamentos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Apontamentos we want to update
     *   }
     * })
     */
    upsert<T extends ApontamentosUpsertArgs>(
      args: SelectSubset<T, ApontamentosUpsertArgs<ExtArgs>>,
    ): Prisma__ApontamentosClient<
      $Result.GetResult<
        Prisma.$ApontamentosPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosCountArgs} args - Arguments to filter Apontamentos to count.
     * @example
     * // Count the number of Apontamentos
     * const count = await prisma.apontamentos.count({
     *   where: {
     *     // ... the filter for the Apontamentos we want to count
     *   }
     * })
     **/
    count<T extends ApontamentosCountArgs>(
      args?: Subset<T, ApontamentosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApontamentosCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ApontamentosAggregateArgs>(
      args: Subset<T, ApontamentosAggregateArgs>,
    ): Prisma.PrismaPromise<GetApontamentosAggregateType<T>>;

    /**
     * Group by Apontamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApontamentosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ApontamentosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApontamentosGroupByArgs['orderBy'] }
        : { orderBy?: ApontamentosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ApontamentosGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetApontamentosGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Apontamentos model
     */
    readonly fields: ApontamentosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Apontamentos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApontamentosClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | PromiseLike<TResult>)
        | undefined
        | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Apontamentos model
   */
  interface ApontamentosFieldRefs {
    readonly id: FieldRef<'Apontamentos', 'String'>;
    readonly chamado_os: FieldRef<'Apontamentos', 'String'>;
    readonly cod_os: FieldRef<'Apontamentos', 'String'>;
    readonly dtini_os: FieldRef<'Apontamentos', 'String'>;
    readonly hrini_os: FieldRef<'Apontamentos', 'String'>;
    readonly hrfim_os: FieldRef<'Apontamentos', 'String'>;
    readonly dthrini_apont: FieldRef<'Apontamentos', 'DateTime'>;
    readonly dthrfim_apont: FieldRef<'Apontamentos', 'DateTime'>;
    readonly respcli_os: FieldRef<'Apontamentos', 'String'>;
    readonly obs: FieldRef<'Apontamentos', 'String'>;
    readonly codrec_os: FieldRef<'Apontamentos', 'String'>;
    readonly cod_cliente: FieldRef<'Apontamentos', 'String'>;
    readonly limmes_tarefa: FieldRef<'Apontamentos', 'Float'>;
    readonly dat_load: FieldRef<'Apontamentos', 'DateTime'>;
    readonly status_chamado: FieldRef<'Apontamentos', 'String'>;
    readonly nome_cliente: FieldRef<'Apontamentos', 'String'>;
    readonly nome_recurso: FieldRef<'Apontamentos', 'String'>;
  }

  // Custom InputTypes
  /**
   * Apontamentos findUnique
   */
  export type ApontamentosFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter, which Apontamentos to fetch.
     */
    where: ApontamentosWhereUniqueInput;
  };

  /**
   * Apontamentos findUniqueOrThrow
   */
  export type ApontamentosFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter, which Apontamentos to fetch.
     */
    where: ApontamentosWhereUniqueInput;
  };

  /**
   * Apontamentos findFirst
   */
  export type ApontamentosFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter, which Apontamentos to fetch.
     */
    where?: ApontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apontamentos to fetch.
     */
    orderBy?:
      | ApontamentosOrderByWithRelationInput
      | ApontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Apontamentos.
     */
    cursor?: ApontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Apontamentos.
     */
    distinct?: ApontamentosScalarFieldEnum | ApontamentosScalarFieldEnum[];
  };

  /**
   * Apontamentos findFirstOrThrow
   */
  export type ApontamentosFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter, which Apontamentos to fetch.
     */
    where?: ApontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apontamentos to fetch.
     */
    orderBy?:
      | ApontamentosOrderByWithRelationInput
      | ApontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Apontamentos.
     */
    cursor?: ApontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apontamentos.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Apontamentos.
     */
    distinct?: ApontamentosScalarFieldEnum | ApontamentosScalarFieldEnum[];
  };

  /**
   * Apontamentos findMany
   */
  export type ApontamentosFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter, which Apontamentos to fetch.
     */
    where?: ApontamentosWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Apontamentos to fetch.
     */
    orderBy?:
      | ApontamentosOrderByWithRelationInput
      | ApontamentosOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Apontamentos.
     */
    cursor?: ApontamentosWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Apontamentos from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Apontamentos.
     */
    skip?: number;
    distinct?: ApontamentosScalarFieldEnum | ApontamentosScalarFieldEnum[];
  };

  /**
   * Apontamentos create
   */
  export type ApontamentosCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * The data needed to create a Apontamentos.
     */
    data: XOR<ApontamentosCreateInput, ApontamentosUncheckedCreateInput>;
  };

  /**
   * Apontamentos createMany
   */
  export type ApontamentosCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Apontamentos.
     */
    data: ApontamentosCreateManyInput | ApontamentosCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Apontamentos createManyAndReturn
   */
  export type ApontamentosCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * The data used to create many Apontamentos.
     */
    data: ApontamentosCreateManyInput | ApontamentosCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Apontamentos update
   */
  export type ApontamentosUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * The data needed to update a Apontamentos.
     */
    data: XOR<ApontamentosUpdateInput, ApontamentosUncheckedUpdateInput>;
    /**
     * Choose, which Apontamentos to update.
     */
    where: ApontamentosWhereUniqueInput;
  };

  /**
   * Apontamentos updateMany
   */
  export type ApontamentosUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Apontamentos.
     */
    data: XOR<
      ApontamentosUpdateManyMutationInput,
      ApontamentosUncheckedUpdateManyInput
    >;
    /**
     * Filter which Apontamentos to update
     */
    where?: ApontamentosWhereInput;
    /**
     * Limit how many Apontamentos to update.
     */
    limit?: number;
  };

  /**
   * Apontamentos updateManyAndReturn
   */
  export type ApontamentosUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * The data used to update Apontamentos.
     */
    data: XOR<
      ApontamentosUpdateManyMutationInput,
      ApontamentosUncheckedUpdateManyInput
    >;
    /**
     * Filter which Apontamentos to update
     */
    where?: ApontamentosWhereInput;
    /**
     * Limit how many Apontamentos to update.
     */
    limit?: number;
  };

  /**
   * Apontamentos upsert
   */
  export type ApontamentosUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * The filter to search for the Apontamentos to update in case it exists.
     */
    where: ApontamentosWhereUniqueInput;
    /**
     * In case the Apontamentos found by the `where` argument doesn't exist, create a new Apontamentos with this data.
     */
    create: XOR<ApontamentosCreateInput, ApontamentosUncheckedCreateInput>;
    /**
     * In case the Apontamentos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApontamentosUpdateInput, ApontamentosUncheckedUpdateInput>;
  };

  /**
   * Apontamentos delete
   */
  export type ApontamentosDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
    /**
     * Filter which Apontamentos to delete.
     */
    where: ApontamentosWhereUniqueInput;
  };

  /**
   * Apontamentos deleteMany
   */
  export type ApontamentosDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Apontamentos to delete
     */
    where?: ApontamentosWhereInput;
    /**
     * Limit how many Apontamentos to delete.
     */
    limit?: number;
  };

  /**
   * Apontamentos without action
   */
  export type ApontamentosDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Apontamentos
     */
    select?: ApontamentosSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Apontamentos
     */
    omit?: ApontamentosOmit<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const ChamadosScalarFieldEnum: {
    cod_chamado: 'cod_chamado';
    data_chamado: 'data_chamado';
    hora_chamado: 'hora_chamado';
    data_hora_chamado: 'data_hora_chamado';
    conclusao_chamado: 'conclusao_chamado';
    status_chamado: 'status_chamado';
    dtenvio_chamado: 'dtenvio_chamado';
    cod_recurso: 'cod_recurso';
    nome_recurso: 'nome_recurso';
    cod_cliente: 'cod_cliente';
    nome_cliente: 'nome_cliente';
    razao_cliente: 'razao_cliente';
    assunto_chamado: 'assunto_chamado';
    email_chamado: 'email_chamado';
    prior_chamado: 'prior_chamado';
    cod_classificacao: 'cod_classificacao';
    qtd_limmes_tarefa: 'qtd_limmes_tarefa';
    dat_load: 'dat_load';
  };

  export type ChamadosScalarFieldEnum =
    (typeof ChamadosScalarFieldEnum)[keyof typeof ChamadosScalarFieldEnum];

  export const Chamados_apontamentosScalarFieldEnum: {
    chamado_os: 'chamado_os';
    cod_os: 'cod_os';
    dtini_os: 'dtini_os';
    hrini_os: 'hrini_os';
    hrfim_os: 'hrfim_os';
    dthrini_apont: 'dthrini_apont';
    dthrfim_apont: 'dthrfim_apont';
    respcli_os: 'respcli_os';
    obs: 'obs';
    codrec_os: 'codrec_os';
    cod_cliente: 'cod_cliente';
    limmes_tarefa: 'limmes_tarefa';
    dat_load: 'dat_load';
  };

  export type Chamados_apontamentosScalarFieldEnum =
    (typeof Chamados_apontamentosScalarFieldEnum)[keyof typeof Chamados_apontamentosScalarFieldEnum];

  export const ApontamentosScalarFieldEnum: {
    id: 'id';
    chamado_os: 'chamado_os';
    cod_os: 'cod_os';
    dtini_os: 'dtini_os';
    hrini_os: 'hrini_os';
    hrfim_os: 'hrfim_os';
    dthrini_apont: 'dthrini_apont';
    dthrfim_apont: 'dthrfim_apont';
    respcli_os: 'respcli_os';
    obs: 'obs';
    codrec_os: 'codrec_os';
    cod_cliente: 'cod_cliente';
    limmes_tarefa: 'limmes_tarefa';
    dat_load: 'dat_load';
    status_chamado: 'status_chamado';
    nome_cliente: 'nome_cliente';
    nome_recurso: 'nome_recurso';
  };

  export type ApontamentosScalarFieldEnum =
    (typeof ApontamentosScalarFieldEnum)[keyof typeof ApontamentosScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String'
  >;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String[]'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime'
  >;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float'
  >;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float[]'
  >;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int'
  >;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int[]'
  >;

  /**
   * Deep Input Types
   */

  export type chamadosWhereInput = {
    AND?: chamadosWhereInput | chamadosWhereInput[];
    OR?: chamadosWhereInput[];
    NOT?: chamadosWhereInput | chamadosWhereInput[];
    cod_chamado?: StringFilter<'chamados'> | string;
    data_chamado?: StringNullableFilter<'chamados'> | string | null;
    hora_chamado?: StringNullableFilter<'chamados'> | string | null;
    data_hora_chamado?:
      | DateTimeNullableFilter<'chamados'>
      | Date
      | string
      | null;
    conclusao_chamado?: StringNullableFilter<'chamados'> | string | null;
    status_chamado?: StringNullableFilter<'chamados'> | string | null;
    dtenvio_chamado?: DateTimeNullableFilter<'chamados'> | Date | string | null;
    cod_recurso?: StringNullableFilter<'chamados'> | string | null;
    nome_recurso?: StringNullableFilter<'chamados'> | string | null;
    cod_cliente?: StringNullableFilter<'chamados'> | string | null;
    nome_cliente?: StringNullableFilter<'chamados'> | string | null;
    razao_cliente?: StringNullableFilter<'chamados'> | string | null;
    assunto_chamado?: StringNullableFilter<'chamados'> | string | null;
    email_chamado?: StringNullableFilter<'chamados'> | string | null;
    prior_chamado?: StringNullableFilter<'chamados'> | string | null;
    cod_classificacao?: StringNullableFilter<'chamados'> | string | null;
    qtd_limmes_tarefa?: FloatNullableFilter<'chamados'> | number | null;
    dat_load?: DateTimeNullableFilter<'chamados'> | Date | string | null;
    apontamentos?: Chamados_apontamentosListRelationFilter;
  };

  export type chamadosOrderByWithRelationInput = {
    cod_chamado?: SortOrder;
    data_chamado?: SortOrderInput | SortOrder;
    hora_chamado?: SortOrderInput | SortOrder;
    data_hora_chamado?: SortOrderInput | SortOrder;
    conclusao_chamado?: SortOrderInput | SortOrder;
    status_chamado?: SortOrderInput | SortOrder;
    dtenvio_chamado?: SortOrderInput | SortOrder;
    cod_recurso?: SortOrderInput | SortOrder;
    nome_recurso?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    nome_cliente?: SortOrderInput | SortOrder;
    razao_cliente?: SortOrderInput | SortOrder;
    assunto_chamado?: SortOrderInput | SortOrder;
    email_chamado?: SortOrderInput | SortOrder;
    prior_chamado?: SortOrderInput | SortOrder;
    cod_classificacao?: SortOrderInput | SortOrder;
    qtd_limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    apontamentos?: chamados_apontamentosOrderByRelationAggregateInput;
  };

  export type chamadosWhereUniqueInput = Prisma.AtLeast<
    {
      cod_chamado?: string;
      AND?: chamadosWhereInput | chamadosWhereInput[];
      OR?: chamadosWhereInput[];
      NOT?: chamadosWhereInput | chamadosWhereInput[];
      data_chamado?: StringNullableFilter<'chamados'> | string | null;
      hora_chamado?: StringNullableFilter<'chamados'> | string | null;
      data_hora_chamado?:
        | DateTimeNullableFilter<'chamados'>
        | Date
        | string
        | null;
      conclusao_chamado?: StringNullableFilter<'chamados'> | string | null;
      status_chamado?: StringNullableFilter<'chamados'> | string | null;
      dtenvio_chamado?:
        | DateTimeNullableFilter<'chamados'>
        | Date
        | string
        | null;
      cod_recurso?: StringNullableFilter<'chamados'> | string | null;
      nome_recurso?: StringNullableFilter<'chamados'> | string | null;
      cod_cliente?: StringNullableFilter<'chamados'> | string | null;
      nome_cliente?: StringNullableFilter<'chamados'> | string | null;
      razao_cliente?: StringNullableFilter<'chamados'> | string | null;
      assunto_chamado?: StringNullableFilter<'chamados'> | string | null;
      email_chamado?: StringNullableFilter<'chamados'> | string | null;
      prior_chamado?: StringNullableFilter<'chamados'> | string | null;
      cod_classificacao?: StringNullableFilter<'chamados'> | string | null;
      qtd_limmes_tarefa?: FloatNullableFilter<'chamados'> | number | null;
      dat_load?: DateTimeNullableFilter<'chamados'> | Date | string | null;
      apontamentos?: Chamados_apontamentosListRelationFilter;
    },
    'cod_chamado'
  >;

  export type chamadosOrderByWithAggregationInput = {
    cod_chamado?: SortOrder;
    data_chamado?: SortOrderInput | SortOrder;
    hora_chamado?: SortOrderInput | SortOrder;
    data_hora_chamado?: SortOrderInput | SortOrder;
    conclusao_chamado?: SortOrderInput | SortOrder;
    status_chamado?: SortOrderInput | SortOrder;
    dtenvio_chamado?: SortOrderInput | SortOrder;
    cod_recurso?: SortOrderInput | SortOrder;
    nome_recurso?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    nome_cliente?: SortOrderInput | SortOrder;
    razao_cliente?: SortOrderInput | SortOrder;
    assunto_chamado?: SortOrderInput | SortOrder;
    email_chamado?: SortOrderInput | SortOrder;
    prior_chamado?: SortOrderInput | SortOrder;
    cod_classificacao?: SortOrderInput | SortOrder;
    qtd_limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    _count?: chamadosCountOrderByAggregateInput;
    _avg?: chamadosAvgOrderByAggregateInput;
    _max?: chamadosMaxOrderByAggregateInput;
    _min?: chamadosMinOrderByAggregateInput;
    _sum?: chamadosSumOrderByAggregateInput;
  };

  export type chamadosScalarWhereWithAggregatesInput = {
    AND?:
      | chamadosScalarWhereWithAggregatesInput
      | chamadosScalarWhereWithAggregatesInput[];
    OR?: chamadosScalarWhereWithAggregatesInput[];
    NOT?:
      | chamadosScalarWhereWithAggregatesInput
      | chamadosScalarWhereWithAggregatesInput[];
    cod_chamado?: StringWithAggregatesFilter<'chamados'> | string;
    data_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    hora_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    data_hora_chamado?:
      | DateTimeNullableWithAggregatesFilter<'chamados'>
      | Date
      | string
      | null;
    conclusao_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    status_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    dtenvio_chamado?:
      | DateTimeNullableWithAggregatesFilter<'chamados'>
      | Date
      | string
      | null;
    cod_recurso?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    nome_recurso?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    cod_cliente?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    nome_cliente?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    razao_cliente?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    assunto_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    email_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    prior_chamado?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    cod_classificacao?:
      | StringNullableWithAggregatesFilter<'chamados'>
      | string
      | null;
    qtd_limmes_tarefa?:
      | FloatNullableWithAggregatesFilter<'chamados'>
      | number
      | null;
    dat_load?:
      | DateTimeNullableWithAggregatesFilter<'chamados'>
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosWhereInput = {
    AND?: chamados_apontamentosWhereInput | chamados_apontamentosWhereInput[];
    OR?: chamados_apontamentosWhereInput[];
    NOT?: chamados_apontamentosWhereInput | chamados_apontamentosWhereInput[];
    chamado_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    cod_os?: StringFilter<'chamados_apontamentos'> | string;
    dtini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    hrini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    hrfim_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    dthrini_apont?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    dthrfim_apont?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    respcli_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    obs?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    codrec_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    cod_cliente?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    limmes_tarefa?:
      | FloatNullableFilter<'chamados_apontamentos'>
      | number
      | null;
    dat_load?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    chamado?: XOR<
      ChamadosNullableScalarRelationFilter,
      chamadosWhereInput
    > | null;
  };

  export type chamados_apontamentosOrderByWithRelationInput = {
    chamado_os?: SortOrderInput | SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrderInput | SortOrder;
    hrini_os?: SortOrderInput | SortOrder;
    hrfim_os?: SortOrderInput | SortOrder;
    dthrini_apont?: SortOrderInput | SortOrder;
    dthrfim_apont?: SortOrderInput | SortOrder;
    respcli_os?: SortOrderInput | SortOrder;
    obs?: SortOrderInput | SortOrder;
    codrec_os?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    chamado?: chamadosOrderByWithRelationInput;
  };

  export type chamados_apontamentosWhereUniqueInput = Prisma.AtLeast<
    {
      cod_os?: string;
      AND?: chamados_apontamentosWhereInput | chamados_apontamentosWhereInput[];
      OR?: chamados_apontamentosWhereInput[];
      NOT?: chamados_apontamentosWhereInput | chamados_apontamentosWhereInput[];
      chamado_os?:
        | StringNullableFilter<'chamados_apontamentos'>
        | string
        | null;
      dtini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
      hrini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
      hrfim_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
      dthrini_apont?:
        | DateTimeNullableFilter<'chamados_apontamentos'>
        | Date
        | string
        | null;
      dthrfim_apont?:
        | DateTimeNullableFilter<'chamados_apontamentos'>
        | Date
        | string
        | null;
      respcli_os?:
        | StringNullableFilter<'chamados_apontamentos'>
        | string
        | null;
      obs?: StringNullableFilter<'chamados_apontamentos'> | string | null;
      codrec_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
      cod_cliente?:
        | StringNullableFilter<'chamados_apontamentos'>
        | string
        | null;
      limmes_tarefa?:
        | FloatNullableFilter<'chamados_apontamentos'>
        | number
        | null;
      dat_load?:
        | DateTimeNullableFilter<'chamados_apontamentos'>
        | Date
        | string
        | null;
      chamado?: XOR<
        ChamadosNullableScalarRelationFilter,
        chamadosWhereInput
      > | null;
    },
    'cod_os'
  >;

  export type chamados_apontamentosOrderByWithAggregationInput = {
    chamado_os?: SortOrderInput | SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrderInput | SortOrder;
    hrini_os?: SortOrderInput | SortOrder;
    hrfim_os?: SortOrderInput | SortOrder;
    dthrini_apont?: SortOrderInput | SortOrder;
    dthrfim_apont?: SortOrderInput | SortOrder;
    respcli_os?: SortOrderInput | SortOrder;
    obs?: SortOrderInput | SortOrder;
    codrec_os?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    _count?: chamados_apontamentosCountOrderByAggregateInput;
    _avg?: chamados_apontamentosAvgOrderByAggregateInput;
    _max?: chamados_apontamentosMaxOrderByAggregateInput;
    _min?: chamados_apontamentosMinOrderByAggregateInput;
    _sum?: chamados_apontamentosSumOrderByAggregateInput;
  };

  export type chamados_apontamentosScalarWhereWithAggregatesInput = {
    AND?:
      | chamados_apontamentosScalarWhereWithAggregatesInput
      | chamados_apontamentosScalarWhereWithAggregatesInput[];
    OR?: chamados_apontamentosScalarWhereWithAggregatesInput[];
    NOT?:
      | chamados_apontamentosScalarWhereWithAggregatesInput
      | chamados_apontamentosScalarWhereWithAggregatesInput[];
    chamado_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    cod_os?: StringWithAggregatesFilter<'chamados_apontamentos'> | string;
    dtini_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    hrini_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    hrfim_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    dthrini_apont?:
      | DateTimeNullableWithAggregatesFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    dthrfim_apont?:
      | DateTimeNullableWithAggregatesFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    respcli_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    obs?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    codrec_os?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    cod_cliente?:
      | StringNullableWithAggregatesFilter<'chamados_apontamentos'>
      | string
      | null;
    limmes_tarefa?:
      | FloatNullableWithAggregatesFilter<'chamados_apontamentos'>
      | number
      | null;
    dat_load?:
      | DateTimeNullableWithAggregatesFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
  };

  export type ApontamentosWhereInput = {
    AND?: ApontamentosWhereInput | ApontamentosWhereInput[];
    OR?: ApontamentosWhereInput[];
    NOT?: ApontamentosWhereInput | ApontamentosWhereInput[];
    id?: UuidFilter<'Apontamentos'> | string;
    chamado_os?: StringNullableFilter<'Apontamentos'> | string | null;
    cod_os?: StringNullableFilter<'Apontamentos'> | string | null;
    dtini_os?: StringNullableFilter<'Apontamentos'> | string | null;
    hrini_os?: StringNullableFilter<'Apontamentos'> | string | null;
    hrfim_os?: StringNullableFilter<'Apontamentos'> | string | null;
    dthrini_apont?:
      | DateTimeNullableFilter<'Apontamentos'>
      | Date
      | string
      | null;
    dthrfim_apont?:
      | DateTimeNullableFilter<'Apontamentos'>
      | Date
      | string
      | null;
    respcli_os?: StringNullableFilter<'Apontamentos'> | string | null;
    obs?: StringNullableFilter<'Apontamentos'> | string | null;
    codrec_os?: StringNullableFilter<'Apontamentos'> | string | null;
    cod_cliente?: StringNullableFilter<'Apontamentos'> | string | null;
    limmes_tarefa?: FloatNullableFilter<'Apontamentos'> | number | null;
    dat_load?: DateTimeNullableFilter<'Apontamentos'> | Date | string | null;
    status_chamado?: StringNullableFilter<'Apontamentos'> | string | null;
    nome_cliente?: StringNullableFilter<'Apontamentos'> | string | null;
    nome_recurso?: StringNullableFilter<'Apontamentos'> | string | null;
  };

  export type ApontamentosOrderByWithRelationInput = {
    id?: SortOrder;
    chamado_os?: SortOrderInput | SortOrder;
    cod_os?: SortOrderInput | SortOrder;
    dtini_os?: SortOrderInput | SortOrder;
    hrini_os?: SortOrderInput | SortOrder;
    hrfim_os?: SortOrderInput | SortOrder;
    dthrini_apont?: SortOrderInput | SortOrder;
    dthrfim_apont?: SortOrderInput | SortOrder;
    respcli_os?: SortOrderInput | SortOrder;
    obs?: SortOrderInput | SortOrder;
    codrec_os?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    status_chamado?: SortOrderInput | SortOrder;
    nome_cliente?: SortOrderInput | SortOrder;
    nome_recurso?: SortOrderInput | SortOrder;
  };

  export type ApontamentosWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: ApontamentosWhereInput | ApontamentosWhereInput[];
      OR?: ApontamentosWhereInput[];
      NOT?: ApontamentosWhereInput | ApontamentosWhereInput[];
      chamado_os?: StringNullableFilter<'Apontamentos'> | string | null;
      cod_os?: StringNullableFilter<'Apontamentos'> | string | null;
      dtini_os?: StringNullableFilter<'Apontamentos'> | string | null;
      hrini_os?: StringNullableFilter<'Apontamentos'> | string | null;
      hrfim_os?: StringNullableFilter<'Apontamentos'> | string | null;
      dthrini_apont?:
        | DateTimeNullableFilter<'Apontamentos'>
        | Date
        | string
        | null;
      dthrfim_apont?:
        | DateTimeNullableFilter<'Apontamentos'>
        | Date
        | string
        | null;
      respcli_os?: StringNullableFilter<'Apontamentos'> | string | null;
      obs?: StringNullableFilter<'Apontamentos'> | string | null;
      codrec_os?: StringNullableFilter<'Apontamentos'> | string | null;
      cod_cliente?: StringNullableFilter<'Apontamentos'> | string | null;
      limmes_tarefa?: FloatNullableFilter<'Apontamentos'> | number | null;
      dat_load?: DateTimeNullableFilter<'Apontamentos'> | Date | string | null;
      status_chamado?: StringNullableFilter<'Apontamentos'> | string | null;
      nome_cliente?: StringNullableFilter<'Apontamentos'> | string | null;
      nome_recurso?: StringNullableFilter<'Apontamentos'> | string | null;
    },
    'id'
  >;

  export type ApontamentosOrderByWithAggregationInput = {
    id?: SortOrder;
    chamado_os?: SortOrderInput | SortOrder;
    cod_os?: SortOrderInput | SortOrder;
    dtini_os?: SortOrderInput | SortOrder;
    hrini_os?: SortOrderInput | SortOrder;
    hrfim_os?: SortOrderInput | SortOrder;
    dthrini_apont?: SortOrderInput | SortOrder;
    dthrfim_apont?: SortOrderInput | SortOrder;
    respcli_os?: SortOrderInput | SortOrder;
    obs?: SortOrderInput | SortOrder;
    codrec_os?: SortOrderInput | SortOrder;
    cod_cliente?: SortOrderInput | SortOrder;
    limmes_tarefa?: SortOrderInput | SortOrder;
    dat_load?: SortOrderInput | SortOrder;
    status_chamado?: SortOrderInput | SortOrder;
    nome_cliente?: SortOrderInput | SortOrder;
    nome_recurso?: SortOrderInput | SortOrder;
    _count?: ApontamentosCountOrderByAggregateInput;
    _avg?: ApontamentosAvgOrderByAggregateInput;
    _max?: ApontamentosMaxOrderByAggregateInput;
    _min?: ApontamentosMinOrderByAggregateInput;
    _sum?: ApontamentosSumOrderByAggregateInput;
  };

  export type ApontamentosScalarWhereWithAggregatesInput = {
    AND?:
      | ApontamentosScalarWhereWithAggregatesInput
      | ApontamentosScalarWhereWithAggregatesInput[];
    OR?: ApontamentosScalarWhereWithAggregatesInput[];
    NOT?:
      | ApontamentosScalarWhereWithAggregatesInput
      | ApontamentosScalarWhereWithAggregatesInput[];
    id?: UuidWithAggregatesFilter<'Apontamentos'> | string;
    chamado_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    cod_os?: StringNullableWithAggregatesFilter<'Apontamentos'> | string | null;
    dtini_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    hrini_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    hrfim_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    dthrini_apont?:
      | DateTimeNullableWithAggregatesFilter<'Apontamentos'>
      | Date
      | string
      | null;
    dthrfim_apont?:
      | DateTimeNullableWithAggregatesFilter<'Apontamentos'>
      | Date
      | string
      | null;
    respcli_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    obs?: StringNullableWithAggregatesFilter<'Apontamentos'> | string | null;
    codrec_os?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    cod_cliente?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    limmes_tarefa?:
      | FloatNullableWithAggregatesFilter<'Apontamentos'>
      | number
      | null;
    dat_load?:
      | DateTimeNullableWithAggregatesFilter<'Apontamentos'>
      | Date
      | string
      | null;
    status_chamado?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    nome_cliente?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
    nome_recurso?:
      | StringNullableWithAggregatesFilter<'Apontamentos'>
      | string
      | null;
  };

  export type chamadosCreateInput = {
    cod_chamado: string;
    data_chamado?: string | null;
    hora_chamado?: string | null;
    data_hora_chamado?: Date | string | null;
    conclusao_chamado?: string | null;
    status_chamado?: string | null;
    dtenvio_chamado?: Date | string | null;
    cod_recurso?: string | null;
    nome_recurso?: string | null;
    cod_cliente?: string | null;
    nome_cliente?: string | null;
    razao_cliente?: string | null;
    assunto_chamado?: string | null;
    email_chamado?: string | null;
    prior_chamado?: string | null;
    cod_classificacao?: string | null;
    qtd_limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    apontamentos?: chamados_apontamentosCreateNestedManyWithoutChamadoInput;
  };

  export type chamadosUncheckedCreateInput = {
    cod_chamado: string;
    data_chamado?: string | null;
    hora_chamado?: string | null;
    data_hora_chamado?: Date | string | null;
    conclusao_chamado?: string | null;
    status_chamado?: string | null;
    dtenvio_chamado?: Date | string | null;
    cod_recurso?: string | null;
    nome_recurso?: string | null;
    cod_cliente?: string | null;
    nome_cliente?: string | null;
    razao_cliente?: string | null;
    assunto_chamado?: string | null;
    email_chamado?: string | null;
    prior_chamado?: string | null;
    cod_classificacao?: string | null;
    qtd_limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    apontamentos?: chamados_apontamentosUncheckedCreateNestedManyWithoutChamadoInput;
  };

  export type chamadosUpdateInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    apontamentos?: chamados_apontamentosUpdateManyWithoutChamadoNestedInput;
  };

  export type chamadosUncheckedUpdateInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    apontamentos?: chamados_apontamentosUncheckedUpdateManyWithoutChamadoNestedInput;
  };

  export type chamadosCreateManyInput = {
    cod_chamado: string;
    data_chamado?: string | null;
    hora_chamado?: string | null;
    data_hora_chamado?: Date | string | null;
    conclusao_chamado?: string | null;
    status_chamado?: string | null;
    dtenvio_chamado?: Date | string | null;
    cod_recurso?: string | null;
    nome_recurso?: string | null;
    cod_cliente?: string | null;
    nome_cliente?: string | null;
    razao_cliente?: string | null;
    assunto_chamado?: string | null;
    email_chamado?: string | null;
    prior_chamado?: string | null;
    cod_classificacao?: string | null;
    qtd_limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamadosUpdateManyMutationInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamadosUncheckedUpdateManyInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosCreateInput = {
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    chamado?: chamadosCreateNestedOneWithoutApontamentosInput;
  };

  export type chamados_apontamentosUncheckedCreateInput = {
    chamado_os?: string | null;
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamados_apontamentosUpdateInput = {
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    chamado?: chamadosUpdateOneWithoutApontamentosNestedInput;
  };

  export type chamados_apontamentosUncheckedUpdateInput = {
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosCreateManyInput = {
    chamado_os?: string | null;
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamados_apontamentosUpdateManyMutationInput = {
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosUncheckedUpdateManyInput = {
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type ApontamentosCreateInput = {
    id: string;
    chamado_os?: string | null;
    cod_os?: string | null;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    status_chamado?: string | null;
    nome_cliente?: string | null;
    nome_recurso?: string | null;
  };

  export type ApontamentosUncheckedCreateInput = {
    id: string;
    chamado_os?: string | null;
    cod_os?: string | null;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    status_chamado?: string | null;
    nome_cliente?: string | null;
    nome_recurso?: string | null;
  };

  export type ApontamentosUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type ApontamentosUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type ApontamentosCreateManyInput = {
    id: string;
    chamado_os?: string | null;
    cod_os?: string | null;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
    status_chamado?: string | null;
    nome_cliente?: string | null;
    nome_recurso?: string | null;
  };

  export type ApontamentosUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type ApontamentosUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    chamado_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type Chamados_apontamentosListRelationFilter = {
    every?: chamados_apontamentosWhereInput;
    some?: chamados_apontamentosWhereInput;
    none?: chamados_apontamentosWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type chamados_apontamentosOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type chamadosCountOrderByAggregateInput = {
    cod_chamado?: SortOrder;
    data_chamado?: SortOrder;
    hora_chamado?: SortOrder;
    data_hora_chamado?: SortOrder;
    conclusao_chamado?: SortOrder;
    status_chamado?: SortOrder;
    dtenvio_chamado?: SortOrder;
    cod_recurso?: SortOrder;
    nome_recurso?: SortOrder;
    cod_cliente?: SortOrder;
    nome_cliente?: SortOrder;
    razao_cliente?: SortOrder;
    assunto_chamado?: SortOrder;
    email_chamado?: SortOrder;
    prior_chamado?: SortOrder;
    cod_classificacao?: SortOrder;
    qtd_limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamadosAvgOrderByAggregateInput = {
    qtd_limmes_tarefa?: SortOrder;
  };

  export type chamadosMaxOrderByAggregateInput = {
    cod_chamado?: SortOrder;
    data_chamado?: SortOrder;
    hora_chamado?: SortOrder;
    data_hora_chamado?: SortOrder;
    conclusao_chamado?: SortOrder;
    status_chamado?: SortOrder;
    dtenvio_chamado?: SortOrder;
    cod_recurso?: SortOrder;
    nome_recurso?: SortOrder;
    cod_cliente?: SortOrder;
    nome_cliente?: SortOrder;
    razao_cliente?: SortOrder;
    assunto_chamado?: SortOrder;
    email_chamado?: SortOrder;
    prior_chamado?: SortOrder;
    cod_classificacao?: SortOrder;
    qtd_limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamadosMinOrderByAggregateInput = {
    cod_chamado?: SortOrder;
    data_chamado?: SortOrder;
    hora_chamado?: SortOrder;
    data_hora_chamado?: SortOrder;
    conclusao_chamado?: SortOrder;
    status_chamado?: SortOrder;
    dtenvio_chamado?: SortOrder;
    cod_recurso?: SortOrder;
    nome_recurso?: SortOrder;
    cod_cliente?: SortOrder;
    nome_cliente?: SortOrder;
    razao_cliente?: SortOrder;
    assunto_chamado?: SortOrder;
    email_chamado?: SortOrder;
    prior_chamado?: SortOrder;
    cod_classificacao?: SortOrder;
    qtd_limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamadosSumOrderByAggregateInput = {
    qtd_limmes_tarefa?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type ChamadosNullableScalarRelationFilter = {
    is?: chamadosWhereInput | null;
    isNot?: chamadosWhereInput | null;
  };

  export type chamados_apontamentosCountOrderByAggregateInput = {
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamados_apontamentosAvgOrderByAggregateInput = {
    limmes_tarefa?: SortOrder;
  };

  export type chamados_apontamentosMaxOrderByAggregateInput = {
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamados_apontamentosMinOrderByAggregateInput = {
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
  };

  export type chamados_apontamentosSumOrderByAggregateInput = {
    limmes_tarefa?: SortOrder;
  };

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedUuidFilter<$PrismaModel> | string;
  };

  export type ApontamentosCountOrderByAggregateInput = {
    id?: SortOrder;
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
    status_chamado?: SortOrder;
    nome_cliente?: SortOrder;
    nome_recurso?: SortOrder;
  };

  export type ApontamentosAvgOrderByAggregateInput = {
    limmes_tarefa?: SortOrder;
  };

  export type ApontamentosMaxOrderByAggregateInput = {
    id?: SortOrder;
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
    status_chamado?: SortOrder;
    nome_cliente?: SortOrder;
    nome_recurso?: SortOrder;
  };

  export type ApontamentosMinOrderByAggregateInput = {
    id?: SortOrder;
    chamado_os?: SortOrder;
    cod_os?: SortOrder;
    dtini_os?: SortOrder;
    hrini_os?: SortOrder;
    hrfim_os?: SortOrder;
    dthrini_apont?: SortOrder;
    dthrfim_apont?: SortOrder;
    respcli_os?: SortOrder;
    obs?: SortOrder;
    codrec_os?: SortOrder;
    cod_cliente?: SortOrder;
    limmes_tarefa?: SortOrder;
    dat_load?: SortOrder;
    status_chamado?: SortOrder;
    nome_cliente?: SortOrder;
    nome_recurso?: SortOrder;
  };

  export type ApontamentosSumOrderByAggregateInput = {
    limmes_tarefa?: SortOrder;
  };

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type chamados_apontamentosCreateNestedManyWithoutChamadoInput = {
    create?:
      | XOR<
          chamados_apontamentosCreateWithoutChamadoInput,
          chamados_apontamentosUncheckedCreateWithoutChamadoInput
        >
      | chamados_apontamentosCreateWithoutChamadoInput[]
      | chamados_apontamentosUncheckedCreateWithoutChamadoInput[];
    connectOrCreate?:
      | chamados_apontamentosCreateOrConnectWithoutChamadoInput
      | chamados_apontamentosCreateOrConnectWithoutChamadoInput[];
    createMany?: chamados_apontamentosCreateManyChamadoInputEnvelope;
    connect?:
      | chamados_apontamentosWhereUniqueInput
      | chamados_apontamentosWhereUniqueInput[];
  };

  export type chamados_apontamentosUncheckedCreateNestedManyWithoutChamadoInput =
    {
      create?:
        | XOR<
            chamados_apontamentosCreateWithoutChamadoInput,
            chamados_apontamentosUncheckedCreateWithoutChamadoInput
          >
        | chamados_apontamentosCreateWithoutChamadoInput[]
        | chamados_apontamentosUncheckedCreateWithoutChamadoInput[];
      connectOrCreate?:
        | chamados_apontamentosCreateOrConnectWithoutChamadoInput
        | chamados_apontamentosCreateOrConnectWithoutChamadoInput[];
      createMany?: chamados_apontamentosCreateManyChamadoInputEnvelope;
      connect?:
        | chamados_apontamentosWhereUniqueInput
        | chamados_apontamentosWhereUniqueInput[];
    };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type chamados_apontamentosUpdateManyWithoutChamadoNestedInput = {
    create?:
      | XOR<
          chamados_apontamentosCreateWithoutChamadoInput,
          chamados_apontamentosUncheckedCreateWithoutChamadoInput
        >
      | chamados_apontamentosCreateWithoutChamadoInput[]
      | chamados_apontamentosUncheckedCreateWithoutChamadoInput[];
    connectOrCreate?:
      | chamados_apontamentosCreateOrConnectWithoutChamadoInput
      | chamados_apontamentosCreateOrConnectWithoutChamadoInput[];
    upsert?:
      | chamados_apontamentosUpsertWithWhereUniqueWithoutChamadoInput
      | chamados_apontamentosUpsertWithWhereUniqueWithoutChamadoInput[];
    createMany?: chamados_apontamentosCreateManyChamadoInputEnvelope;
    set?:
      | chamados_apontamentosWhereUniqueInput
      | chamados_apontamentosWhereUniqueInput[];
    disconnect?:
      | chamados_apontamentosWhereUniqueInput
      | chamados_apontamentosWhereUniqueInput[];
    delete?:
      | chamados_apontamentosWhereUniqueInput
      | chamados_apontamentosWhereUniqueInput[];
    connect?:
      | chamados_apontamentosWhereUniqueInput
      | chamados_apontamentosWhereUniqueInput[];
    update?:
      | chamados_apontamentosUpdateWithWhereUniqueWithoutChamadoInput
      | chamados_apontamentosUpdateWithWhereUniqueWithoutChamadoInput[];
    updateMany?:
      | chamados_apontamentosUpdateManyWithWhereWithoutChamadoInput
      | chamados_apontamentosUpdateManyWithWhereWithoutChamadoInput[];
    deleteMany?:
      | chamados_apontamentosScalarWhereInput
      | chamados_apontamentosScalarWhereInput[];
  };

  export type chamados_apontamentosUncheckedUpdateManyWithoutChamadoNestedInput =
    {
      create?:
        | XOR<
            chamados_apontamentosCreateWithoutChamadoInput,
            chamados_apontamentosUncheckedCreateWithoutChamadoInput
          >
        | chamados_apontamentosCreateWithoutChamadoInput[]
        | chamados_apontamentosUncheckedCreateWithoutChamadoInput[];
      connectOrCreate?:
        | chamados_apontamentosCreateOrConnectWithoutChamadoInput
        | chamados_apontamentosCreateOrConnectWithoutChamadoInput[];
      upsert?:
        | chamados_apontamentosUpsertWithWhereUniqueWithoutChamadoInput
        | chamados_apontamentosUpsertWithWhereUniqueWithoutChamadoInput[];
      createMany?: chamados_apontamentosCreateManyChamadoInputEnvelope;
      set?:
        | chamados_apontamentosWhereUniqueInput
        | chamados_apontamentosWhereUniqueInput[];
      disconnect?:
        | chamados_apontamentosWhereUniqueInput
        | chamados_apontamentosWhereUniqueInput[];
      delete?:
        | chamados_apontamentosWhereUniqueInput
        | chamados_apontamentosWhereUniqueInput[];
      connect?:
        | chamados_apontamentosWhereUniqueInput
        | chamados_apontamentosWhereUniqueInput[];
      update?:
        | chamados_apontamentosUpdateWithWhereUniqueWithoutChamadoInput
        | chamados_apontamentosUpdateWithWhereUniqueWithoutChamadoInput[];
      updateMany?:
        | chamados_apontamentosUpdateManyWithWhereWithoutChamadoInput
        | chamados_apontamentosUpdateManyWithWhereWithoutChamadoInput[];
      deleteMany?:
        | chamados_apontamentosScalarWhereInput
        | chamados_apontamentosScalarWhereInput[];
    };

  export type chamadosCreateNestedOneWithoutApontamentosInput = {
    create?: XOR<
      chamadosCreateWithoutApontamentosInput,
      chamadosUncheckedCreateWithoutApontamentosInput
    >;
    connectOrCreate?: chamadosCreateOrConnectWithoutApontamentosInput;
    connect?: chamadosWhereUniqueInput;
  };

  export type chamadosUpdateOneWithoutApontamentosNestedInput = {
    create?: XOR<
      chamadosCreateWithoutApontamentosInput,
      chamadosUncheckedCreateWithoutApontamentosInput
    >;
    connectOrCreate?: chamadosCreateOrConnectWithoutApontamentosInput;
    upsert?: chamadosUpsertWithoutApontamentosInput;
    disconnect?: chamadosWhereInput | boolean;
    delete?: chamadosWhereInput | boolean;
    connect?: chamadosWhereUniqueInput;
    update?: XOR<
      XOR<
        chamadosUpdateToOneWithWhereWithoutApontamentosInput,
        chamadosUpdateWithoutApontamentosInput
      >,
      chamadosUncheckedUpdateWithoutApontamentosInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
      notIn?:
        | Date[]
        | string[]
        | ListDateTimeFieldRefInput<$PrismaModel>
        | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedFloatNullableFilter<$PrismaModel>;
    _min?: NestedFloatNullableFilter<$PrismaModel>;
    _max?: NestedFloatNullableFilter<$PrismaModel>;
  };

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedUuidFilter<$PrismaModel> | string;
  };

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type chamados_apontamentosCreateWithoutChamadoInput = {
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamados_apontamentosUncheckedCreateWithoutChamadoInput = {
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamados_apontamentosCreateOrConnectWithoutChamadoInput = {
    where: chamados_apontamentosWhereUniqueInput;
    create: XOR<
      chamados_apontamentosCreateWithoutChamadoInput,
      chamados_apontamentosUncheckedCreateWithoutChamadoInput
    >;
  };

  export type chamados_apontamentosCreateManyChamadoInputEnvelope = {
    data:
      | chamados_apontamentosCreateManyChamadoInput
      | chamados_apontamentosCreateManyChamadoInput[];
    skipDuplicates?: boolean;
  };

  export type chamados_apontamentosUpsertWithWhereUniqueWithoutChamadoInput = {
    where: chamados_apontamentosWhereUniqueInput;
    update: XOR<
      chamados_apontamentosUpdateWithoutChamadoInput,
      chamados_apontamentosUncheckedUpdateWithoutChamadoInput
    >;
    create: XOR<
      chamados_apontamentosCreateWithoutChamadoInput,
      chamados_apontamentosUncheckedCreateWithoutChamadoInput
    >;
  };

  export type chamados_apontamentosUpdateWithWhereUniqueWithoutChamadoInput = {
    where: chamados_apontamentosWhereUniqueInput;
    data: XOR<
      chamados_apontamentosUpdateWithoutChamadoInput,
      chamados_apontamentosUncheckedUpdateWithoutChamadoInput
    >;
  };

  export type chamados_apontamentosUpdateManyWithWhereWithoutChamadoInput = {
    where: chamados_apontamentosScalarWhereInput;
    data: XOR<
      chamados_apontamentosUpdateManyMutationInput,
      chamados_apontamentosUncheckedUpdateManyWithoutChamadoInput
    >;
  };

  export type chamados_apontamentosScalarWhereInput = {
    AND?:
      | chamados_apontamentosScalarWhereInput
      | chamados_apontamentosScalarWhereInput[];
    OR?: chamados_apontamentosScalarWhereInput[];
    NOT?:
      | chamados_apontamentosScalarWhereInput
      | chamados_apontamentosScalarWhereInput[];
    chamado_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    cod_os?: StringFilter<'chamados_apontamentos'> | string;
    dtini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    hrini_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    hrfim_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    dthrini_apont?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    dthrfim_apont?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
    respcli_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    obs?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    codrec_os?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    cod_cliente?: StringNullableFilter<'chamados_apontamentos'> | string | null;
    limmes_tarefa?:
      | FloatNullableFilter<'chamados_apontamentos'>
      | number
      | null;
    dat_load?:
      | DateTimeNullableFilter<'chamados_apontamentos'>
      | Date
      | string
      | null;
  };

  export type chamadosCreateWithoutApontamentosInput = {
    cod_chamado: string;
    data_chamado?: string | null;
    hora_chamado?: string | null;
    data_hora_chamado?: Date | string | null;
    conclusao_chamado?: string | null;
    status_chamado?: string | null;
    dtenvio_chamado?: Date | string | null;
    cod_recurso?: string | null;
    nome_recurso?: string | null;
    cod_cliente?: string | null;
    nome_cliente?: string | null;
    razao_cliente?: string | null;
    assunto_chamado?: string | null;
    email_chamado?: string | null;
    prior_chamado?: string | null;
    cod_classificacao?: string | null;
    qtd_limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamadosUncheckedCreateWithoutApontamentosInput = {
    cod_chamado: string;
    data_chamado?: string | null;
    hora_chamado?: string | null;
    data_hora_chamado?: Date | string | null;
    conclusao_chamado?: string | null;
    status_chamado?: string | null;
    dtenvio_chamado?: Date | string | null;
    cod_recurso?: string | null;
    nome_recurso?: string | null;
    cod_cliente?: string | null;
    nome_cliente?: string | null;
    razao_cliente?: string | null;
    assunto_chamado?: string | null;
    email_chamado?: string | null;
    prior_chamado?: string | null;
    cod_classificacao?: string | null;
    qtd_limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamadosCreateOrConnectWithoutApontamentosInput = {
    where: chamadosWhereUniqueInput;
    create: XOR<
      chamadosCreateWithoutApontamentosInput,
      chamadosUncheckedCreateWithoutApontamentosInput
    >;
  };

  export type chamadosUpsertWithoutApontamentosInput = {
    update: XOR<
      chamadosUpdateWithoutApontamentosInput,
      chamadosUncheckedUpdateWithoutApontamentosInput
    >;
    create: XOR<
      chamadosCreateWithoutApontamentosInput,
      chamadosUncheckedCreateWithoutApontamentosInput
    >;
    where?: chamadosWhereInput;
  };

  export type chamadosUpdateToOneWithWhereWithoutApontamentosInput = {
    where?: chamadosWhereInput;
    data: XOR<
      chamadosUpdateWithoutApontamentosInput,
      chamadosUncheckedUpdateWithoutApontamentosInput
    >;
  };

  export type chamadosUpdateWithoutApontamentosInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamadosUncheckedUpdateWithoutApontamentosInput = {
    cod_chamado?: StringFieldUpdateOperationsInput | string;
    data_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    hora_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    data_hora_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    conclusao_chamado?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    status_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    dtenvio_chamado?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    cod_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_recurso?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    nome_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    razao_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    assunto_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    email_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    prior_chamado?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_classificacao?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    qtd_limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosCreateManyChamadoInput = {
    cod_os: string;
    dtini_os?: string | null;
    hrini_os?: string | null;
    hrfim_os?: string | null;
    dthrini_apont?: Date | string | null;
    dthrfim_apont?: Date | string | null;
    respcli_os?: string | null;
    obs?: string | null;
    codrec_os?: string | null;
    cod_cliente?: string | null;
    limmes_tarefa?: number | null;
    dat_load?: Date | string | null;
  };

  export type chamados_apontamentosUpdateWithoutChamadoInput = {
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosUncheckedUpdateWithoutChamadoInput = {
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  export type chamados_apontamentosUncheckedUpdateManyWithoutChamadoInput = {
    cod_os?: StringFieldUpdateOperationsInput | string;
    dtini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrini_os?: NullableStringFieldUpdateOperationsInput | string | null;
    hrfim_os?: NullableStringFieldUpdateOperationsInput | string | null;
    dthrini_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    dthrfim_apont?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    respcli_os?: NullableStringFieldUpdateOperationsInput | string | null;
    obs?: NullableStringFieldUpdateOperationsInput | string | null;
    codrec_os?: NullableStringFieldUpdateOperationsInput | string | null;
    cod_cliente?: NullableStringFieldUpdateOperationsInput | string | null;
    limmes_tarefa?: NullableFloatFieldUpdateOperationsInput | number | null;
    dat_load?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
