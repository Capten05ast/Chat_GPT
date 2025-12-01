

// IMPORT PINECONE PACKAGE :-
// import { Pinecone } from '@pinecone-database/pinecone'
const { Pinecone } = require('@pinecone-database/pinecone');


// API KEY :-
// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


// INDEX :-
// This is the name of the index that we created in Pinecone database
// Refer -> 4. Upsert text, second code snippet
const cohortChatGptIndex = pc.index('cohort-chat-gpt')


// CREATE MEMORY FUNCTION :-
// Stores vector embeddings with metadata in Pinecone
async function createMemory ( {vectors, metadata, messageId} ) {
    await cohortChatGptIndex.upsert( [{
        id: messageId,
        values: vectors,
        metadata
    }] )
}


// QUERY MEMORY FUNCTION :-
// topk  =>  means how many similar vectors around the specfic vector we want to fetch
// includeMetadata: true  =>  This means the meta data created during createMemory will also be included in the response
// queryVector  =>  is the vector for which we want to find the matching vectors in last topK records
async function queryMemory ( {queryVector, limit = 5, metadata} ) { 
    const data = await cohortChatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? { metadata } : undefined,
        // This means the meta data created during createMemory will also be included in the response
        includeMetadata: true 
    })
    return data.matches
}


// DELETE MEMORY FUNCTION :-
// ✅ Deletes vectors from Pinecone based on chat ID (metadata filtering)
// When a chat is deleted, all its vectors (messages) should be deleted from LTM
async function deleteMemory ( chatId ) {
    try {
        // Query all vectors for this chat first
        const vectors = await cohortChatGptIndex.query({
            vector: new Array(768).fill(0), // Dummy vector to get metadata filtering to work
            topK: 10000, // Get all vectors
            filter: { 
                "metadata.chat": chatId 
            },
            includeMetadata: true
        })

        // Extract IDs of vectors to delete
        const idsToDelete = vectors.matches.map(match => match.id);

        // Delete all vectors with this chat ID
        if (idsToDelete.length > 0) {
            await cohortChatGptIndex.deleteMany(idsToDelete);
            console.log(`Deleted ${idsToDelete.length} vectors from Pinecone for chat ${chatId}`);
        }
    } catch (err) {
        console.error("Error deleting memory from Pinecone:", err);
    }
}


module.exports = {
    createMemory,
    queryMemory,
    deleteMemory // ✅ Export delete function
}




// **** PINE CONE :-

// > Pinecone and login 
// > Home page > Databse > Indexes > create new Index 
//   Name : Default / cohort-chat-gpt
//   Dimensions : 768
//   Keep other configurations as it is (Configuration, region, cloud service provider)
// > click create Index

// > Pinecone docs
// > QuickStart
// > Install an SDK > JavaScript > npm install @pinecone-database/pinecone
// > Copy the code snippet from 3. Create an Index > JavaScript
//   Paste in VS code > Services > vector.service.js
// > Also refer 4. upsert text, second code snippet for initializing the index variable 

// > Back to Pinecone website
// > API keys 
// > create a new API key
// > Copy paste the API key in .env > vector.service.js code
// > Modify the code

// > Export these functions
//   Import in socket.server.js

// GEMINI DOCS :-
// > Models > Embeeddings 
// > VS code > services > ai.services.js > create new function generateVector









// COMMENT THE BELOW CODE AND REFER IT A LIL BIT FOR WRITING OUR MODIFIED CODE :-
// Create a dense index with integrated embedding
// const indexName = 'quickstart-js';
// await pc.createIndexForModel({
//   name: indexName,
//   cloud: 'aws',
//   region: 'us-east-1',
//   embed: {
//     model: 'llama-text-embed-v2',
//     fieldMap: { text: 'chunk_text' },
//   },
//   waitUntilReady: true,
// });




