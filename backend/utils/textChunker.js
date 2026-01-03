/**
 * split text into chunks for better AI Processing
 * @param {string} text  - full text into chunk
 * @param {number} chunkSize - Target size per chunk( in words)
 * @param {number} Overlap - Overlapping words between chunks
 * @returns {Array<{Content: string, PageNumber: number, chunkIndex: number }>} Array of text chunks
 * 
 */


export const chunkText = (text, chunkSize = 500, Overlap = 50) => {
    if (!text || text.trim() === 0) {
        return [];
    }

    //clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .replace(/\r+\n/g, '\n')
        .replace(/\n/g, '\n')
        .trim();

    //try to split by paragrph (single or doublr lines)
    const paragraphs = cleanedText.split(/\n+/).filter((p) => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        //if single paragraph exceeds chunk size split it by words
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    pageNumber: 0,
                    chunkIndex: chunkIndex++,
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            //split large para into word-base chunks
            for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
                const chunk = paragraphWords.slice(i, i + chunkSize);
                currentChunk.push({
                    content: chunk.join(' '),
                    pageNumber: 0,
                    chunkIndex: chunkIndex++,
                });

                if (i + chunkSize >= paragraphWords.length) break;

            }
            continue;
        }

        //if adding this para exceeds chunk size, save current chunk
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                pageNumber: 0,
                chunkIndex: chunkIndex++,
            });
            //create overlap from previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');


            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;

        } else {
            //add para to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }


    //add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            pageNumber: 0,
            chunkIndex: chunkIndex,
        });
    }

    //fallback: if no chunks created, split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                pageNumber: 0,
                chunkIndex: chunkIndex++,
            });

            if (i + chunkSize >= allWords.length) break;
        }
    }

    return chunks;

};

/**
 * find relavant chunks based on keyword matcing
 * @param {Array<object>} chunks - Array of chunks
 * @param {string} query  - search query
 * @param {number} MaxChunks - Maximum chunks of return
 * @returns {Array<object>} Array of relevant chunks
 * 
 */


export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query)
        return [];


//common stop words to exclude
const stopWords = new set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'of', 'for', 'as', 'this', 'that', 'it'
]);

//Extract and clean query words
const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

if (queryWords.length === 0) {
    //return clean chunk objects without Mongoose Metadata
    return chunks.slice(0, maxChunks).map(chunk => ({
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        _id: chunk._id,
    }));
}

const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    const contentWords = chunk.split(/\s+/).length;

    //score each query word
    for (const word of queryWords) {
        //Exact word atch (higher score)
        const exactMatches = (content.match(new RegExp('\\b${word}\\b', 'g')) || []).length;
        score += exactMatches * 3;

        //patial matches (lower score)
        const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
        score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    //Bonus: Multiple query word found
    const uniqueWordsFound = queryWords.filter(word =>
        content.includes(word)
    ).length;
    if (uniqueWordsFound > 1) {
        score += uniqueWordsFound * 2;
    }

    //Normalize by content length
    const lengthNormalizedScore = score / Math.sqrt(contentWords);

    //small bonus for earlier chunks
    const positionBonus = 1 - (index / (chunks.length) * 0.1);


    //return clean object without mongoose metadata
    return {
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        _id: chunk._id,
        score: lengthNormalizedScore * positionBonus,
        rawScore: score,
        matchedWords: uniqueWordsFound,
    };
});


return scoredChunks 
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }

        if (b.matchedWords !== a.matchedWords) {
            return b.matchedWords - a.matchedWords;
        }

        return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);    

};

