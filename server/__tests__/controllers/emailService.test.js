// ============================================================================// ============================================================================

// ===========================
// 1. MOCKS DE DEPENDÊNCIAS (ANTES de qualquer import)
// ===========================

const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
    sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
    createTransport: mockCreateTransport,
}));

// Mock do console para não poluir logs
global.console.log = jest.fn();
global.console.error = jest.fn();

// ===========================
// 2. IMPORTS
// ===========================

const sendNotificationEmail = require('../../src/controllers/emailService');

// ===========================
// 3. FIXTURES DE TESTE
// ===========================

const mockEventData = {
    name: 'SBRC 2025',
    description: 'Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos',
    slug: 'sbrc-2025',
};

const mockRecipients = [
    'user1@test.com',
    'user2@test.com',
    'user3@test.com',
];

// ===========================
// 4. SUITE DE TESTES
// ===========================

describe('EmailService - Testes Completos', () => {
    beforeEach(() => {
        // Limpar todos os mocks antes de cada teste
        jest.clearAllMocks();
        
        // Configurar variáveis de ambiente
        process.env.EMAIL_USER = 'biblioteca@test.com';
        process.env.EMAIL_PASS = 'senhaSegura123';
    });

    afterEach(() => {
        // Limpar variáveis de ambiente após cada teste
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;
    });

    // ===========================
    // TESTES: sendNotificationEmail()
    // ===========================

    describe('sendNotificationEmail()', () => {
        it('deve enviar email com sucesso para múltiplos destinatários', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'biblioteca@test.com',
                to: 'user1@test.com,user2@test.com,user3@test.com',
                subject: '📢 Novo Evento Criado: SBRC 2025',
                html: expect.stringContaining('SBRC 2025'),
            });
            expect(console.log).toHaveBeenCalledWith('Emails de notificação enviados com sucesso!');
        });

        it('deve enviar email para um único destinatário', async () => {
            // ARRANGE
            const singleRecipient = ['admin@test.com'];
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(singleRecipient, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'admin@test.com',
                })
            );
        });

        it('deve incluir descrição do evento no HTML quando fornecida', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(mockEventData.description),
                })
            );
        });

        it('deve usar mensagem padrão quando descrição não for fornecida', async () => {
            // ARRANGE
            const eventWithoutDescription = {
                name: 'SBBD 2025',
                slug: 'sbbd-2025',
            };
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, eventWithoutDescription);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Nenhuma descrição fornecida.'),
                })
            );
        });

        it('deve incluir slug do evento no HTML', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(mockEventData.slug),
                })
            );
        });

        it('deve usar EMAIL_USER do .env como remetente', async () => {
            // ARRANGE
            process.env.EMAIL_USER = 'custom@test.com';
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'custom@test.com',
                })
            );
        });

        it('deve logar erro e NÃO lançar exceção quando envio falhar', async () => {
            // ARRANGE
            const emailError = new Error('SMTP connection failed');
            mockSendMail.mockRejectedValue(emailError);

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(console.error).toHaveBeenCalledWith('ERRO NO ENVIO DE EMAIL:', emailError);
            expect(mockSendMail).toHaveBeenCalledTimes(1);
        });

        it('deve tratar erro de autenticação do SMTP', async () => {
            // ARRANGE
            const authError = new Error('Invalid login: 535-5.7.8 Username and Password not accepted');
            mockSendMail.mockRejectedValue(authError);

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(console.error).toHaveBeenCalledWith('ERRO NO ENVIO DE EMAIL:', authError);
        });

        it('deve tratar erro de rede', async () => {
            // ARRANGE
            const networkError = new Error('Network timeout');
            mockSendMail.mockRejectedValue(networkError);

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(console.error).toHaveBeenCalledWith('ERRO NO ENVIO DE EMAIL:', networkError);
        });

        it('deve enviar email com array vazio de destinatários (cenário edge)', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail([], mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: '',
                })
            );
        });

        it('deve formatar corretamente o HTML do email', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('<h1>');
            expect(callArgs.html).toContain('<p>');
            expect(callArgs.html).toContain('<strong>Nome:</strong>');
            expect(callArgs.html).toContain('<strong>Descrição:</strong>');
            expect(callArgs.html).toContain('A equipe da Biblioteca Digital.');
        });

        it('deve incluir emoji no subject do email', async () => {
            // ARRANGE
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: expect.stringContaining('📢'),
                })
            );
        });

        it('deve enviar email com evento sem nenhum campo opcional', async () => {
            // ARRANGE
            const minimalEvent = {
                name: 'Evento Mínimo',
                slug: 'evento-minimo',
            };
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, minimalEvent);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Emails de notificação enviados com sucesso!');
        });

        it('deve lidar com caracteres especiais no nome do evento', async () => {
            // ARRANGE
            const eventWithSpecialChars = {
                name: 'SBRC & SBBD 2025 - "Edição Especial"',
                description: 'Evento com <html> tags & caracteres especiais',
                slug: 'sbrc-sbbd-2025',
            };
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(mockRecipients, eventWithSpecialChars);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: expect.stringContaining('SBRC & SBBD 2025 - "Edição Especial"'),
                    html: expect.stringContaining('Evento com <html> tags & caracteres especiais'),
                })
            );
        });

        it('deve lidar com emails de destinatários com formato inválido', async () => {
            // ARRANGE
            const invalidRecipients = ['invalid-email', 'another@invalid'];
            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            // ACT
            await sendNotificationEmail(invalidRecipients, mockEventData);

            // ASSERT
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'invalid-email,another@invalid',
                })
            );
        });

        it('deve executar sem travar mesmo com erro não tratado', async () => {
            // ARRANGE
            mockSendMail.mockImplementation(() => {
                throw new Error('Erro síncrono inesperado');
            });

            // ACT & ASSERT - não deve lançar exceção
            await expect(sendNotificationEmail(mockRecipients, mockEventData)).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });
    });
});
