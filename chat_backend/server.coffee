###
	Author Divam Gupta
	Date Oct 14 2015

	this scriot will run in the webserver and is a brudge form the linux pc and webbrowsers
###

# fvf

print = console.log

express = require('express')
app = express()
server = require('http').Server(app)
io = require('socket.io')(server)

server.listen process.env.PORT or 3000
app.use express.static('../frontend')


activeConnections = {}
activeUsers = {}

# active browser connections
io_pc = undefined

print "hello friends" 

getUserFromToken = (x) -> x

io.on 'connection', (socket) ->


	print 'a new user connection connection'
	socket.browserId = (Math.random().toString(36) + '00000000000000000').slice(2, 14 + 2)
	activeConnections[socket.browserId] = socket



	socket.on 'register_client', (data) ->


		if socket.userToken?
			# already redistered
			return

		userToken = data.userToken
		userName = getUserFromToken(data.userToken)
		# validate token

		socket.userName = userName
		socket.userToken = userToken

		if  not activeUsers[userName]?
			activeUsers[userName] = {}

		activeUsers[userName][socket.browserId] = true

		socket.emit('sys_msg' , 'registered')
		print "registered"

		clearQueue(userName)



	socket.on 'send_msg', (data) ->

		if not socket.userToken?  
			print "user not registered"

		messenger.addToQueue( socket.userName , data.to_username , data.msg )




	socket.on 'disconnect', ->
		
		print 'a stupid user left  '

		delete activeConnections[socket.browserId]

		if  activeUsers[socket.userName]?
			delete activeUsers[socket.userName][socket.browserId]
		

messenger = {}
tmpToSentQ = {}

clearQueue = (to_user) ->

	if not tmpToSentQ[to_user]?
		return
	
	msgList = tmpToSentQ[to_user]
	tmpToSentQ[to_user] = []

	for msg in msgList
		messenger.addToQueue( msg[0] , msg[1] , msg[2] )



	
messenger.addToQueue = (from_user , to_user , msg) ->

	msgId = (Math.random().toString(36) + '00000000000000000').slice(2, 14 + 2);
	# messagesDb.add( { inboxOwnerId :  to_user , chatId : from_user , senderId : from_user , msg : msg , msgId : msgId  , time : (new Date()).getTime()  }   )
	# messagesDb.add(   { inboxOwnerId : from_user , chatId : to_user , senderId : from_user , msg : msg , msgId : msgId  , time : (new Date()).getTime() }   )

	if activeUsers[to_user]? and Object.keys(activeUsers[to_user]).length > 0  # activeUsers[to_user]
		browserIdList = Object.keys(activeUsers[to_user])

		for browserId in browserIdList
			activeConnections[browserId].emit( 'send_msg' , { chatId : from_user  , senderId :  from_user ,     msg : msg ,  time : (new Date()).getTime()  }   )
	else

		print "user not online"

		if not tmpToSentQ[to_user]?
			tmpToSentQ[to_user] = []

		tmpToSentQ[to_user].push( [from_user , to_user , msg] )









