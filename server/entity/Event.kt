@Entity
@Table(name = "events")
data class Event(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(unique = true, nullable = false)
    val name: String,
    val description: String,
    val slug: String, // Para URLs: sbes, sbcars, etc.
    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL])
    val editions: MutableList<Edition> = mutableListOf(),
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)