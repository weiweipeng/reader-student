<template>
	<div id="taskDetail" class="bg-wrap">
		<!--header-->
		<div class="header-title mui-text-center">
			<a class="mui-icon mui-icon-left-nav" @tap="goBack"></a>
			<span>练习详情</span>
		</div>
		<!--计时-->
		<div class="timer">
			<span class="mui-pull-left" v-if="detail.SubjectList" v-text="(subjectIndex + 1) + '/' + detail.SubjectList.length"></span>
			<span v-if="detail && detail.EndTime">请在规定时间完成练习：</span>
			<span id="span1" v-text="h"></span>:
			<span id="span2" v-text="m"></span>:
			<span id="span3" v-text="s"></span>
		</div>
		<div class="mui-scroll-wrapper">
			<div id="taskScroll" class="mui-scroll">
				<div id="ArticleContent"></div>
			</div>
		</div>
		<!--上下页-->
		<div class="bottom-flex">
			<a href="javascript:;" class="mui-btn s-btn-white" v-show="subjectArray.length !== 1 && subjectIndex != '0'" @click="loadSubject(-1)">上一篇</a>
			<a href="javascript:;" class="mui-btn s-btn-white" v-show="subjectArray.length !== 1 && (subjectIndex < subjectArray.length - 1)" @click="loadSubject(1)">下一篇</a>
			<a href="javascript:;" class="mui-btn mui-btn-blue s-btn-blue" id="bmButton" v-show="subjectIndex == subjectArray.length - 1" @click="Submit()">提交</a>
		</div>
		<!--loading-->
		<loading v-show="loadShow"></loading>
	</div>
</template>

<script>
import store from '@/vuex/store'
import loading from '../loading/loading.vue'
export default {
  	name: 'taskDetail',
  	store,
  	data: function(){
      	return {
      		detail: [],
      		optionDic: { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J', 10: 'K' },
      		isEndTime: true,
      		h: '00',
      		m: '00',
      		s: '00',
      		endTime: 0,
      		t: null,
      		stuSubQueList: [], //学生答案
      		subjectArray: [],//题目json
      		subjectIndex: {},//第几题
      		taskID: '',//当前练习编号
      		loadShow: true
      	}
   	},
   	components: {
	  	loading: loading
	},
   	activated: function(){
   		if(this.t){
   			this.loadShow = true;
   			mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0);
   			this.h = '00';
      		this.m = '00';
      		this.s = '00';
   			clearInterval(this.t);
   		}
   		this.init();
   		
   	},
   	mounted: function() {
   		var deceleration = mui.os.ios?0.003:0.0009;
		mui('.mui-scroll-wrapper').scroll({deceleration:deceleration});
   	},
   	methods: {
   		init: function(){
			var _this = this;
			_this.stuSubQueList = {};
            _this.subjectArray = {};
            _this.subjectIndex = 0;
            $('#ArticleContent').html('');
            //获取题目信息
            var options = {
				Id: _this.$route.query.SubjectId,
				SubjectName: _this.$route.query.studentTaskId
			}
			this.$http.post("http://syapp.keys-edu.com/api/Subject/GetStuTaskDetail", options).then(function(res){
				console.log(res.body);
				_this.detail = res.body;
				
				_this.taskID = _this.$route.query.studentTaskId;
	            _this.subjectArray = _this.detail.SubjectList;
	            //获取题目信息
	            _this.loadSubject(0);
	            //计时器
	            _this.endTime = 0;
	            if (_this.detail.EndTime != null) {
	                _this.isEndTime = true;
	                _this.endTime = _this.detail.EndTime * 60;
	                
	            } else {
	                _this.isEndTime = false;
	            }
	            _this.startTime();
			}, function(err){
				console.log(err);
			})
	            
		},
		loadSubject: function(num) {
			var _this = this;
			_this.loadShow = true;
            _this.subjectIndex += num;
            if (_this.subjectIndex > _this.subjectArray.length) {
                return false;
            }
            if (_this.subjectIndex < 0) {
                return false;
            }
			
            var stuSubQueListTemp = {};
            //读取学生当前答案
            $.each($("#form1").serializeArray(), function (i, v) {
                if (stuSubQueListTemp[v.name] != undefined) {
                    stuSubQueListTemp[v.name] += '|' + v.value.trim();
                } else {
                    stuSubQueListTemp[v.name] = v.value.trim();
                }
            });

            $.each(stuSubQueListTemp, function (index, value) {
                _this.stuSubQueList[index] = value;
            });
            //读取学生当前答案
            var subStr = _this.SubjectString(_this.subjectArray[_this.subjectIndex]);
            $('#ArticleContent').html(subStr);
            //翻页
//          SubjectNavBar();
            //翻页
            //还原学生答案
            //题目
            var questions = _this.subjectArray[_this.subjectIndex].SubjectItemList;
            $.each(questions, function (index, value) {
                var inputDom = $('.' + value.Id);
                if (value.Answer.indexOf('|') != -1) {
                    if (stuSubQueList[value.Id] != undefined) {
                        var itemAnsweArry = _this.stuSubQueList[value.Id].split('|');
                        $.each(inputDom, function (ind, val) {
                            val.value = itemAnsweArry[ind];
                        });
                    }
                } else {
                    $.each(inputDom, function (ind, val) {
                        if (val.type == "text") {
                            val.value = _this.stuSubQueList[value.Id] == undefined ? "" : _this.stuSubQueList[value.Id];
                        } else if (val.type == "radio") {
                            if (val.value == _this.stuSubQueList[value.Id]) {
                                val.checked = true;
                            }
                        }
                    });
                }
            });
            //写作技巧
            if (_this.subjectArray[_this.subjectIndex].WritingSkillId != "") {
                var WritingQuestions = _this.subjectArray[_this.subjectIndex].WritingSkillDetail.WritingSkillItemList;
                $.each(WritingQuestions, function (index, value) {
                    var inputDom = $('.' + value.Id);
                    if (value.WritingSkillItemAnswer.indexOf('|') != -1) {
                        if (_this.stuSubQueList[value.Id] != undefined) {
                            var itemAnsweArry = _this.stuSubQueList[value.Id].split('|');
                            $.each(inputDom, function (ind, val) {
                                val.value = itemAnsweArry[ind];
                            });
                        }
                    } else {
                        $.each(inputDom, function (ind, val) {
                            if (val.type == "text") {
                                val.value = _this.stuSubQueList[value.Id] == undefined ? "" : _this.stuSubQueList[value.Id];
                            } else if (val.type == "radio") {
                                if (val.value == _this.stuSubQueList[value.Id]) {
                                    val.checked = true;
                                }
                            } else if (val.type == "textarea") {
                                val.innerText = _this.stuSubQueList[value.Id] == undefined ? "" : _this.stuSubQueList[value.Id];
                            }
                        });
                    }
                });
            }
            if(num != '0'){
            	mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0);
            }
            
			_this.loadShow = false;
        },
		//篇章拼接
		SubjectString: function(subject) {
			var _this = this;
		    var str = '';
		    str += '<form id = "form1" autocomplete="off" style=" overflow:auto;padding:0 10px;" ><div id="' + subject.Id + '">';
		    str += '<p class="specialFontTitle" >话题：' + subject.Topic + '&nbsp|&nbsp文体：' + subject.LiteraryForm + '&nbsp|&nbsp';
		    str += '题型：' + subject.QuestionsType + '&nbsp|&nbsp难度：' + subject.Difficulty + '&nbsp|&nbsp;';
		    str += '词数：' + subject.Words + '&nbsp|&nbsp分数：' + subject.Fraction + '</p>';
		    str += '<h3 style="margin-top: 20px;">' + subject.SubjectName + '</h3><br/>';
		    //str += '<p class="specialFont" >文章导读：' + subject.WenZhangDaoDu + '</p><br/>';
		    //str += '<p class="specialFont" >词语指津：' + subject.CiYuZhiJin + '</p><br/>';
		    switch (subject.QuestionsType) {
		        case '阅读判断':
		            str += subject.Title + '<hr>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                str += '<div id="' + val.Id + '" class="Readingjudgment"> ';
		                str += '<p>' + val.Sort + ' . ' + val.Title + '</p>';
		                str += '<div class="fr mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="F" />×</div>';
		                str += '<div class="fr mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="T" />√</div></div>';
		            });
		            break;
		        case '图片选择':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var queArray = val.Title.split('@');
		                str += val.Sort + '. ' + queArray[0] + '<br/>';
		                for (var i = 1; i < queArray.length; i++) {
		                    str += '<div class="question mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="' + _this.optionDic[i - 1] + '" /><span> ' + _this.optionDic[i - 1] + '. </span>';
		                    str += queArray[i] + '</div>';
		                }
		                str += '<br/>';
		            });
		            break;
		        case '阅读选择':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var queArray = val.Title.split('@');
		                str += val.Sort + '. ' + queArray[0] + '<br/>';
		                for (var i = 1; i < queArray.length; i++) {
		                    str += '<div class="question mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="' + _this.optionDic[i - 1] + '" /><span> ' + _this.optionDic[i - 1] + '. </span>';
		                    str += queArray[i] + '</div><br/>';
		                }
		                str += '<br/>';
		            });
		            break;
		        case '完形填空':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var queArray = val.Title.split('@');
		                str += '<div id="' + val.Id + '" class="wanxingtiankognQue">' + val.Sort + '.<br/>';
		                for (var i = 0; i < queArray.length; i++) {
		                    str += '<div class="question mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="' + _this.optionDic[i] + '" /><span> ' + _this.optionDic[i] + '. </span>';
		                    str += queArray[i] + '</div>';
		                }
		                str += '</div>';
		            });
		            break;
		        case '语法词汇填空':
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content + '<hr/>';
		            break;
		        case '选词填空':
		            var xuanxiang = subject.WordSentence.split('|');
		            str += '<table class="import">';
		            str += '<tr>';
		            for (var i = 0; i < xuanxiang.length; i++) {
		                if ((i + 1) % 5 == 0 && i != 0) {
		                    str += '<td>' + xuanxiang[i] + '</td></tr><tr>';
		                } else {
		                    str += '<td>' + xuanxiang[i] + '</td>';
		                }
		            }
		            str += '</tr>';
		            str += ' </table>';
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText  ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content;
		            break;
		        case '表格填空':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var queArray = val.Title.split('@');
		                str += '<div id="' + val.Id + '" class="wanxingtiankognQue">' + val.Sort + '.&nbsp';
		                for (var i = 0; i < queArray.length; i++) {
		                    str += '<div class="question mui-radio" style=" display: inline-block;"><input type="radio" class="' + val.Id + '" name="' + val.Id + '" id="' + val.Id + '" value="' + _this.optionDic[i] + '" /><span> ' + _this.optionDic[i] + '. </span>';
		                    str += queArray[i] + '</div>';
		                }
		                str += '</div>';
		            });
		            break;
		        case '选句填空':
		            var xuanxiang = subject.WordSentence.split('|');
		            str += '<table class="import">';
		            for (var i = 0; i < xuanxiang.length; i++) {
		                str += '<tr><td>' + xuanxiang[i] + '</td></tr>';
		            }
		            str += ' </table>';
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content;
		            break;
		        case '段落标题匹配':
		            var xuanxiang = subject.WordSentence.split('|');
		            str += '<table class="import">';
		            for (var i = 0; i < xuanxiang.length; i++) {
		                str += '<tr><td>' + xuanxiang[i] + '</td></tr>';
		            }
		            str += ' </table>';
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content;
		            break;
		        case '阅读填空':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var answerStr = val.Answer;
		                answerStr = answerStr.indexOf('^') == -1 ? answerStr : answerStr.split('^')[0];
		                var answerArray = answerStr.indexOf('|') == -1 ? new Array(answerStr) : answerStr.split('|');
		                var content = val.Title;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                for (var i = 0; i < answerArray.length; i++) {
		                    var relIndex = i + 1;
		                    content = content.replace('{' + relIndex + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		                }
		                str += '<div id="' + val.Id + '" class="yuedutiankongQue">' + val.Sort + '. ' + content + '</div>';
		            });
		            break;
		        case '回答问题':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var answerStr = val.Answer;
		                answerStr = answerStr.indexOf('^') == -1 ? answerStr : answerStr.split('^')[0];
		                var answerArray = answerStr.indexOf('|') == -1 ? new Array(answerStr) : answerStr.split('|');
		                var content = val.Title;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                for (var i = 0; i < answerArray.length; i++) {
		                    var relIndex = i + 1;
		                    content = content.replace('{' + relIndex + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		                }
		                str += '<div id="' + val.Id + '" class="yuedutiankongQue">' + val.Sort + '. ' + content + '</div>';
		            });
		            break;
		        case '综合阅读':
		            str += subject.Title + '<hr/>';
		            $.each(subject.SubjectItemList, function (ind, val) {
		                var answerStr = val.Answer;
		                var answerArray = answerStr.indexOf('|') == -1 ? new Array(answerStr) : answerStr.split('|');
		                var content = val.Title;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                for (var i = 0; i < answerArray.length; i++) {
		                    var relIndex = i + 1;
		                    content = content.replace('{' + relIndex + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		                }
		                str += '<div id="' + val.Id + '" class="yuedutiankongQue">' + val.Sort + '. ' + content + '</div>';
		            });
		            break;
		        case '选词填空-所给词的适当形式填空':
		            str += '<p style="text-align:center" ><span style="border:1px solid;padding:5px">' + subject.WordSentence + '</span></p>';
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content;
		            break;
		        case '给首字母完形填空':
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content + '<hr/>';
		            break;
		        case '信息匹配':
		            var content = subject.Title;
		            $.each(subject.SubjectItemList, function (ind, val) {
		                content = content.replace('{' + val.Sort + '}', '<input type="text" class="inputText ' + val.Id + '" id="' + val.Id + '" name="' + val.Id + '">');
		            });
		            str += content + '<hr/>';
		            break;
		        default:;
		    }
		    str += '</div>';
		    if (subject.WritingSkillId != "") {
		        str += _this.WritingSkillString(subject.WritingSkillDetail);
		    }
		    str == '</form>';
		    return str;
		},
		WritingSkillString: function(WritingSkillDetail) {
			var _this= this;
		    var str = '<br/><p class="specialFont" >写作技巧：</p>';
		    str += '<div id="' + WritingSkillDetail.Id + '">';
		    switch (WritingSkillDetail.WritingSkillQuestionType) {
		        case '选择':
		            str += WritingSkillDetail.WritingSkillContent + '<hr/>';
		            $.each(WritingSkillDetail.WritingSkillItemList, function (index, value) {
		                var queArray = value.WritingSkillItemTitle.split('@');
		                str += value.Sort + '. ' + queArray[0] + '<br/>';
		                for (var i = 1; i < queArray.length; i++) {
		                    str += '<div class="question mui-radio" style=" display: inline-block;"><input type="radio" class="' + value.Id + '" name="' + value.Id + '" id="' + value.Id + '" value="' + _this.optionDic[i - 1] + '" /><span> ' + _this.optionDic[i - 1] + '. </span>';
		                    str += queArray[i] + '</div><br/>';
		                }
		                str += '<br/>';
		            });
		            break;
		        case '填空':
		            str += WritingSkillDetail.WritingSkillContent + '<br/>';
		            $.each(WritingSkillDetail.WritingSkillItemList, function (index, value) {
		                var content = value.WritingSkillItemTitle;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                var answerStr = value.WritingSkillItemAnswer;
		                answerStr = answerStr.indexOf('^') == -1 ? answerStr : answerStr.split('^')[0];
		                var answerArray = answerStr.indexOf('|') == -1 ? new Array(answerStr) : answerStr.split('|');
		
		                for (var i = 0; i < answerArray.length; i++) {
		                    var relIndex = i + 1;
		                    content = content.replace('{' + relIndex + '}', '<input type="text" class="inputText ' + value.Id + '" id="' + value.Id + '" name="' + value.Id + '">');
		                }
		                str += '<div id="' + value.Id + '" class="TiankongQue">' + value.Sort + '. ' + content + '</div><br/>';
		            });
		            break;
		        case '写句子':
		            str += WritingSkillDetail.WritingSkillContent;
		            $.each(WritingSkillDetail.WritingSkillItemList, function (index, value) {
		                var content = value.WritingSkillItemTitle;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                if (content.indexOf('{1}') != -1) {
		                    content = content.replace('{1}', '<textarea class="inputTextarea ' + value.Id + '" id="' + value.Id + '" name="' + value.Id + '"></textarea>');
		                    str += '<div id="' + value.Id + '" class="TiankongQue">' + value.Sort + '. ' + content + '<br/>';
		                } else {
		                    str += '<div id="' + value.Id + '" class="TiankongQue">' + value.Sort + '. ' + content + '<textarea class="inputTextarea ' + value.Id + '" id="' + value.Id + '" name="' + value.Id + '"></textarea>' + '<br/>';
		                }
		                str += '</div><br/>';
		            });
		            break;
		        case '写段落':
		            str += WritingSkillDetail.WritingSkillContent;
		            $.each(WritingSkillDetail.WritingSkillItemList, function (index, value) {
		                var content = value.WritingSkillItemTitle;
		                content = content.replace('<div>', '');
		                content = content.replace('</div>', '');
		                if (content.indexOf('{1}') != -1) {
		                    content = content.replace('{1}', '<textarea class="inputTextareaWriting ' + value.Id + '" id="' + value.Id + '" name="' + value.Id + '"></textarea>');
		                    str += '<div id="' + value.Id + '" class="TiankongQue">' + value.Sort + '. ' + content + '<br/>';
		                } else {
		                    str += '<div id="' + value.Id + '" class="TiankongQue">' + value.Sort + '. ' + content + '<textarea class="inputTextareaWriting ' + value.Id + '" id="' + value.Id + '" name="' + value.Id + '"></textarea>' + '<br/>';
		                }
		                str += '</div><br/>';
		            });
		            break;
		        default:;
		    }
		    str += '</div>';
		    return str;
		},
		//Timer
        startTime: function() {
        	var _this = this;
        	_this.t =setInterval(function(){
        		if (_this.isEndTime){
        			_this.endTime--;
        		}else{
        			_this.endTime++;
        		}
	            if (_this.endTime >= 3600) {
	                _this.h = _this.checkTime(Math.floor(_this.endTime / 3600));
	                var temp = _this.endTime % 3600;
	                _this.m = _this.checkTime(Math.floor(temp / 60));
	                _this.s = _this.checkTime(temp % 60);
	            } else if (_this.endTime < 3600 && _this.endTime >= 60) {
	                _this.h = _this.checkTime(0);
	                var temp = _this.endTime % 60;
	                _this.m = _this.checkTime(Math.floor(_this.endTime / 60));
	                _this.s = _this.checkTime(temp);
	            } else {
	                _this.h = _this.checkTime(0);
	                _this.m = _this.checkTime(0);
	                _this.s = _this.checkTime(_this.endTime);
	            }
	            if (_this.endTime === 0) {
	                _this.Submit();
	            }
	        },1000)
	            
            
        },
        //提交练习
        Submit: function() {
        	var _this = this;
        	_this.loadShow = true;
            var stuSubQueListTemp = {};
            clearInterval(_this.t);
            $.each($("#form1").serializeArray(), function (i, v) {
                if (stuSubQueListTemp[v.name] != undefined) {
                    stuSubQueListTemp[v.name] += '|' + v.value.trim();
                } else {
                    stuSubQueListTemp[v.name] = v.value.trim();
                }
            });
            $.each(stuSubQueListTemp, function (index, value) {
                _this.stuSubQueList[index] = value;
            });
            var rh = Number($('#span1').html());
            var rm = Number($('#span2').html());
            var rs = Number($('#span3').html());
            rh *= 3600;
            rm *= 60;
            
            var stuUseTime = rs + rm + rh;
            if (_this.isEndTime) {
            	console.log(stuUseTime);
                stuUseTime = (_this.detail.EndTime * 60) - stuUseTime;
            }
            var option = {};
            option.Id = _this.taskID;
            option.StudentId = store.state.userInfo.userId;
            option.StudentName = store.state.userInfo.uerName;
            option.StudentTime = stuUseTime;
            option.StudnetAnswer = JSON.stringify(_this.stuSubQueList);
            
			this.$http.post("http://syapp.keys-edu.com/api/StudentTask/Submit", option).then(function(res){
				console.log(res.body);
				_this.loadShow = true;
				if (!isNaN(res.body) && res.body != -1) {
	                _this.subjectIndex = 1;
	                _this.stuSubQueList = {};
	                var alertStr = '练习得分：' + res.body;
	                mui.alert(alertStr, '启思教育',function(){
	                	$('#ArticleContent').html('');
	                	$('#sub').html('');
	                	store.commit('changeSubmitType', true);
	                	_this.$router.back(-1);
	                });
	            } else {
	                mui.alert('提交失败！', '启思教育');
	            }
			}, function(err){
				_this.loadShow = true;
				console.log(err);
			})
       	},
        //时间格式检查
        checkTime: function(i) {
            i = Number(i);
            if (i < 10)
            { i = "0" + i }
            return i
        },
   		goBack: function(){
			this.$router.back(-1);
		}
   	}
}
</script>
<style lang="scss">
#taskDetail{
	
	.mui-scroll-wrapper{
		top: 74px;
		bottom: 55px;
		background: rgba(255, 255, 255, 0.9);
	}
	.timer{
		height: 30px;
	    line-height: 30px;
	    font-size: 14px;
	    background: rgb(74, 173, 106);
	    padding: 0 15px;
	    text-align: right;
	    color: #fff;
	}
	&.main .mui-scroll-wrapper{
		top: 64px;
	}
	#ArticleContent{
		font-size: 14px;
	}
	.statistics-wrap{
		padding: 10px;
	}
	.statistics-wrap span{
		background-color: rgb(163, 191, 30);
	    border-radius: 4px;
	    display: inline-block;
	    padding: 8px 0;
	    color: #fff;
	    width: 30.5%;
	    margin: .0 1% 10px;
	    font-size: 10px;
	    line-height: 1;
	    text-align: center;
	}
	.noBodyDone{
		padding: .5rem 0;
	    text-align: center;
	    font-size: .5rem;
	    color: #9fa099;
	}
	/*table*/
	.table {
	    width: 100%;
	}
	.table th {
	    font-weight: 700;
	    position: relative;
	    opacity: .7;
	}
	.table td, .table th {
	    padding: .2rem;
	    vertical-align: top;
	    border-bottom: 1px solid rgba(0, 0, 0, .1);
	    text-align: center;
	}
	.table th:after {
	    position: absolute;
	    top: 0;
	    right: 0;
	    bottom: 0;
	    left: 0;
	    display: block;
	    content: ' ';
	    background: rgba(163, 191, 30, .3);
	}
	
	/*底部*/
	.bottom-flex{
		height: 55px;
	}
	.bottom-flex a.s-btn-white {
	    background-color: #fff;
	    color: #4aad6a;
	    border: 1px solid #4aad6a;
	}
	.bottom-flex a {
	    width: 28%;
	    margin: 9px 5px;
	    padding: 8px 15px;
	    -webit-border-radius: 50px;
	    border-radius: 50px;
	}
	.bottom-flex {
	    position: fixed;
	    left: 0;
	    right: 0;
	    bottom: 0;
	    z-index: 10;
	    background: #fff;
	    text-align: center;
	    -webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	.bottom-flex .s-btn-blue{
		background: #4aad6a;
	}
	.mui-checkbox input[type=checkbox]:checked:before, .mui-radio input[type=radio]:checked:before{
		color: #4aad6a;
	}
	.mui-checkbox input[type=checkbox], .mui-radio input[type=radio]{
		position: initial;
		vertical-align: sub;
	}
	.mui-radio{
		padding: 10px;
	}
	img{
		vertical-align: middle;
	}
	::-webkit-scrollbar-track-piece {
	  background-color: rgba(0, 0, 0, 0);
	  border-left: 1px solid rgba(0, 0, 0, 0);
	}
	::-webkit-scrollbar {
	  width: 5px;
	  height: 5px;
	  -webkit-border-radius: 5px;
	  -moz-border-radius: 5px;
	  border-radius: 5px;
	}
	::-webkit-scrollbar-thumb {
	  background-color: rgba(0, 0, 0, 0.2);
	  background-clip: padding-box;
	  -webkit-border-radius: 5px;
	  -moz-border-radius: 5px;
	  border-radius: 5px;
	  min-height: 5px;
	}
	::-webkit-scrollbar-thumb:hover {
	  background-color: rgba(0, 0, 0, 0.2);
	  -webkit-border-radius: 5px;
	  -moz-border-radius: 5px;
	  border-radius: 5px;
	}
	.specialFontTitle{
		font-family: fantasy;
	}
	.question{
		width: 100%;
	}
}

</style>