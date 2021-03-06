var express = require('express')
var User = require('./models/user')
var md5 = require('blueimp-md5')
var router = express.Router()

router.get('/', function(req,res) {
	//console.log(req.session)
	res.render('index.html',{
		user:req.session.user
	})
})

router.get('/login', function(req,res) {
	res.render('login.html')
})

router.post('/login', function(req,res) {
	/*
	1.获取表单数据
	2.查询数据库用户没密码是否正确
	3.发送响应数据
	*/	
	var body = req.body
	User.findOne({
		email:body.email,
		password:md5(md5(body.password))
	},function(err,user) {
		if(err){
			return res.status(500).json({
				err_code:500,
				message:err.message
			})
		}

		if(!user){
			return res.status(200).json({
				err_code:1,
				message:'Email or password is invalid'
			})
		}

		//用户存在，登录成功，通过session记录登录状态
		req.session.user = user

		res.status(200).json({
			err_code:0,
			message:'OK'
		})
	})
})

router.get('/register', function(req,res) {
	res.render('register.html')
})

router.post('/register', function(req,res) {
	//res.render('index.html')
	//console.log(req.body)

	/*
		1.获取表单提交的数据
		2.操作数据库
			判断该用户是否存在
			如果已存在，不允许注册
			如果不存在，注册新建用户
		3.发送响应
	*/
	var body = req.body
	User.findOne({
		$or:[
		{
			email: body.email
		},
		{
			nickname: body.nickname
		}
		]
	},function(err,data) {
		if(err){
			return res.status(500).json({
				err_code: 500,
				message: 'Server Error'
			})
		}
		//如果邮箱已存在
		//	判断昵称

		if(data){
			//邮箱或者昵称已存在
			return res.status(200).json({
				err_code: 1,
				message: 'Email or nickname already exists'
			})

			/*return res.render('register.html', {
				err_message: '邮箱或密码已存在',
				form: body
			})*/
		}
		//Express提供一个响应方法：json
		//该方法接受一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
		
		//对密码进行md5重复加密
		body.password = md5(md5(body.password))

		new User(body).save(function(err,user) {
			if(err) {
				return res.status(500).json({
				err_code: 500,
				message: 'Server Error'
			})
		}

		//注册成功，使用session记录用户的登录状态
		req.session.user = user

			res.status(200).json({
				err_code: 0,
				message: 'Ok'
			})
		})
	})

})

router.get('/logout',function(req, res) {
	//清除登陆状态
	//重定向到登陆页
	req.session.user = null

	res.redirect('/login')
})

module.exports = router