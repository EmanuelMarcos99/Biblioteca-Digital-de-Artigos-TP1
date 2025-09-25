// repository/EventRepository.kt
@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findBySlug(slug: String): Event?
    fun findByNameContainingIgnoreCase(name: String): List<Event>
}


