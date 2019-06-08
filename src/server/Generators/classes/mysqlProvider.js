const tab = `  `;

class MySqlProvider {
  constructor(connString) {
    this.connString = connString;
  }

  connection() {
    let conn = `const mysql = require("mysql");\n`;
    conn += `// WARNING - Properly secure the connection string\n`;
    conn += `const connection = mysql.createConnection(buildMysqlParams(${
      this.connString
    }));\n`;

    return conn;
  }

  selectWithWhere(table, col, val, returnsMany) {
    let query = `'SELECT * FROM "${table}" WHERE "${col}" = $1';\n`;

    returnsMany
      ? (query += `${tab.repeat(4)}return connection.query(sql, ${val})\n`)
      : (query += `${tab.repeat(4)}return connection.query(sql, ${val})\n`);

    query += addPromiseResolution();

    return query;
  }

  select(table) {
    let query = `'SELECT * FROM "${table}"';\n`;
    query += `${tab.repeat(4)}return connection.query(sql)\n`;

    query += addPromiseResolution();

    return query;
  }

  insert(table, cols, args) {
    const normalized = args
      .split(",")
      .map(a => a.replace(/[' | { | } | \$]/g, ""));

    const params = normalized.map((val, idx) => `$${idx + 1}`).join(", ");

    let query = `'INSERT INTO "${table}" (${cols}) VALUES (${params}) RETURNING *';\n`;
    query += `${tab.repeat(4)}return connection.query(sql, [${normalized.join(
      ", "
    )}])\n`;

    query += addPromiseResolution();

    return query;
  }

  update(table, idColumnName) {
    let query = `\`UPDATE "${table}" SET \${updateValues} WHERE "${idColumnName}" = $1 RETURNING *\`;\n`;
    query += `${tab.repeat(
      4
    )}return connection.query(sql, [id, ...Object.values(rest)])\n`;

    query += addPromiseResolution();
    return query;
  }

  delete(table, column) {
    let query = `'DELETE FROM "${table}" WHERE "${column}" = $1';\n`;
    query += `${tab.repeat(4)}return connection.query(sql, args.${column})\n`;

    query += addPromiseResolution();

    return query;
  }
}

const addPromiseResolution = () => {
  let str = `${tab.repeat(5)}.then(data => {\n`;
  str += `${tab.repeat(6)}return data;\n`;
  str += `${tab.repeat(5)}})\n`;
  str += `${tab.repeat(5)}.catch(err => {\n`;
  str += `${tab.repeat(6)}return ('The error is', err);\n`;
  str += `${tab.repeat(5)}})`;

  return str;
};

module.exports = MySqlProvider;
