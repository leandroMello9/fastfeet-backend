module.exports = {
  dialect: 'postgres',
  host: '192.168.99.100',
  username: 'postgres',
  passowrd: 'docker',
  database: 'fastfeet',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
