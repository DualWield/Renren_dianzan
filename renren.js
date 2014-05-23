var request = require('request');
var fs = require('fs');
var env = require('jsdom').env;

var request = request.defaults({jar: true});

var arguments = process.argv.splice(2);
var username = arguments[0];
var password = arguments[1];
var peopleZan = arguments[2];

function getNum(text) {
    var value = text.replace(/[^0-9]/ig, "");
    return value;
}

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
            console.log('登录成功！');
        } else {
            console.log(body);
        }
        request({
            url: 'http://www.renren.com/home',
            method: 'GET'
        }, function (error, response, body) {
            var pattern = /<title>人人网 - ([\u4E00-\u9FA3]+)/;
            var titlestring = body.substring(body.indexOf('<title>'), body.indexOf('<title>') + 20);
            that.name = pattern.exec(titlestring)[1];
            that.uid = body.substring(body.indexOf('ruid') + 7, body.indexOf('ruid') + 16);
            //console.log(that.uid);
            callback();
        });
    });

};
Renren.prototype.dianzan = function (gid, owner) {
    var gid = 'status_' + gid;
    var uid = this.uid;
    var owner = owner;
    var name = encodeURI(this.name);
    console.log('gid:'+gid+' uid:' + uid + ' owner:' + owner + ' name' + name);
    var url = 'http://like.renren.com/addlike?gid=' + gid + '&uid=' + uid + '&owner=' + owner + '&type=6&name=' + name + '&t=0.3846073145978153';
    console.log('url:'+url);
    request({
        //url:'http://like.renren.com/addlike?gid=status_5193852871&uid=333524238&owner=391449192&type=6&name=%e7%8e%8b%e9%94%90&t=0.861353991786018',
        url: url,

        method: 'GET'

        // ,form:{
        // 	gid:'status_5193852871',
        // 	uid:'601715067',
        // 	owner:'391449192',
        // 	type:6,
        // 	name:'上大黑洞',
        // 	t: Math.random()
        // }
    }, function (error, response, body) {
        console.log(body);
    })
};

Renren.prototype.status = function (content) {

};
Renren.prototype.getStatusAndZan = function () {
    var that = this;
    request({
        url: 'http://status.renren.com/status?id='+peopleZan+'&__view=async-html',
        method: 'GET'

    }, function (err, res, body) {
        console.log('status geted!!');
        var html = body;
        env(html, function (err, window) {
            var $ = require('jquery')(window);
            var time = 0;
            var status = $('#my_panel>li');
            status.each(function () {
                time = time +3000;
                var gid = getNum($(this).attr('id'));
                setTimeout(function (){
                    that.dianzan(gid, peopleZan);
                },time);

            });
        });
    });
};
var myRenren = new Renren(username, password);
myRenren.init(function () {
    myRenren.getStatusAndZan();
});
