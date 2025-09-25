// entity/User.kt
@Entity
@Table(name = "users")
data class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val email: String,
    val name: String,

    @Column(nullable = false)
    var password: String,
    val role: String = "USER",

    @ManyToMany(mappedBy = "authors")
    val articles: MutableSet<Article> = mutableSetOf(),

    @OneToMany(mappedBy = "user")
    val notifications: MutableSet<NotificationSubscription> = mutableSetOf()
)
