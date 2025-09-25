@Entity
@Table(name = "notification_subscriptions")
data class `NotificationSubscription.kt`(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    val isActive: Boolean = true,
    @CreationTimestamp
    val subscribedAt: LocalDateTime = LocalDateTime.now()
)