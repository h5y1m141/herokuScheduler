(function() {
  var Server, modulePath, path;

  path = require("path");

  modulePath = path.resolve(__dirname, "../lib/server.js");

  Server = require(modulePath).Server;

  describe('Server', function() {
    beforeEach(function() {
      this.server = new Server();
      this.date1 = "2013-12-20T23:59:59+09:00";
      return this.date2 = "2013-12-26T23:59:59+09:00";
    });
    it('init test', function() {
      return expect(typeof this.server).toEqual("object");
    });
    it('特定の曜日のその週の月曜日の曜日が取得できる', function() {
      var targetDate;
      targetDate = "Dec 29,2013";
      return expect(this.server.getThisMonday(targetDate)).toEqual("2013-12-30T00:00:00+09:00");
    });
    it('特定の曜日のその週の金曜日の曜日が取得できる', function() {
      var targetDate;
      targetDate = "Dec 29,2013";
      return expect(this.server.getThisFriday(targetDate)).toEqual("2014-01-03T23:59:59+09:00");
    });
    it('特定の期間の企業訪問件数が取得できる', function(done) {
      return this.server.showCheckInData(this.date1, this.date2, function(items) {
        expect(items['株式会社パソナテック'].length).toEqual(4);
        return done();
      });
    }, 8000);
    it('横浜支店の訪問数が取得できる', function(done) {
      var teamName;
      teamName = '横浜支店';
      return this.server.countVisitClient(this.date1, this.date2, function(items) {
        expect(items[teamName].length).toEqual(2);
        return done();
      });
    }, 8000);
    return it('存在しない支店の訪問は取得できない', function(done) {
      var teamName;
      teamName = '銀座支店';
      return this.server.countVisitClient(this.date1, this.date2, function(items) {
        expect(items[teamName]).toBeUndefined();
        return done();
      });
    }, 10000);
  });

  describe('企業訪問の集計処理', function() {
    beforeEach(function() {
      this.server = new Server();
      this.date1 = "2013-12-20T23:59:59+09:00";
      return this.date2 = "2013-12-26T23:59:59+09:00";
    });
    it('企業訪問した時の情報を登録できる', function(done) {
      var data;
      data = {
        clientID: "52c3358b90962627b6016010",
        visitDate: "2013-12-26T23:59:59+09:00",
        tags: ['横浜支店']
      };
      return this.server.createVisits(data, function(response) {
        expect(response).toBe(true);
        return done();
      });
    }, 8000);
    it('支店別に特定期間の集計処理が行える', function(done) {
      return this.server.calculateWeeklyVisitData(this.date1, this.date2, function(items) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (item.teamName === "ソリューション営業部") {
            expect(item.visitRecord).toEqual(0);
            _results.push(done());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }, 8000);
    it('特定期間の抽出データを訪問記録としてACSに登録できる', function(done) {
      var data;
      data = {
        teamName: "サービスデリバリーグループ",
        visitRecord: 0,
        weekName: "week1"
      };
      return this.server.registWeeklyVisitData(data, function(response) {
        expect(response).toBe(true);
        return done();
      });
    }, 8000);
    return it('ACSに登録されてる訪問記録の情報をリセットできる', function(done) {
      var weekName;
      weekName = "week1";
      return this.server.deleteWeeklyVisitData(weekName, function(response) {
        expect(response).toBe(true);
        return done();
      });
    }, 8000);
  });

}).call(this);
