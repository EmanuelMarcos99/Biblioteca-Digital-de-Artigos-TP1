// entity/Edition.kt
@Entity
@Table(name = "editions")
data class Edition(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    val event: Event,
    val year: Int,
    val location: String?,
    val slug: String, // sbes-2025

    @OneToMany(mappedBy = "edition", cascade = [CascadeType.ALL])
    val articles: MutableList<Article> = mutableListOf(),

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)