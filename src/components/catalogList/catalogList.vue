<template>
	<div id="catalogList" class="bg-wrap">
		<!--header-->
		<div class="header-title mui-text-center">
			<span>成绩列表</span>
			<a class="iconfont icon-tuichu3" @click="goOut"></a>
		</div>
		<div class="mui-scroll-wrapper">
			<div id="catalog-scroll" class="mui-scroll">
				<div class="wrap">
					<ul class="mui-table-view mui-table-view-striped mui-table-view-condensed">
				        <li class="mui-table-view-cell" v-for="item in catalogList">
				            <!--<a @tap="goHref(item.SubjectId, item.Id)">-->
				            <a>
				            	<h4 class="mui-ellipsis" v-text="'名称：' + item.TaskName"></h4>
				            	<h4 class="mui-ellipsis">
				            		<span v-text="'总分：' + item.TotalScore"></span>&nbsp;&nbsp;
				            		<span v-text="'总分：' + item.StudentScore"></span>&nbsp;&nbsp;
				            		<span v-text="'得分率：' + (item.StudentScore * 100 / item.TotalScore).toFixed(2) + '%'"></span>
				            	</h4>
				            	<h4 class="mui-ellipsis">
				            		<span v-text="'用时：' + (item.StudentTime / 60).toFixed(2) + '  分钟'"></span>&nbsp;&nbsp;
				            		<span v-text="'词/分钟：' + (item.Words / (item.StudentTime / 60)).toFixed(2)"></span>
				            	</h4>
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
  	name: 'catalogList',
  	store,
  	data: function(){
      	return {
      		catalogList: [],
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
		
	},
   	activated: function(){
   		
   	},
   	created: function(){
   		
   	},
   	mounted: function() {
   		this.catalogList = [];
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
				mui('#catalog-scroll').pullToRefresh({
					down: {
						callback: function() {
							var self = this;
							//刷新先清空页数和数据
							_this.page = 1;
							_this.catalogList = [];
							var options = {
								StudentId: store.state.userInfo.UserId,
								Pagesize: _this.pSize,
								Pagination: 1,
					            OrderBy: 'CreatorTime DESC'
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
								Pagesize: _this.pSize,
								Pagination: _this.page,
					            OrderBy: 'CreatorTime DESC'
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
			_this.$http.post("http://syapp.keys-edu.com/api/StuStatistics/GetCatalogList", data).then(function(res){
				console.log(res.body);
				_this.catalogList.push.apply(_this.catalogList, res.body);
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
#catalogList{
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
		left: 0;
	}
}

</style>