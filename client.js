

const grpc = require('grpc')
const booksProto = grpc.load('proto/books.proto')

const client = new booksProto.books.BookService('127.0.0.1:50051', grpc.credentials.createInsecure())

function printResponse (error, response) {
	if (error) {
		console.log('Error:', error)
	}
	// console.log(response)
}

function listBooks () {
	client.list({}, (error, books) => {
		printResponse(error, books)
	})
}

function insertBook (id, title, author) {
	const book = { 
		id: parseInt(id),
		title,
		author
	}
	client.insert(book, (error, empty) => {
		printResponse(error, empty)
	})
}

function getBook (id) {
	client.get({ id: parseInt(id) } , (error, empty) => {
		printResponse(error, empty)
	})
}

function deleteBook (id) {
	client.delete({ id: parseInt(id) } , (error, empty) => {
		printResponse(error, empty)
	})
}

function watchBooks () {
	const call = client.watch({})
	call.on('data', (book) => {
		console.log('watch books', book)
	})
}

watchBooks()

setTimeout(() => {
	insertBook(1, 'The interpretation of Code', 'John Doe')
	insertBook(2, 'The interpretation of Code', 'John Doe')
}, 500)

