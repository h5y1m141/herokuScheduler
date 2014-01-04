(function() {
  var Server;

  Server = (function() {
    function Server() {
      var apiKey, file, fs, json, path;
      fs = require('fs');
      path = require("path");
      file = fs.readFileSync(path.resolve(__dirname, "config.json"));
      json = JSON.parse(file.toString());
      apiKey = json.apiKey.development;
      this.moment = require("moment");
      this.ACS = require('acs-node');
      this.loginID = json.login;
      this.loginPasswd = json.password;
      this.ACS.init(apiKey);
      return;
    }

    Server.prototype.getThisMonday = function(targetDate) {
      if (targetDate === null) {
        return this.moment().day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
      } else {
        return this.moment(targetDate).day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
      }
    };

    Server.prototype.getThisFriday = function(targetDate) {
      if (targetDate === null) {
        return this.moment().day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
      } else {
        return this.moment(targetDate).day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
      }
    };

    Server.prototype.showCheckInData = function(date1, date2, callback) {
      /**
       * ACSのスコアー情報を参照する
       * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
       * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
       * @param callback 抽出された結果をコールバック関数に渡す
       * @return
      */

      var data, endDate, moment, result, startDate,
        _this = this;
      if (date1 === null || date2 === null) {
        startDate = this.getThisMonday();
        endDate = this.getThisFriday();
      } else {
        startDate = date1;
        endDate = date2;
      }
      data = {
        login: this.loginID,
        password: this.loginPasswd
      };
      result = [];
      moment = this.moment;
      return this._login(function(session_id) {
        return _this.ACS.Checkins.query({
          page: 1,
          per_page: 50,
          where: {
            updated_at: {
              "$gt": startDate,
              "$lt": endDate
            }
          }
        }, function(e) {
          var checkin, items, _, _i, _len, _ref;
          if (e.success) {
            _ref = e.checkins;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              checkin = _ref[_i];
              result.push({
                id: checkin.id,
                name: checkin.place.name,
                date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
              });
            }
            _ = require("underscore");
            items = _.groupBy(result, function(item) {
              return item.name;
            });
            return callback(items);
          } else {
            return console.log("Error:\n" + ((e.error && e.message) || JSON.stringify(e)));
          }
        });
      });
    };

    Server.prototype.countVisitClient = function(date1, date2, callback) {
      /**
       * ACSのスコアー情報を参照する
       * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
       * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
       * @param callback 抽出された結果をコールバック関数に渡す
       * @return
      */

      var endDate, moment, result, startDate,
        _this = this;
      if (date1 === null || date2 === null) {
        startDate = this.getThisMonday();
        endDate = this.getThisFriday();
      } else {
        startDate = date1;
        endDate = date2;
      }
      result = [];
      moment = this.moment;
      return this._login(function(session_id) {
        return _this.ACS.Checkins.query({
          page: 1,
          per_page: 50,
          where: {
            updated_at: {
              "$gt": startDate,
              "$lt": endDate
            }
          }
        }, function(e) {
          var checkin, items, _, _i, _len, _ref;
          if (e.success) {
            _ref = e.checkins;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              checkin = _ref[_i];
              result.push({
                groupName: checkin.tags[0],
                date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
              });
            }
            _ = require("underscore");
            items = _.groupBy(result, function(item) {
              return item.groupName;
            });
            return callback(items);
          }
        });
      });
    };

    Server.prototype.deleteVisits = function(id, callback) {
      var _this = this;
      return this._login(function(session_id) {
        console.log("login done.delete start session_id is " + session_id);
        return _this.ACS.Objects.remove({
          classname: "visits",
          session_id: session_id,
          id: id
        }, function(e) {
          console.log(e);
          if (e.success) {
            return callback(true);
          } else {
            return callback(false);
          }
        });
      });
    };

    Server.prototype.createVisits = function(data, callback) {
      var _this = this;
      return this._login(function(session_id) {
        return _this.ACS.Objects.create({
          classname: "visits",
          session_id: session_id,
          fields: {
            clientID: data.clientID,
            visitDate: data.visitDate,
            tags: data.tags
          }
        }, function(e) {
          if (e.success) {
            return callback(true);
          } else {
            return callback(false);
          }
        });
      });
    };

    Server.prototype.calculateWeeklyVisitData = function(date1, date2, callback) {
      /**
       * 支店別に特定期間の集計処理が行える
       * @param date1 抽出する期間の開始日を指定。引数が無い場合にはスクリプト実施した日の週の月曜日が指定される
       * @param date2 抽出する期間の終了日を指定。引数が無い場合にはスクリプト実施した日の週の金曜日が指定される
       * @param callback [ { teamName: 'ソリューション営業部', visitRecord: 0 },  { teamName: '東日本営業部', visitRecord: 0 }...]というデータ構造をコールバック関数に渡す
      
       * @return
      */

      var endDate, result, startDate;
      if (date1 === null || date2 === null) {
        startDate = this.getThisMonday();
        endDate = this.getThisFriday();
      } else {
        startDate = date1;
        endDate = date2;
      }
      result = [];
      return this.countVisitClient(startDate, endDate, function(items) {
        var teamName, teamNameList, visitRecord, _i, _len;
        teamNameList = ["ソリューション営業部", "東日本営業部", "ITプロダクトグループ", "通信キャリアグループ", "伊藤忠営業グループ", "第1法人グループ", "第2法人グループ", "第3法人グループ", "スマホソーシャルグループ", "横浜支店", "仙台支店", "札幌支店", "名古屋支店", "豊田支店", "西日本営業部", "大阪支店", "広島支店", "福岡支店", "東日本エンジニアリンググループ", "西日本エンジニアリンググループ", "東日本ソーシャルソリューショングループ", "中部ソーシャルソリューショングループ", "西日本ソーシャルソリューショングループ", "サービスデリバリーグループ"];
        for (_i = 0, _len = teamNameList.length; _i < _len; _i++) {
          teamName = teamNameList[_i];
          if (typeof items[teamName] === "undefined") {
            visitRecord = 0;
          } else {
            visitRecord = items[teamName].length;
          }
          result.push({
            teamName: teamName,
            visitRecord: visitRecord
          });
        }
        return callback(result);
      });
    };

    Server.prototype.registWeeklyVisitData = function(data, callback) {
      var _this = this;
      return this._login(function(session_id) {
        return _this.ACS.Objects.create({
          classname: "WeeklyVisitData",
          session_id: session_id,
          fields: {
            visitRecord: data.visitRecord,
            tags: [data.teamName, data.weekName]
          }
        }, function(e) {
          if (e.success) {
            return callback(true);
          } else {
            return callback(false);
          }
        });
      });
    };

    Server.prototype.deleteWeeklyVisitData = function(weekName, callback) {
      var classname, that;
      that = this;
      classname = "WeeklyVisitData";
      return this._login(function(session_id) {
        return that.ACS.Objects.query({
          classname: classname,
          per_page: 100,
          where: {
            tags: weekName
          }
        }, function(e) {
          var data, _i, _len, _ref;
          if (e.success) {
            _ref = e.WeeklyVisitData;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              data = _ref[_i];
              that.ACS.Objects.remove({
                classname: classname,
                session_id: session_id,
                id: data.id
              }, function(e) {
                if (e.success) {
                  return console.log("delete response is success");
                } else {
                  return console.log("delete response is fail");
                }
              });
            }
            return callback(true);
          }
        });
      });
    };

    Server.prototype._login = function(callback) {
      var data,
        _this = this;
      data = {
        login: this.loginID,
        password: this.loginPasswd
      };
      return this.ACS.Users.login(data, function(response) {
        if (response.success) {
          return callback(response.meta.session_id);
        } else {
          return console.log("Error to login: " + response.message);
        }
      });
    };

    return Server;

  })();

  exports.Server = Server;

}).call(this);
