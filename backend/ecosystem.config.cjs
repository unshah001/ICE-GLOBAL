module.exports = {
  apps: [
    {
      name: "server",
      cwd: "/root/server",
      script: "dist/server.js",
      instances: 2,              // change to "max" if you want cluster
      exec_mode: "fork",         // use "cluster" if instances > 1
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 2000,

      // If your app reads PORT/NODE_ENV/etc
      env: {
        NODE_ENV: "production",
        APP_PORT:8082
      },

      // Logs
      out_file: "/var/log/pm2/server-out.log",
      error_file: "/var/log/pm2/server-err.log",
      merge_logs: true,
      time: true
    }
  ]
};
