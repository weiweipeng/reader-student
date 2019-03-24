import Vue from 'vue'
import Router from 'vue-router'
//子页面
import login from '@/components/login/login'
import taskList from '@/components/taskList/taskList'
import taskDetail from '@/components/taskList/taskDetail'
import catalogList from '@/components/catalogList/catalogList'



Vue.use(Router)

export default new Router({
	'linkActiveClass': 'active',
  routes: [
  	{
	    path: '/',
	    redirect: 'login'
	  },
	  {
   		name: 'login',
  		path: '/login',
  		component: login
	  },
	  {
   		name: 'taskList',
  		path: '/taskList',
  		component: taskList
	  },
	  {
   		name: 'taskDetail',
  		path: '/taskDetail',
  		component: taskDetail
	  },
	  {
   		name: 'catalogList',
  		path: '/catalogList',
  		component: catalogList
	  }
  ]
})
