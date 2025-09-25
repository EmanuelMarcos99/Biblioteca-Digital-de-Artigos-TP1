// util/BibtexParser.kt
@Component
class BibtexParser {

    fun parseBibtexToArticles(bibtexContent: String, edition: Edition): List<Article> {
        val articles = mutableListOf<Article>()

        // Implementação simplificada do parser BibTeX
        val entries = bibtexContent.split("@").drop(1)

        for (entry in entries) {
            if (entry.isNotBlank()) {
                val article = parseBibtexEntry(entry, edition)
                articles.add(article)
            }
        }

        return articles
    }

    private fun parseBibtexEntry(entry: String, edition: Edition): Article {
        // Lógica para extrair título, autores, etc. do BibTeX
        // Implementação detalhada aqui
    }
}