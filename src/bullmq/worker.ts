import { Worker } from 'bullmq';
import { redisConfig } from './redisConfig.js';
import { transporter } from '../utils/nodemailer.js';

const worker = new Worker(
    'userSubscribes',
    async job => {
        try {
            if (job.name === 'sendActivityNotification') {
                const { subscribed, to, movie, activityType } = job.data;

                // Monte a mensagem conforme o template
                const actionText = activityType.includes('ADD') ? 'added' : 'removed';
                const listText = activityType.includes('WATCHEDLIST') ? 'watchedlist' : 'watchlist';
                const preposition = actionText === 'added' ? 'to' : 'from';

                const mailBody = `
                    Hello, ${to}! 
                    <br><br>

                    Looks like ${subscribed.email} just ${actionText} <a href="http://localhost:3000/movies/${movie.id}">${movie.title}</a> ${preposition} their ${listText}!

                    <br><br>
                    Kind regards,
                    Minerboxd
                `;

                await transporter.sendMail({
                    from: '"Minerboxd" <no-reply@minerboxd.com>',
                    to,
                    subject: 'User Activity Notification',
                    html: mailBody,
                });

                console.log(`E-mail enviado para ${to}`);
            }
        } catch (error) {
            console.error('Erro ao processar job:', error);
            throw error;
        }
    },
    redisConfig
);

worker.on('completed', job => {
    console.log(`Job ${job.id} concluído!`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} falhou:`, err);
});