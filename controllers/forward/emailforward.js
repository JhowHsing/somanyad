var async = require("async");
var Domain = require("../../models/Domain").Domain;
var Forward = require("../../models/Domain").Forward;
var BlackReceiveList = require("../../models/Domain").BlackReceiveList;
var EmailVerify = require("../../models/Domain").EmailVerify;
var feePlan = require("../members/FeePlan").feePlan;


exports.forward = emailForward

// 获取真正转发目的地( 其实就是转发)
function emailForward (mail_from, rcpt_to, cb) {
	var toHost = rcpt_to.host;
  var toUser = rcpt_to.user;
	// Check user's domain in db
	// 检测 to field 邮件地址的 host 是否位于数据库(或者域名)

  async.waterfall([
    // 查看域名是否存在, 且通过验证
    function (done) {
      Domain.findOne({domain: rcpt_to.host, cnameVerifyStatus: true}, function (err, domain) {
        err = err || domain == null ? new Error("domain(" + rcpt_to.host + ") not found!") : null;
        done(err, domain);
      });
    },
    // 查看发送目的地(rcpt_to.user @ rcpt_to.host)是否处于废弃地址中
    function (domain, done) {

      // user: ObjectId,
      // // blockAddress@domain ==> email address
      // domain: ObjectId,
      // blockAddress: String,
      // replyInfo: String
      BlackReceiveList.findOne({domain: domain._id, blockAddress: rcpt_to.user}, function (err, blackRecord) {
        if (blackRecord) {
          err = new Error(blackRecord.replyInfo);
          return done(err);
        }
        done(err, domain)
      });
    },
    // 查看转发目的地记录, 且转发目的地已授权转发
    function (domain, done) {
      EmailVerify.findOne({_id: domain.forward_email, passVerify: true}, function (err, emailV) {
        err = err ||
              emailV == null ? new Error("never found email record") : null;
        done(err, domain, emailV.email);
      });
    },
    // 查看 转发是否超出限额, 并且计数
    // 如果不是流量包不足, 可以让发送邮件的帮她购买流量包...o^|^o...
    // 当然,顺便发送一封邮件到用户的转发目的地里...o^|^o...该交钱了,娃
    function (domain, address, done) {
      // 还没设计, 先让他可以转发...

      var q = {
        user: domain.user,
        expireAt: {
          $gte: m().subtract(1, "days") // 往后延一天
        }
      }

      feePlan.find(q).sort({expireAt: 1}).exec(function (err, plans) {
        if (err) {
          done(err);
        }
        for (plan in plans) {
          if (plan.availCount == -1 || plan.usedCount < plan.availCount) {
            plan.usedCount += 1;
            done(null, domain, address);
            break;
          }
        }
        done(new Error("没有可用计划"))
      });
    }
  ], function (err, domain, address) {
    cb(err, address);
  });
}
