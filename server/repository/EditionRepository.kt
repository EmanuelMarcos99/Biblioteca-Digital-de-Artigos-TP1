// repository/EditionRepository.kt
@Repository
interface EditionRepository : JpaRepository<Edition, Long> {
    fun findBySlug(slug: String): Edition?
    fun findByEventSlugAndYear(eventSlug: String, year: Int): Edition?
    fun findByEventSlug(eventSlug: String): List<Edition>
}


