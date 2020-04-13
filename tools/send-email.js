import mailer from '../src/modules/mail/mailer.js';

mailer.sendMail({
    from: 'Sender Name <sender@example.com>',
    to: 'Recipient <recipient@example.com>',
    subject: 'Example Subject',
    text: 'Hello!'
}, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
});
