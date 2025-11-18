const nodemailer = require('nodemailer');
const emailService = require('../../src/controllers/emailService');

jest.mock('nodemailer');

describe('EmailService - Testes Adicionais para 100% Cobertura', () => {
    let mockTransporter;

    beforeEach(() => {
        mockTransporter = {
            sendMail: jest.fn(),
        };
        nodemailer.createTransport.mockReturnValue(mockTransporter);
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
    });

    describe('sendNotificationEmail - Casos de erro', () => {
        it('deve capturar erro quando transporter.sendMail falhar', async () => {
            const emailError = new Error('SMTP connection failed');
            mockTransporter.sendMail.mockRejectedValue(emailError);

            const subscribers = [
                { email: 'user1@test.com' },
                { email: 'user2@test.com' },
            ];

            await emailService.sendNotificationEmail('Test Article', subscribers);

            expect(console.error).toHaveBeenCalledWith(
                'Erro ao enviar e-mail de notificação:',
                emailError
            );
        });

        it('deve lidar com array vazio de subscribers', async () => {
            await emailService.sendNotificationEmail('Test Article', []);

            expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        });

        it('deve lidar com subscribers null', async () => {
            await emailService.sendNotificationEmail('Test Article', null);

            expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        });

        it('deve lidar com subscribers undefined', async () => {
            await emailService.sendNotificationEmail('Test Article', undefined);

            expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        });

        it('deve enviar email com múltiplos destinatários separados por vírgula', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

            const subscribers = [
                { email: 'user1@test.com' },
                { email: 'user2@test.com' },
                { email: 'user3@test.com' },
            ];

            await emailService.sendNotificationEmail('Multiple Recipients Article', subscribers);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user1@test.com, user2@test.com, user3@test.com',
                    subject: 'Novo artigo publicado: Multiple Recipients Article',
                })
            );
        });

        it('deve enviar email com conteúdo HTML correto', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

            const subscribers = [{ email: 'user@test.com' }];
            const articleTitle = 'HTML Content Test';

            await emailService.sendNotificationEmail(articleTitle, subscribers);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(articleTitle),
                    html: expect.stringContaining('<h1>'),
                    html: expect.stringContaining('Biblioteca Digital de Artigos'),
                })
            );
        });
    });

    describe('sendWelcomeEmail - Casos adicionais', () => {
        it('deve capturar erro quando sendMail falhar', async () => {
            const emailError = new Error('Network error');
            mockTransporter.sendMail.mockRejectedValue(emailError);

            await emailService.sendWelcomeEmail('newuser@test.com', 'New User');

            expect(console.error).toHaveBeenCalledWith(
                'Erro ao enviar e-mail de boas-vindas:',
                emailError
            );
        });

        it('deve enviar email de boas-vindas com nome do usuário', async () => {
            mockTransporter.sendMail.mockResolvedValue({ messageId: 'welcome-id' });

            await emailService.sendWelcomeEmail('user@test.com', 'João Silva');

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@test.com',
                    subject: 'Bem-vindo à Biblioteca Digital de Artigos!',
                    html: expect.stringContaining('João Silva'),
                })
            );
        });

        it('deve lidar com email undefined', async () => {
            await emailService.sendWelcomeEmail(undefined, 'Test User');

            expect(mockTransporter.sendMail).toHaveBeenCalled();
        });

        it('deve lidar com nome undefined', async () => {
            await emailService.sendWelcomeEmail('user@test.com', undefined);

            expect(mockTransporter.sendMail).toHaveBeenCalled();
        });
    });

    describe('Configuração do Transporter', () => {
        it('deve criar transporter com configurações corretas do .env', () => {
            process.env.EMAIL_USER = 'test@gmail.com';
            process.env.EMAIL_PASS = 'testpassword';

            // Recarregar módulo para pegar novas variáveis
            jest.resetModules();
            require('../../src/controllers/emailService');

            expect(nodemailer.createTransport).toHaveBeenCalled();
        });
    });
});

const userController = require('../../src/controllers/userController');
const bcrypt = require('bcrypt');
const { req, res } = require('../mocks');

jest.mock('bcrypt');
jest.mock('../../src/controllers/emailService');

describe('UserController - Testes Adicionais para Cobertura Completa', () => {
    describe('register() - Casos adicionais', () => {
        it('deve lidar com erro ao enviar email de boas-vindas', async () => {
            req.body = {
                name: 'Test User',
                email: 'test@test.com',
                password: 'password123',
            };

            bcrypt.hash.mockResolvedValue('hashedPassword');
            mockSelect.mockResolvedValue({
                data: [{ id: 1, name: 'Test User', email: 'test@test.com' }],
                error: null,
            });

            // Mock do sendWelcomeEmail para falhar
            const emailService = require('../../src/controllers/emailService');
            emailService.sendWelcomeEmail = jest.fn().mockRejectedValue(new Error('Email error'));

            await userController.register(req, res);

            // Deve registrar mesmo com erro no email
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('subscribe() - Verificação duplicada', () => {
        it('deve retornar 409 se email já estiver inscrito', async () => {
            req.body = { email: 'existing@test.com' };

            mockSingle.mockResolvedValue({
                data: { id: 1, email: 'existing@test.com' },
                error: null,
            });

            await userController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Este email já está inscrito na newsletter.',
            });
        });
    });
});