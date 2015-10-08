
var emailVerify = require("./api_emailVerify");
var domains = require("./domains");
var domains_api = require("./api_domains");
var fee_plan = require("./fee_plan");
var blacklist = require("./blacklist");
var router = require("express").Router();
var Domain = require("../../models/Domain").Domain;
var EmailVerify = require("../../models/Domain").EmailVerify;
var userOwnerDomain = require("./middleware").userOwnerDomain;
var async = require("async");
var m = require('./middleware');

router.use(m.locals_domains);
// router.use(userOwnerDomain);
// 显示所有域名相关信息
router.get('/', domains.home);


// 添加新域名
router.get("/addNewDomain", domains.addNewDomain);
// 添加新域名 -- 提交表单,
router.post("/addNewDomain", domains.addNewDomain_post);
// 添加新域名 -- 步骤1, 告诉用户怎么设置
// 如果需要, 则发送邮件所有权验证邮件
router.get("/newDomainSetup", domains.newDomainSetup);
// 添加新域名 -- 完成
router.get("/newDomainSetup2", domains.newDomainSetup2);


// 编辑某域名
router.get("/edit", userOwnerDomain, domains.edit);


// 验证允许转发的邮件地址
router.get("/emailVerify", domains.emailVerify);
// 将某个域名的转发邮件修改为另一个邮件地址
router.post("/edit/forward_email", userOwnerDomain, domains.change_forward_email_post);

// 域名删除
router.get('/deleteDomain', userOwnerDomain, domains.deleteDomain);
router.post('/deleteDomain', userOwnerDomain, domains.deleteDomain_post);


// 为某域名添加黑名单
router.post("/edit/addBlackList", userOwnerDomain, blacklist.addBlackList_post);
// 修改黑名单回退信息
router.post("/edit/changeBlackItemReplyinfo", userOwnerDomain, blacklist.changeBlackItemReplyinfo_post);
// 删除某条黑名单
router.get("/edit/removeBlackItem", userOwnerDomain, blacklist.removeBlackItem);


// 获取,已用额度
router.get("/fee_plan/use", fee_plan.used);


exports.router = router;