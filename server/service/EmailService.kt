// service/EmailService.kt
@Service
class EmailService(
    private val javaMailSender: JavaMailSender
) {
    fun sendNewArticleNotification(user: User, article: Article) {
        val message = SimpleMailMessage().apply {
            setTo(user.email)
            subject = "Novo artigo disponível: ${article.title}"
            text = """
                Olá ${user.name},
                
                Seu artigo "${article.title}" foi publicado no evento ${article.edition.event.name} ${article.edition.year}.
                
                Acesse: http://localhost:8080/articles/${article.id}
                
                Atenciosamente,
                Equipe Event Articles
            """.trimIndent()
        }
        javaMailSender.send(message)
    }
}