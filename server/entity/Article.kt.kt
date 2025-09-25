@Entity
@Table(name = "articles")
data class `Article.kt`(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    val title: String,
    val abstractText: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edition_id", nullable = false)
    val edition: Edition,
    @ManyToMany
    @JoinTable(
        name = "article_authors",
        joinColumns = [JoinColumn(name = "article_id")],
        inverseJoinColumns = [JoinColumn(name = "user_id")]
    )
    val authors: MutableSet<User> = mutableSetOf(),
    val pdfUrl: String? = null,
    val bibtexCitation: String,
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)