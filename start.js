var http = require('http');
const pm2 = require('pm2');

http.createServer(function (req, res) {
    console.log(`Just got a request at ${req.url}!`)

    const scriptPath = 'index.js';

    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.start({
            script: scriptPath,
            name: 'doggo-music-development',
        }, (err, apps) => {
            pm2.disconnect();

            if (err) {
                console.error(err);
                process.exit(2);
            }
        });
    });

    res.write('started index.js!');
    res.end();
}).listen(process.env.PORT || 3000);