// lib/firebird/firebird-client.ts
import Firebird from 'node-firebird';

const options: Firebird.Options = {
  host: 'localhost',
  port: 3050,
  database:
    process.env.NODE_ENV === 'development'
      ? 'C:/GERPROJ/GERPROJ_SOLUTII.GDB'
      : 'C:/GERPROJ/GERPROJ_SOLUTII.GDB',
  user: 'SYSDBA',
  password: 'masterkey',
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
