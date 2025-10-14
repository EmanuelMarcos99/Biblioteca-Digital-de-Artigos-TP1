const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Exemplo: use o seu provedor (SMTP) real
    auth: {
        user: process.env.EMAIL_USER, // Seu email de envio
        pass: process.env.EMAIL_PASS  // Sua senha/chave de app
    }
});

const sendNotificationEmail = async (recipients, eventData) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipients.join(','), // Lista de emails separados por vírgula
            subject: `📢 Novo Evento Criado: ${eventData.name}`,
            html: `
                <h1>Um novo evento foi criado na Biblioteca Digital!</h1>
                <p>Confira os detalhes:</p>
                <p><strong>Nome:</strong> ${eventData.name}</p>
                <p><strong>Descrição:</strong> ${eventData.description || 'Nenhuma descrição fornecida.'}</p>
                <p>Acesse a página do evento usando o link: [Link para ${eventData.slug}]</p>
                <br>
                <p>A equipe da Biblioteca Digital.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Emails de notificação enviados com sucesso!');

    } catch (error) {
        console.error('ERRO NO ENVIO DE EMAIL:', error);
        // É importante logar o erro, mas não deixar que ele trave o endpoint principal.
    }
};

module.exports = { 
    sendNotificationEmail 
};