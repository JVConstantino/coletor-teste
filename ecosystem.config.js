module.exports = {
    apps: [{
        name: 'predictive-maintenance',
        script: './server.js',
        instances: 'max', // Use all CPU cores
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        // Restart settings
        autorestart: true,
        max_memory_restart: '500M',
        // Graceful shutdown
        kill_timeout: 5000,
        // Monitoring
        min_uptime: '10s',
        max_restarts: 10,
        // Advanced features
        watch: false,
        ignore_watch: ['node_modules', 'logs', 'dist']
    }]
};
