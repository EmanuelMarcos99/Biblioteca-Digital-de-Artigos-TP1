// controller/UserController.kt
@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @PostMapping("/{userId}/notifications")
    fun subscribeToNotifications(@PathVariable userId: Long): ResponseEntity<Void> {
        userService.subscribeToNotifications(userId)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/{userEmail}/articles")
    fun getUserArticles(@PathVariable userEmail: String): List<Article> {
        return articleService.findArticlesByAuthor(userEmail)
    }
}