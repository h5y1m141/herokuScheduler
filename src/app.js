(function() {
  var Server, data, date1, date2, item, modulePath, path, server, wait, _i, _len;

  path = require("path");

  modulePath = path.resolve(__dirname, "lib/server.js");

  Server = require(modulePath).Server;

  server = new Server();

  date1 = "2013-12-20T23:59:59+09:00";

  date2 = "2013-12-26T23:59:59+09:00";

  data = [
    {
      teamName: "ソリューション営業部",
      visitRecord: 0
    }, {
      teamName: "東日本営業部",
      visitRecord: 0
    }, {
      teamName: "ITプロダクトグループ",
      visitRecord: 0
    }, {
      teamName: "通信キャリアグループ",
      visitRecord: 0
    }, {
      teamName: "伊藤忠営業グループ",
      visitRecord: 0
    }, {
      teamName: "第1法人グループ",
      visitRecord: 0
    }, {
      teamName: "第2法人グループ",
      visitRecord: 0
    }, {
      teamName: "第3法人グループ",
      visitRecord: 0
    }, {
      teamName: "スマホソーシャルグループ",
      visitRecord: 0
    }, {
      teamName: "横浜支店",
      visitRecord: 2
    }, {
      teamName: "仙台支店",
      visitRecord: 0
    }, {
      teamName: "札幌支店",
      visitRecord: 0
    }, {
      teamName: "名古屋支店",
      visitRecord: 0
    }, {
      teamName: "豊田支店",
      visitRecord: 0
    }, {
      teamName: "西日本営業部",
      visitRecord: 0
    }, {
      teamName: "大阪支店",
      visitRecord: 0
    }, {
      teamName: "広島支店",
      visitRecord: 0
    }, {
      teamName: "福岡支店",
      visitRecord: 0
    }, {
      teamName: "東日本エンジニアリンググループ",
      visitRecord: 0
    }, {
      teamName: "西日本エンジニアリンググループ",
      visitRecord: 0
    }, {
      teamName: "東日本ソーシャルソリューショングループ",
      visitRecord: 0
    }, {
      teamName: "中部ソーシャルソリューショングループ",
      visitRecord: 0
    }, {
      teamName: "西日本ソーシャルソリューショングループ",
      visitRecord: 0
    }, {
      teamName: "サービスデリバリーグループ",
      visitRecord: 0
    }
  ];

  wait = function(item, callback) {
    return setTimeout((function() {
      data = {
        teamName: item.teamName,
        visitRecord: item.visitRecord,
        weekName: "week1"
      };
      return server.registWeeklyVisitData(data, function(response) {
        if (response === true) {
          return callback(item);
        }
      });
    }), Math.ceil(Math.random() * 3000));
  };

  for (_i = 0, _len = data.length; _i < _len; _i++) {
    item = data[_i];
    wait(item, function(value) {
      return console.log("" + value.teamName + " start");
    });
  }

}).call(this);
