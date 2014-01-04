class Server
  constructor:() ->
    fs = require('fs')
    _ = require("underscore")
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

  getThisMonday:() ->
    return @moment().day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")
  getThisFriday:() ->    
    return @moment().day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ")

  showCheckInData:() ->
    ###*
     * ACSのスコアー情報を参照する
     * @param {loginID} ACSにログインする管理者権限の設定がされてるユーザID　{loginPasswd} ログイン時のパスワード
     * @return 
     ###

    data =
      login: @loginID
      password: @loginPasswd

    @ACS.Users.login(data, (response) ->
      # console.log response
      result = []
      if response.success
        @ACS.Checkins.query(
          page: 1
          per_page: 50
          where:
            updated_at:
              "$gt":"2013-12-20T23:59:59+09:00"
              "$lt":"2013-12-26T23:59:59+09:00"
        , (e) ->
          if e.success
            for checkin in e.checkins
              console.log("id:#{checkin.id} name: #{checkin.place.name} date: #{moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')}")
              result.push({
                id:checkin.id
                name:checkin.place.name
                date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
              })

            items = _.groupBy(result,(item) ->
              item.name
            )
            console.log(items)

          else
            console.log "Error:\n" + ((e.error and e.message) or JSON.stringify(e))
        )
      else
        console.log "Error to login: " + response.message
    )
exports.Server = Server
