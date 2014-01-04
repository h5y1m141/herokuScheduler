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
  teamName: "ソリューション営業部"
  visitRecord: 0
,
  teamName: "東日本営業部"
  visitRecord: 0
,
  teamName: "ITプロダクトグループ"
  visitRecord: 0
,
  teamName: "通信キャリアグループ"
  visitRecord: 0
,
  teamName: "伊藤忠営業グループ"
  visitRecord: 0
,
  teamName: "第1法人グループ"
  visitRecord: 0
,
  teamName: "第2法人グループ"
  visitRecord: 0
,
  teamName: "第3法人グループ"
  visitRecord: 0
,
  teamName: "スマホソーシャルグループ"
  visitRecord: 0
,
  teamName: "横浜支店"
  visitRecord: 2
,
  teamName: "仙台支店"
  visitRecord: 0
,
  teamName: "札幌支店"
  visitRecord: 0
,
  teamName: "名古屋支店"
  visitRecord: 0
,
  teamName: "豊田支店"
  visitRecord: 0
,
  teamName: "西日本営業部"
  visitRecord: 0
,
  teamName: "大阪支店"
  visitRecord: 0
,
  teamName: "広島支店"
  visitRecord: 0
,
  teamName: "福岡支店"
  visitRecord: 0
,
  teamName: "東日本エンジニアリンググループ"
  visitRecord: 0
,
  teamName: "西日本エンジニアリンググループ"
  visitRecord: 0
,
  teamName: "東日本ソーシャルソリューショングループ"
  visitRecord: 0
,
  teamName: "中部ソーシャルソリューショングループ"
  visitRecord: 0
,
  teamName: "西日本ソーシャルソリューショングループ"
  visitRecord: 0
,
  teamName: "サービスデリバリーグループ"
  visitRecord: 0
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

  ), Math.ceil(Math.random() * 3000)

for item in data
  wait item,(value) ->
    console.log "#{value.teamName} start"
