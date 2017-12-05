const grpc = require('grpc')
const events = require('events')

const booksProto = grpc.load('proto/books.proto')
const bookStream = new events.EventEmitter()

const server = new grpc.Server()

const books = [
	{ id: 123, title: 'A tale of two cities', author: 'Charles Dickens' }
]

server.addService(booksProto.books.BookService.service, {
	list (call, callback) {
		callback(null, books)
	},
	insert(call, callback) {
		const book = call.request
		books.push(book)
		bookStream.emit('new_book', book)
		callback(null, {})
	},
	get (call, callback) {
		for (let i = 0; i < books.length; i += 1) {
			if (books[i].id === call.request.id) {
				return callback(null, books[i])
			}
		}
		callback({
			code: grpc.status.NOT_FOUND,
			details: 'Not found'
		})
	},
	delete (call, callback) {
		for (let i = 0; i < books.length; i+= 1) {
			if (books[i].id === call.request.id) {
				books.splice(i, 1)
				return callback(null, {})
			}
		}
		callback({
			code: grpc.status.NOT_FOUND,
			details: 'Not found'
		})
	},
	watch(stream) {
		bookStream.on('new_book', function (book) {
			stream.write(book)
		})
	}
})

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
console.log('server running at *:50051')
server.start()
