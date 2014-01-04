path = require("path")
modulePath = path.resolve(__dirname, "../lib/server.js")
Server = require(modulePath).Server

describe('Server',() ->
  beforeEach ->
    @server = new Server()
    @date1 = "2013-12-20T23:59:59+09:00"
    @date2 = "2013-12-26T23:59:59+09:00"
    

    
  it('init test',() ->
    expect(typeof @server).toEqual("object")
  )
  
  it('特定の曜日のその週の月曜日の曜日が取得できる',() ->
    targetDate = "Dec 29,2013"
    expect(@server.getThisMonday(targetDate)).toEqual("2013-12-30T00:00:00+09:00")
  )
  
  it('特定の曜日のその週の金曜日の曜日が取得できる',() ->
    targetDate = "Dec 29,2013"
    expect(@server.getThisFriday(targetDate)).toEqual("2014-01-03T23:59:59+09:00")
  )

  it('特定の期間の企業訪問件数が取得できる',(done) ->
    @server.showCheckInData(@date1,@date2, (items) ->
      expect(items['株式会社パソナテック'].length).toEqual(4)
      done()      
    )
  ,8000)

  it('横浜支店の訪問数が取得できる',(done) ->
    teamName = '横浜支店'
    @server.countVisitClient(@date1,@date2, (items) ->
      expect(items[teamName].length).toEqual(2)
      done()      
    )
  ,8000)
  
  it('存在しない支店の訪問は取得できない',(done) ->
    teamName = '銀座支店'
    @server.countVisitClient(@date1,@date2, (items) ->
      expect(items[teamName]).toBeUndefined()
      done()      
    )
  ,10000)

  

)

describe('企業訪問の集計処理',() ->
  beforeEach ->
    @server = new Server()
    @date1 = "2013-12-20T23:59:59+09:00"
    @date2 = "2013-12-26T23:59:59+09:00"
    
  it('企業訪問した時の情報を登録できる',(done) ->
    data =
      clientID:"52c3358b90962627b6016010"
      visitDate:"2013-12-26T23:59:59+09:00"
      tags:['横浜支店']
    @server.createVisits(data,(response) ->
      expect(response).toBe(true)
      done()
    )
  ,8000)
    
  it('支店別に特定期間の集計処理が行える',(done) ->

    @server.calculateWeeklyVisitData(@date1, @date2,(items) ->
      for item in items
        if item.teamName is "ソリューション営業部"
          expect(item.visitRecord).toEqual(0)
          done()
    )
  ,8000)

  it('特定期間の抽出データを訪問記録としてACSに登録できる',(done) ->
    data =
      teamName:"サービスデリバリーグループ"
      visitRecord:0
      weekName:"week1"

    @server.registWeeklyVisitData(data,(response) ->
      expect(response).toBe(true)
      done()
    )
  ,8000)
  
  # it('訪問記録の特定のレコードを削除できる',(done) ->
  #   id = "52c3358b90962627b6016010"
  #   @server.deleteVisits(id,(response) ->
  #     expect(response).toBe(true)
  #     done()
  #   )
  # ,8000)

  it('ACSに登録されてる訪問記録の情報をリセットできる',(done) ->
    weekName = "week1"

    @server.deleteWeeklyVisitData(weekName,(response) ->
      expect(response).toBe(true)
      done()
    )
  ,8000)
  

)
