<template>
	<div id="taskList" class="bg-wrap">
		<!--header-->
		<div class="header-title mui-text-center">
			<span>练习列表</span>
			<a class="iconfont icon-tuichu3" @click="goOut"></a>
		</div>
		<!--tip-->
		<!--<div class="tip">
			<span>Tip：</span>
			<span class="circle"></span>
			<span>带有小圆点表示已经完成的练习！</span>
		</div>-->
		<!--列表-->
		<div class="mui-scroll-wrapper">
			<div id="taskScroll" class="mui-scroll">
				<div class="wrap">
					<ul class="mui-table-view mui-table-view-striped mui-table-view-condensed">
				        <li class="mui-table-view-cell" v-for="item in taskList">
				            <a @tap="goHref(item.SubjectId, item.Id)" class="mui-navigate-right">
				            	<h4 class="mui-ellipsis" v-text="item.Name"></h4>
				            </a>
				        </li>
				    </ul>
				</div>
					
			</div>
		</div>		
				
		<!--loading-->
		<loading v-show="loadShow"></loading>		
	</div>
</template>

<script>
import store from '@/vuex/store'
import loading from '../loading/loading.vue'
export default {
  	name: 'taskList',
  	store,
  	data: function(){
      	return {
      		taskList: [],
      		pSize: 20,
			page: 1,
			self: null,
			loadShow: true
      	}
   	},
   	components: {
	  	loading: loading
	},
   	watch: {
   		$route(to, from) {
			if(store.state.userInfo && from.name == 'login'){
				this.taskList= [];
				this.page= 1;
	   			this.pullRefresh();
			}
			if(from.name == 'taskDetail' && store.state.onsubmit){
				store.commit('changeSubmitType', false);
				this.taskList= [];
				this.page= 1;
				this.pullRefresh();
			}
		}
	},
	created: function(){
		
	},
   	activated: function(){
   		
   	},
   	mounted: function() {
   		this.taskList = [];
   		var deceleration = mui.os.ios?0.003:0.0009;
		mui('.mui-scroll-wrapper').scroll({bounce: false, deceleration:deceleration});
		this.pullRefresh();
   	},
   	methods: {
   		pullRefresh: function(){
   			var _this = this;
   			
			if(_this.self){
   				_this.self.refresh(true);//重置上拉加载
   			}
			if(!store.state.userInfo){
				mui.alert('登录过期,请重新登录！',function(){
					_this.$router.push({path: '/login'});
				});
			}
   			mui.ready(function() {
				mui('#taskScroll').pullToRefresh({
					down: {
						callback: function() {
							var self = this;
							//刷新先清空页数和数据
							_this.page = 1;
							_this.taskList = [];
							var options = {
								StudentId: store.state.userInfo.UserId,
								StudentTaskState: 0,
								Pagesize: _this.pSize,
								Pagination: 1,
								OrderBy: 'WriteTime DESC'
							}
							self.refresh(true);//重置上拉加载	
							_this.getData(options, self, 0);
						}
					},
					up: {
						auto: true,
						callback: function() {
							var self = this;
							var options = {
								StudentId: store.state.userInfo.UserId,
								StudentTaskState: 0,
								Pagesize: _this.pSize,
								Pagination: _this.page,
								OrderBy: 'WriteTime DESC'
							}
							_this.self = self;
							//data表示参数，index表示第一个选项卡， self表示当前dom节点，1 表示上拉加载
							_this.getData(options, self, 1);
						}
					}
				})
			})
   		},
   		getData: function(data, self, type){
			var _this = this;
			_this.loadShow = true;
			_this.$http.post("http://syapp.keys-edu.com/api/StudentTask/GetTaskList", data).then(function(res){
				console.log(res.body);
				_this.taskList.push.apply(_this.taskList, res.body);
				_this.page ++ ;
				
				var noMore = res.body.length < _this.pSize ? true : false;
				//复位下拉 或者上拉状态
				//type 说明： 0 表示下拉刷新 1 表示上啦加载
   				if(type === 0){
   					self.endPullDownToRefresh();//关闭下拉刷新
   					if(noMore){
   						self.endPullUpToRefresh(noMore);
   					}else{
   						self.refresh(true);//重置上拉加载
   					}
   				}else if(type === 1){
					self.endPullUpToRefresh(noMore);//根据返回数据判断是否还有后续数据来控制加载状态
   				}
   				_this.loadShow = false;
			}, function(err){
				_this.loadShow = false;
				console.log(err);
			})
		},
   		goOut: function(){
			var _this = this;
			var btnArray = ['否', '是'];
			mui.confirm('您确认要退出吗？', '启思教育', btnArray, function(e) {
				if(e.index == 1) {
					_this.$router.push({path: '/login'});
				}
			})
		},
		goHref: function(SubjectId,studentTaskId){
			this.$router.push({path: '/taskDetail', query: {SubjectId: SubjectId, studentTaskId: studentTaskId}});
		}
   	}
}
</script>
<style lang="scss">
#taskList{
	.mui-table-view.mui-table-view-chevron{
		margin-top: 10px;
		.mui-table-view-cell{
			padding: 11px 15px;
			> a:not(.mui-btn){
				margin: -11px -15px;
			}
		}
	}
	&.main .mui-scroll-wrapper{
		top: 64px;
	}
	.mui-scroll-wrapper{
		top: 44px;
		bottom: 1.3rem;
	}
		
	.mui-table-view-cell{
		padding: .3rem .4rem;
		font-size: .36rem;
		.iconfont{
			color: #4aad6a;
			margin-right: .15rem;
		}
		>a:not(.mui-btn){
			margin: -.3rem -.4rem;
		}
		.mui-navigate-right{
			.mui-pull-right{
				padding-right: .5rem;
				color: #999;
			}
		}
		.mui-navigate-right:after, .mui-push-right:after{
			right: .3rem;
		}
		h4{
			font-size: .36rem;
			line-height: 1.8;
		}
	}
	.mui-table-view-cell:after{
		background-color: #ddd;
	}
	.mui-table-view:after,.mui-table-view:before{
		display: none;
	}
	.submit-btn-wrap{
		margin-top: 1rem;
		margin-bottom: 1rem;
	    width: 100%;
	    text-align: center;
	}
	.picker-btn {
	    border-radius: .1rem;
	    background: #4aad6a;
	    border: none;
	    color: #FFFFFF;
	    font-weight: bold;
	    width: 50%;
	    line-height: 1rem;
	    height: 1rem;
	}
	.submit-btn-wrap .picker-btn-block{
		width: 90%;
	}
	.checkBox{
		padding-left: .6rem;
	}
	.tip{
		padding: .2rem .4rem;
	}
	.circle{
		display: inline-block;
	    width: .2rem;
	    height: .2rem;
	    background: #f52f2f;
	    border-radius: 50%;
	    margin-right: .15rem;
	}
}

</style>