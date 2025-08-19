// lib/firebird/firebird-client.ts
import Firebird from 'node-firebird';

const options: Firebird.Options = {
  host: process.env.FIREBIRD_HOST,
  port: Number(process.env.FIREBIRD_PORT),
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: false,
  pageSize: 4096,
};

export function firebirdQuery<T = any>(
  sql: string,
  params: any[] = [],
  testMode = false
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, (err, db) => {
      if (err) return reject(err);

      db.transaction(Firebird.ISOLATION_READ_COMMITTED, (err, transaction) => {
        if (err) {
          db.detach();
          return reject(err);
        }

        transaction.query(sql, params, (err, result) => {
          const finish = () => db.detach();
          if (testMode) {
            transaction.rollback(finish);
          } else {
            transaction.commit(finish);
          }

          if (err) return reject(err);
          resolve(result as T[]);
        });
      });
    });
  });
}
