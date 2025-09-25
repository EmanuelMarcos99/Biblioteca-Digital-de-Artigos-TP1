// service/EventService.kt
@Service
class EventService(
    private val eventRepository: EventRepository,
    private val editionRepository: EditionRepository
) {
    fun createEvent(event: Event): Event = eventRepository.save(event)
    fun updateEvent(id: Long, eventData: Event): Event?
    fun deleteEvent(id: Long): Boolean
    fun findEventBySlug(slug: String): Event?
    fun findAllEvents(): List<Event>
}