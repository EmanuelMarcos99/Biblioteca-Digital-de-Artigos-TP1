// controller/EventController.kt
@RestController
@RequestMapping("/api/events")
class EventController(private val eventService: EventService) {

    @GetMapping
    fun getAllEvents(): List<Event> = eventService.findAllEvents()

    @PostMapping
    fun createEvent(@RequestBody event: Event): ResponseEntity<Event> {
        return ResponseEntity.ok(eventService.createEvent(event))
    }

    @PutMapping("/{id}")
    fun updateEvent(@PathVariable id: Long, @RequestBody event: Event): ResponseEntity<Event> {
        return eventService.updateEvent(id, event)?.let {
            ResponseEntity.ok(it)
        } ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteEvent(@PathVariable id: Long): ResponseEntity<Void> {
        return if (eventService.deleteEvent(id)) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}

