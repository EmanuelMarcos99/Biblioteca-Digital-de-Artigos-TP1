
// controller/ArticleController.kt
@RestController
@RequestMapping("/api/articles")
class ArticleController(private val articleService: ArticleService) {

    @GetMapping("/search")
    fun searchArticles(
        @RequestParam(required = false) title: String?,
        @RequestParam(required = false) author: String?,
        @RequestParam(required = false) event: String?
    ): List<Article> = articleService.searchArticles(title, author, event)

    @PostMapping("/bulk")
    fun createArticlesFromBibtex(
        @RequestParam editionSlug: String,
        @RequestBody bibtexContent: String
    ): List<Article> = articleService.createArticlesFromBibtex(bibtexContent, editionSlug)
}