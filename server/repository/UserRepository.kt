// repository/UserRepository.kt
@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun findByNameContainingIgnoreCase(name: String): List<User>
}