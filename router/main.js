module.exports = function(app, connection)
{
	const DATE_FORMATER = require( 'dateformat' );
	// mysql 비동기식을 위한 콜백함수.
	function excuteQuery(query, callback){
		console.log(" -> query : " + query + "\n");
		connection.query(query, function(err, rows) {
			if(err) {
				console.log("err : " , err);
				callback(err);
			}
			else{
				callback(rows);
			}
		});
	}

	function insertActionLog(id, action){
		console.log("\nINSERT OF USER ACTION LOG. ID : " + id);
		var query = "INSERT INTO userlog(user_id, user_action) VALUES(" + id + ",'" + action + "');";
		excuteQuery(query, function result(result){
			console.log(" -> SUCCESS SAVE TO LOG.");
		});
	}

	app.get('/',function(req,res){
		res.render('index.html')
	});

	app.get('/isUser', function(req,res){ // #1000 회원가입 화면 아이디 중복체크 요청메소드
		var id = req.query.user_id;
		var query = "SELECT * FROM users WHERE user_id = '" + id + "';";
		console.log("\nrequest '/isUser' from client. request id : " + id);
		excuteQuery(query, function result(result){
			res.send(result);
		});
	});

	app.post('/signUp', function(req,res){ // #1001 회원가입 요청
		console.log("req.body : ", req.body);
		var id = "'" + req.body.user_id + "'";
		var name = "'" + req.body.user_name + "'";
		var email = req.body.user_email == '' ? null : "'" + req.body.user_email + "'";
		var phone = req.body.user_phone == '' ? null : "'" + req.body.user_phone + "'";
		var sex = "'" + req.body.user_sex + "'";
		var year = req.body.user_year == '' ? null : "'" + req.body.user_year + "'";
		console.log("\nrequest '/signUp' from client. request info : " + id + "(" + name + ")");
		var query = "INSERT INTO users(user_id, user_name, user_email, user_phone, user_sex, user_year) VALUES(" + id + "," + name + "," + email + "," + phone + "," + sex + "," + year +");";
		excuteQuery(query, function result(result){
			insertActionLog(id, "SIGNUP");
			res.send(result);
		});
	});

	app.get('/signIn', function(req,res){ // # 1002 로그인
		var id = "'" + req.query.user_id + "'";
		var name = "'" + req.query.user_name + "'";
		console.log("request '/signIn' from client. request info : " + id + "(" + name + ")");
		var query = "SELECT * FROM users WHERE user_id = " + id + " AND user_name = " + name +  ";";
		excuteQuery(query, function result(result){
			insertActionLog(id, "SIGNIN");
			res.send(result);
		});
	});

	app.post('/submitMission', function(req,res){ // #1003 미션 Submit
		/** @SEO 미션 갱신 혹 삽입과정
			* 1. 먼저 해당 유저가 이 미션을 클리어 한적이 있는지 검사.
			* 2. 있다면 -> INSERT 쿼리 실행
			* 2. 없다면 -> UPDATE 쿼리 실행
			* 개꿀팁 : ON DUPLICATE KEY UPDATE를 쓰면 쿼리를 두번 쓸필요가 없다. 조건 : 기본키 중복에러로 인해 발생하는 조건이므로, 기본키를 넣어줘야함
			**/

		var id = "'" + req.body.user_id + "'";
		var name = "'" + req.body.user_name + "'";
		var category = Number((req.body.mission).substring(0,2));
		var mission = Number((req.body.mission).substring(2,4));
		var clearLevel = req.body.clearLevel;
		var date = DATE_FORMATER(new Date(), "yyyy-mm-dd h:MM:ss");

		console.log("\nrequest '/submitMission' from client. request info : " + id + "(" + name + ") / mission : 0" + category + "0" + mission);
		var insertUpdate = "INSERT INTO missionlist(user_id, ms_category, ms_list, complete) VALUES(" + id + "," + category + "," + mission + "," + clearLevel + ") ON DUPLICATE KEY UPDATE complete = " + clearLevel + ", date ='" + date + "';";
		excuteQuery(insertUpdate, function(result){
			insertActionLog(id, "MISSION");
			res.send(result);
	 	});
	});

	app.get('/getUserMission', function(req,res){ // #1004 미션 조회
		var id = "'" + req.query.user_id + "'";
		var name = "'" + req.query.user_name + "'";
		console.log("request '/getUserMission' from client. request info : " + id + "(" + name + ")");
		var query = "SELECT * FROM missionlist WHERE missionlist.user_id = " + id + " ORDER BY date DESC LIMIT 10;";
		// var query = "SELECT * FROM missionlist WHERE missionlist.user_id = " + id;
		excuteQuery(query, function result(result){
			res.send(result);
		});
	});

	app.post('/logAction', function(req,res){ // #1005 사용자 활동로그 저장
		var action = req.body.user_action;
		var id = req.body.user_id;
		insertActionLog("'" + id + "'", action);
		res.send(true);
	});

	app.get('/getUserAction', function(req,res){ // #1005 사용자 활동로그 조회
		var name = req.query.user_name;
		var id = "'" + req.query.user_id + "'";
		var query = "SELECT date_format(date, '%Y-%m-%d') group_date, COUNT(*) as count FROM userlog WHERE date >= date_add(now(), interval -100 day) GROUP BY group_date  ORDER BY group_date DESC";
		// var query = "SELECT date_format(date, '%Y-%m-%d') group_date, COUNT(*) as count FROM userlog GROUP BY group_date";
		console.log("request '/getUserAction' from client. request info : " + id + "(" + name + ")");

		excuteQuery(query, function result(result){
			var query = "SELECT date_format(date, '%Y-%m-%d') group_date, COUNT(*) as count FROM userlog WHERE date >= date_add(now(), interval -100 day) GROUP BY group_date  ORDER BY group_date DESC";
			excuteQuery(query, function result(result){
				// console.log("result : " + result);
				res.send(result);
			});
			res.send(result);
		});
	});


}
