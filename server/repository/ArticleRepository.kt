// repository/ArticleRepository.kt
@Repository
interface ArticleRepository : JpaRepository<Article, Long> {
    fun findByTitleContainingIgnoreCase(title: String): List<Article>
    fun findByAuthorsEmail(email: String): List<Article>
    fun findByEditionEventSlug(eventSlug: String): List<Article>
    fun findByEditionSlug(editionSlug: String): List<Article>
}
