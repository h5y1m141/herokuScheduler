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
      teamName: "第1法人営業部",
      visitRecord: 0
    }, {
      teamName: "第2法人営業部",
      visitRecord: 2
    }, {
      teamName: "第3法人営業部",
      visitRecord: 10
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
    }), 1000);
  };

  for (_i = 0, _len = data.length; _i < _len; _i++) {
    item = data[_i];
    wait(item, function(value) {
      return console.log("" + value.teamName + " start");
    });
  }

}).call(this);
