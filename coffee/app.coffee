path = require("path")

modulePath = path.resolve(__dirname, "lib/server.js")
Server = require(modulePath).Server
server = new Server()

date1 = "2013-12-20T23:59:59+09:00"
date2 = "2013-12-26T23:59:59+09:00"

# server.calculateWeeklyVisitData(date1, date2,(items) ->
#   console.log items
# )

data = [
  teamName: "第1法人営業部"
  visitRecord: 0
,
  teamName: "第2法人営業部"
  visitRecord: 2
,
  teamName: "第3法人営業部"
  visitRecord: 10

]
# 登録時には、チーム名と登録期間をタグとして設定してACSに登録する
#
wait = (item, callback) ->
  setTimeout (->
    data =
      teamName:item.teamName
      visitRecord:item.visitRecord
      weekName:"week1"
      
    server.registWeeklyVisitData(data,(response) ->
      if response is true
        callback item  
    )
  ), 1000

for item in data
  wait item,(value) ->
    console.log "#{value.teamName} start"
