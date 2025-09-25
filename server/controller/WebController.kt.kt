// controller/WebController.kt
@Controller
@RequestMapping("/")
class `WebController.kt`(
    private val eventService: EventService,
    private val editionService: EditionService,
    private val articleService: ArticleService,
    private val userService: UserService
) {

    @GetMapping("/{eventSlug}")
    fun eventHomePage(@PathVariable eventSlug: String, model: Model): String {
        val event = eventService.findEventBySlug(eventSlug)
        model.addAttribute("event", event)
        model.addAttribute("editions", editionService.findEditionsByEvent(eventSlug))
        return "event-home"
    }

    @GetMapping("/{eventSlug}/{year}")
    fun editionHomePage(
        @PathVariable eventSlug: String,
        @PathVariable year: Int,
        model: Model
    ): String {
        val edition = editionService.findEditionBySlug("$eventSlug-$year")
        model.addAttribute("edition", edition)
        model.addAttribute("articles", articleService.findArticlesByEdition(edition.id))
        return "edition-home"
    }

    @GetMapping("/authors/{authorName}")
    fun authorHomePage(@PathVariable authorName: String, model: Model): String {
        val user = userService.findUserByName(authorName)
        val articles = articleService.findArticlesByAuthor(user.email)
        model.addAttribute("author", user)
        model.addAttribute("articlesByYear", articles.groupBy { it.edition.year })
        return "author-home"
    }
}