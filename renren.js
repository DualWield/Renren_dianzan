var request = require('request');
request = request.defaults({jar: true});


var arguments = process.argv.splice(2);
var username = arguments[0];
var password = arguments[1];
var owner = arguments[2];
var addLike = arguments[3] !== 'remove';
var completeCount = 0;
var urlLength;

function Renren(username, password) {
    this.username = username;
    this.password = password;
}

Renren.prototype.init = function (callback) {

    var that = this;

    request({

        url: 'http://www.renren.com/ajaxLogin/login',
        method: 'POST',
        form: {
            email: this.username,
            password: this.password
        }

    }, function (error, response, body) {

        var result = JSON.parse(body);

        if (result.code) {
            console.log('登录成功');
        }
        else {
            console.log('登录失败');
            return;
        }

        request({

            url: 'http://www.renren.com/home',
            method: 'GET'

        }, function (error, response, body) {

            // search name
            that.name = body.substring(body.indexOf('<title>人人网 - ') + 13, body.indexOf('</title>'));
            console.log('你好： ', that.name);

            // search id
            that.uid = body.substring(body.indexOf('ruid') + 6, body.indexOf('ruid') + 15);

            that.requestToken = body.substring(body.indexOf('requestToken') + 16, body.indexOf('_rtk') - 3);
            that._rtk = body.substring(body.indexOf('_rtk') + 8, body.indexOf('_rtk') + 16);

            callback.call(that);

        });
    });
};

Renren.prototype.addLike = function (urls) {

    console.log('点赞：  ');
    var that = this;
    var addLikeUrls = urls.map(function (value) {
        return 'http://like.renren.com/addlike?stype=status&sourceId=' + value + '&owner=' + owner + '&gid=status_' + value + '&uid=' + that.uid +
            '&name=' + encodeURI(that.name) + '&requestToken=' + that.requestToken + '&_rtk=' + that._rtk;
    });
    var time = 0;

    addLikeUrls.forEach(function (url) {

        // less than 2000 may cause error
        time += 2000;

        setTimeout(
            function () {
                request({
                    url: url,
                    method: 'GET'
                }, function (error, response, body) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        completeCount++;
                        console.log(completeCount + '/' + urlLength);
                    }
                });
            },
            time
        );

    });
};

Renren.prototype.removeLike = function (urls) {

    console.log('取消点赞：  ');
    var that = this;
    var removeLikeUrls = urls.map(function (value) {
        return 'http://like.renren.com/removelike?stype=status&sourceId=' + value + '&owner=' + owner + '&gid=status_' + value + '&uid=' + that.uid +
            '&name=' + encodeURI(that.name) + '&requestToken=' + that.requestToken + '&_rtk=' + that._rtk;
    });
    var time = 0;

    removeLikeUrls.forEach(function (url) {

        // less than 2000 may cause error
        time += 2000;

        setTimeout(
            function () {
                request({
                    url: url,
                    method: 'GET'
                }, function (error, response, body) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        completeCount++;
                        console.log(completeCount + '/' + urlLength);
                    }
                });
            },
            time
        );

    });
};


Renren.prototype.getStatusAndZan = function () {

    var that = this;

    request({
        url: 'http://status.renren.com/GetSomeomeDoingList.do?userId=' + owner + '&curpage=0&_jcb=jQuery1111038589087687432766_1435915573916&requestToken='
        + this.requestToken + '&_rtk=' + this._rtk + '&_=1435952994059',
        method: 'GET'

    }, function (err, res, body) {

        var pattern = /status_(\d{10})/g;
        var result;
        var tars = [];
        // the body contain each id twice
        var firstTar = pattern.exec(body)[1];
        tars.push(firstTar);

        while ((result = pattern.exec(body)) !== null) {
            if (result[1] == firstTar) {
                break;
            }
            tars.push(result[1]);
        }
        urlLength = tars.length;

        addLike ? that.addLike(tars) : that.removeLike(tars);

    });

};


var myRenren = new Renren(username, password);

myRenren.init(function () {
    myRenren.getStatusAndZan();
});