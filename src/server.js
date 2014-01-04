(function() {
  var Server;

  Server = (function() {
    function Server() {
      var apiKey, file, fs, json, path, _;
      fs = require('fs');
      _ = require("underscore");
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

    Server.prototype.getThisMonday = function() {
      return this.moment().day(1).hours(0).minutes(0).seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
    };

    Server.prototype.getThisFriday = function() {
      return this.moment().day(5).hours(23).minutes(59).seconds(59).milliseconds(0).format("YYYY-MM-DDTHH:mm:ssZ");
    };

    Server.prototype.showCheckInData = function() {
      /**
       * ACSのスコアー情報を参照する
       * @param {loginID} ACSにログインする管理者権限の設定がされてるユーザID　{loginPasswd} ログイン時のパスワード
       * @return
      */

      var data;
      data = {
        login: this.loginID,
        password: this.loginPasswd
      };
      return this.ACS.Users.login(data, function(response) {
        var result;
        result = [];
        if (response.success) {
          return this.ACS.Checkins.query({
            page: 1,
            per_page: 50,
            where: {
              updated_at: {
                "$gt": "2013-12-20T23:59:59+09:00",
                "$lt": "2013-12-26T23:59:59+09:00"
              }
            }
          }, function(e) {
            var checkin, items, _i, _len, _ref;
            if (e.success) {
              _ref = e.checkins;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                checkin = _ref[_i];
                console.log("id:" + checkin.id + " name: " + checkin.place.name + " date: " + (moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')));
                result.push({
                  id: checkin.id,
                  name: checkin.place.name,
                  date: moment(checkin.updated_at).format('YYYY-MM-DD HH:mm:ss')
                });
              }
              items = _.groupBy(result, function(item) {
                return item.name;
              });
              return console.log(items);
            } else {
              return console.log("Error:\n" + ((e.error && e.message) || JSON.stringify(e)));
            }
          });
        } else {
          return console.log("Error to login: " + response.message);
        }
      });
    };

    return Server;

  })();

  exports.Server = Server;

}).call(this);
