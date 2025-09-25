// service/EditionService.kt
@Service
class EditionService(
    private val editionRepository: EditionRepository,
    private val eventService: EventService
) {
    fun createEdition(edition: Edition): Edition
    fun updateEdition(id: Long, editionData: Edition): Edition?
    fun deleteEdition(id: Long): Boolean
    fun findEditionBySlug(slug: String): Edition?
    fun findEditionsByEvent(eventSlug: String): List<Edition>
}