module.exports = ({ env }) => {
  return {
    defaultConnection: "default",
    connections: {
      default: {
        connector: "bookshelf",
        settings: {
          charset: "utf8mb4",
          client: "mysql",
          database: env("mysql_dispersao_db", "dispersao_sequences"),
          host: env("database_host", "127.0.0.1"),
          port: env.int("mysql_port", 3306),
          username: env("mysql_dispersao_user", "dispersao_user"),
          password: env("mysql_dispersao_password", "password"),
          collation: "utf8mb4_unicode_ci",
        },
        options: {
          useNullAsDefault: true,
        },
      },
    },
  };
};
