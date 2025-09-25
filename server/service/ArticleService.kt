// service/ArticleService.kt
@Service
class ArticleService(
    private val articleRepository: ArticleRepository,
    private val userRepository: UserRepository,
    private val editionService: EditionService,
    private val emailService: EmailService
) {
    fun createArticle(article: Article): Article
    fun createArticlesFromBibtex(bibtexContent: String, editionSlug: String): List<Article>
    fun searchArticles(title: String?, author: String?, event: String?): List<Article>
    fun updateArticle(id: Long, articleData: Article): Article?
    fun deleteArticle(id: Long): Boolean
    fun findArticlesByAuthor(email: String): List<Article>
}