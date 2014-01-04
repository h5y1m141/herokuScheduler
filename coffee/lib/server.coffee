class Server
  constructor:() ->
    fs = require('fs')
    
    path = require("path")
    file = fs.readFileSync(path.resolve(__dirname, "config.json"))
    json = JSON.parse(file.toString())
    apiKey = json.apiKey.development
    
    @moment = require("moment")
    @ACS = require('acs-node')
    @loginID = json.login
    @loginPasswd = json.password
    @ACS.init(apiKey)
    return

  getThisMonday:(targetDate) ->
    if targetDate is null
      return @moment().day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")
    else
      return @moment(targetDate).day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")
      
  getThisFriday:(targetDate) ->
    if targetDate is null    
      return @moment().day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")
    else
      return @moment(targetDate).day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")
      
  showCheckInData:(date1,date2,callback) ->
    ###*
     * ACSのスコアー情報を参照する
     * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
     * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
     * @param callback 抽出された結果をコールバック関数に渡す
     * @return 
     ###
    
    if date1 is null or date2 is null
      startDate = @getThisMonday()
      endDate   = @getThisFriday()
    else
      startDate = date1
      endDate   = date2

    data =
      login: @loginID
      password: @loginPasswd
      
    result = []
    moment = @moment    
    @_login((session_id) =>
      @ACS.Checkins.query(
        page: 1
        per_page: 50
        where:
          updated_at:
            "$gt":startDate
            "$lt":endDate
      , (e) ->
        if e.success
          for checkin in e.checkins
            # util = require('util')
            # console.log(util.inspect(checkin))
            # console.log("id:#{checkin.id} name: #{checkin.place.name} date: #{moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')}")
            result.push({
              id:checkin.id
              name:checkin.place.name
              date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
            })
          _ = require("underscore")
          items = _.groupBy(result,(item) ->
            item.name
          )
          # console.log(items)
          return callback(items)

        else
          console.log "Error:\n" + ((e.error and e.message) or JSON.stringify(e))
      )
    )
    
  countVisitClient:(date1,date2,callback) ->
    ###*
     * ACSのスコアー情報を参照する
     * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
     * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
     * @param callback 抽出された結果をコールバック関数に渡す
     * @return 
     ###
    
    if date1 is null or date2 is null
      startDate = @getThisMonday()
      endDate   = @getThisFriday()
    else
      startDate = date1
      endDate   = date2
    result = []
    moment = @moment
    @_login((session_id) =>
      @ACS.Checkins.query(
        page: 1
        per_page: 50
        where:
          updated_at:
            "$gt":startDate
            "$lt":endDate
      , (e) ->
        if e.success
          for checkin in e.checkins
            result.push({
              groupName :checkin.tags[0]
              date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
            })
            
          _ = require("underscore")
          items = _.groupBy(result,(item) ->
            item.groupName
          )   
          callback(items)
      )
    )
    
  deleteVisits:(id,callback) ->
    @_login((session_id) =>
      console.log "login done.delete start session_id is #{session_id}"
      @ACS.Objects.remove
        classname:"visits"
        session_id:session_id
        id:id
      , (e) ->
        console.log(e)
        if e.success
          callback true
        else
          callback false
    )
  createVisits:(data,callback) ->
    @_login((session_id) =>
      @ACS.Objects.create
        classname:"visits"
        session_id:session_id
        fields:
          clientID:data.clientID
          visitDate:data.visitDate
          tags:data.tags
      , (e) ->
        if e.success
          callback true
        else
          callback false
    )

  calculateWeeklyVisitData:(date1, date2, callback) ->
    ###*
     * 支店別に特定期間の集計処理が行える
     * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
     * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
     * @param callback [ { teamName: 'ソリューション営業部', visitRecord: 0 },  { teamName: '東日本営業部', visitRecord: 0 }...]というデータ構造をコールバック関数に渡す

     * @return 
     ###

    if date1 is null or date2 is null
      startDate = @getThisMonday()
      endDate   = @getThisFriday()
    else
      startDate = date1
      endDate   = date2
      
    result = []

    @countVisitClient(startDate,endDate,(items) ->
      teamNameList = [
        "ソリューション営業部"
        "東日本営業部"
        "ITプロダクトグループ"
        "通信キャリアグループ"
        "伊藤忠営業グループ"
        "第1法人グループ"
        "第2法人グループ"
        "第3法人グループ"
        "スマホソーシャルグループ"
        "横浜支店"
        "仙台支店"
        "札幌支店"
        "名古屋支店"
        "豊田支店"
        "西日本営業部"
        "大阪支店"
        "広島支店"
        "福岡支店"
        "東日本エンジニアリンググループ"
        "西日本エンジニアリンググループ"
        "東日本ソーシャルソリューショングループ"
        "中部ソーシャルソリューショングループ"
        "西日本ソーシャルソリューショングループ"
        "サービスデリバリーグループ"
      ]
      
      for teamName in teamNameList
        if typeof items[teamName] is "undefined"
          visitRecord = 0
        else  
          visitRecord = items[teamName].length
        # console.log "teamName : #{teamName} total: #{visitRecord}"

        result.push({
          teamName : teamName
          visitRecord: visitRecord
        })
        
      callback(result)

    )

  registWeeklyVisitData:(data,callback) ->
    @_login((session_id) =>
      @ACS.Objects.create
        classname:"WeeklyVisitData"
        session_id:session_id
        fields:
          visitRecord:data.visitRecord
          tags:[data.teamName,data.weekName]
      , (e) ->
        if e.success
          callback true
        else
          callback false
    )    

  deleteWeeklyVisitData:(weekName,callback) ->
    that = @
    classname = "WeeklyVisitData"
    @_login((session_id) ->
      that.ACS.Objects.query
        classname:classname
        per_page:100
        where:
          tags:weekName
      ,(e) ->
        if e.success
          for data in e.WeeklyVisitData
            that.ACS.Objects.remove
              classname:classname
              session_id:session_id
              id:data.id
            ,(e) ->
              if e.success
                console.log "delete response is success"
              else
                console.log "delete response is fail"
          callback true  
      )
    
        
  _login:(callback) ->
    data =
      login: @loginID
      password: @loginPasswd
    
    @ACS.Users.login(data, (response) =>
      
      if response.success
        # console.log(response.meta.session_id)
        callback(response.meta.session_id)
      else
        console.log "Error to login: " + response.message
    )            
    
exports.Server = Server
