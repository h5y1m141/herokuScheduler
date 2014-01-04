path = require("path")

modulePath = path.resolve(__dirname, "lib/server.js")
Server = require(modulePath).Server
server = new Server()
weekName = "week1"

server.deleteWeeklyVisitData(weekName,(response) ->
  console.log "delete result is #{response}"

)

