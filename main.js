import Fastify from 'fastify';
import YTDlpWrap from 'yt-dlp-wrap';

const ytDefault = YTDlpWrap.default;
const fastify = Fastify({ logger: true });

await ytDefault.downloadFromGithub();

const ytDlp = new ytDefault();

fastify.get('/', async (request, reply) => {
    reply.header('Content-Type', 'text/html; charset=utf-8');
    reply.send('<video width="50%" height="50%" controls autoplay><source src="/yt-test" type="video/mp4"></video');
});

fastify.get('/yt-test', async (request, reply) => {
    let readableStream = ytDlp.execStream([
        'https://www.youtube.com/watch?v=7nol7e9HJXg',
        '-N 3',
        '-f',
        'best[ext=mp4]',
    ]);

    request.raw.on('close', () => {
        readableStream.destroy();
    });

    reply.hijack();
    reply.raw.writeHead(200, { 'Content-Type': 'video/mp4' })

    readableStream.on('data', (chunk) => {
        reply.raw.write(chunk);
    });

    readableStream.on('end', () => {
        reply.raw.end();
    });

    readableStream.on('error', (err) => {
        reply.raw.end();
        console.error(err);
    });
});

try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1);
}