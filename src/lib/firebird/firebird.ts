import Firebird from 'node-firebird';

export const firebirdOptions: Firebird.Options = {
  host: 'localhost',
  port: 3050,
  database: 'C:/GERPROJ/GERPROJ_SOLUTII.GDB',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: undefined,
  pageSize: 4096,
};

export function queryFirebird<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Firebird.attach(firebirdOptions, (err, db) => {
      if (err) return reject(err);

      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result as T[]);
      });
    });
  });
}
