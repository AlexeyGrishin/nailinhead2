(function(){var a,b,c={}.hasOwnProperty,d=function(a,b){return function(){return a.apply(b,arguments)}},e=[].slice,f=function(a,b){function d(){this.constructor=a}for(var e in b)c.call(b,e)&&(a[e]=b[e]);return d.prototype=b.prototype,a.prototype=new d,a.__super__=b.prototype,a};b=angular.module("Parse",[]),a={},b.factory("persist",["$q","$window",function(a,b){var d,e;return e=b.localStorage,d={get:function(a){var b,c,d,f;for(angular.isArray(a)||(a=[a]),c={},d=0,f=a.length;f>d;d++)b=a[d],c[b]=e.key(b)?e.getItem(b):void 0;return c},set:function(a){var b,d;for(b in a)c.call(a,b)&&(d=a[b],e.setItem(b,d));return!0},remove:function(a){var b,c,d;for(angular.isArray(a)||(a=[a]),c=0,d=a.length;d>c;c++)b=a[c],localStorage.removeItem(b);return!0}}}]),b.factory("ParseUtils",["$http","$window",function(b,c){var d;return d={BaseUrl:"https://api.parse.com/1",_request:function(d,e,f,g){var h,i,j,k;return angular.isArray(e)?(j=e[0],i=e[1],e=""+j.pathBase()+"/"+i):e.className?e=""+e.pathBase():e.objectId&&(null!=(k=e.constructor)?k.className:void 0)&&(e=""+e.constructor.pathBase()+"/"+e.objectId),h={"X-Parse-Application-Id":a.applicationId,"X-Parse-REST-API-KEY":a.apiKey,"Content-Type":"application/json"},c.localStorage.key("PARSE_SESSION_TOKEN")&&(h["X-Parse-Session-Token"]=c.localStorage.getItem("PARSE_SESSION_TOKEN")),b({method:d,url:this.BaseUrl+e,data:f,params:g,headers:h})},func:function(a){return function(b){return d.callFunction(a,b)}},callFunction:function(a,b){return d._request("POST","/functions/"+a,b).then(function(a){return a.data.result})}}}]),b.factory("ParseAuth",["persist","ParseUser","ParseUtils","$q",function(a,b,c,d){var e;return e={sessionToken:null,currentUser:null,_login:function(b){var c;return e.currentUser=b,e.sessionToken=b.sessionToken,c=b.attributes(),c.objectId=b.objectId,a.set({PARSE_USER_INFO:JSON.stringify(c),PARSE_SESSION_TOKEN:b.sessionToken}),b},resumeSession:function(){var c,f,g,h,i,j;if(g=a.get(["PARSE_SESSION_TOKEN","PARSE_USER_INFO"]),j=g.PARSE_USER_INFO,h=g.PARSE_SESSION_TOKEN,c=d.defer(),j&&h)try{i=new b(JSON.parse(j)),e.currentUser=i,e.sessionToken=h,c.resolve(i.refresh())}catch(k){f=k,c.reject("User attributes not parseable")}else c.reject("User attributes or Session Token not found");return c.promise},register:function(a,c){return new b({username:a,password:c}).save().then(function(a){return e._login(a)})},login:function(a,d){return c._request("GET","/login",null,{username:a,password:d}).then(function(a){return e._login(new b(a.data))})},logout:function(){return a.remove(["PARSE_SESSION_TOKEN","PARSE_USER_INFO"]),e.currentUser=null,e.sessionToken=null}}}]),b.factory("ParseModel",["ParseUtils",function(a){var b;return b=function(){function b(a){this.isDirty=d(this.isDirty,this),this._saveCache=d(this._saveCache,this),this.safeUpdateParse=d(this.safeUpdateParse,this),this.encodeParse=d(this.encodeParse,this),this.attributes=d(this.attributes,this),this.destroy=d(this.destroy,this),this.update=d(this.update,this),this.create=d(this.create,this),this.refresh=d(this.refresh,this),this.save=d(this.save,this),this.isNew=d(this.isNew,this);var b,c;for(b in a)c=a[b],this[b]=c;this.isNew()||this._saveCache()}return b.pathBase=function(){return"/classes/"+this.className},b.find=function(b,c){var d=this;return a._request("GET","/classes/"+this.className+"/"+b,null,c).then(function(a){return new d(a.data)})},b.query=function(b){var c=this;return a._request("GET",this,null,b).then(function(a){var b,d,e,f,g;for(f=a.data.results,g=[],d=0,e=f.length;e>d;d++)b=f[d],g.push(new c(b));return g})},b.configure=function(){var a,b;return b=arguments[0],a=2<=arguments.length?e.call(arguments,1):[],this.className=b,this.attributes=a},b.prototype.isNew=function(){return!this.objectId},b.prototype.save=function(){return this.isNew()?this.create():this.update()},b.prototype.refresh=function(){var b=this;return a._request("GET",this).then(function(a){var d,e,f;f=a.data;for(d in f)c.call(f,d)&&(e=f[d],b[d]=e);return b})},b.prototype.create=function(){var b=this;return a._request("POST",this.constructor,this.encodeParse()).then(function(a){var c;return b.objectId=a.data.objectId,b.createdAt=a.data.createdAt,(c=a.data.sessionToken)&&(b.sessionToken=c),b._saveCache(),b})},b.prototype.update=function(){var b=this;return a._request("PUT",this,this.safeUpdateParse()).then(function(a){return b.updatedAt=a.data.updatedAt,b._saveCache(),b})},b.prototype.destroy=function(){var b=this;return a._request("DELETE",this).then(function(){return b.objectId=null,b})},b.prototype.attributes=function(){var a,b,c,d,e;for(b={},e=this.constructor.attributes,c=0,d=e.length;d>c;c++)a=e[c],b[a]=this[a];return b},b.prototype.encodeParse=function(){var a,b,c,d,e,f,g;for(c={},f=this.constructor.attributes,d=0,e=f.length;e>d;d++)a=f[d],a in this&&(b=this[a],null!=b&&b.objectId&&(null!=(g=b.constructor)?g.className:void 0)&&(b={__type:"Pointer",className:b.constructor.className,objectId:b.objectId}),c[a]=b);return c},b.prototype.safeUpdateParse=function(){var a,b,c,d,e;c=this.encodeParse();for(b in c)d=c[b],"number"==typeof d&&void 0!==(null!=(e=this._cache)?e[b]:void 0)&&(a=d-this._cache[b],0!==a?c[b]={__op:"Increment",amount:a}:delete c[b]);return c},b.prototype._saveCache=function(){return this._cache=angular.copy(this.encodeParse())},b.prototype.isDirty=function(){return!angular.equals(this._cache,this.encodeParse())},b}()}]),b.factory("ParseDefaultUser",["ParseModel",function(a){var b,c;return b=function(a){function b(){return c=b.__super__.constructor.apply(this,arguments)}return f(b,a),b.configure("users","username","password"),b.pathBase=function(){return"/users"},b.prototype.save=function(){return b.__super__.save.call(this).then(function(a){return delete a.password,a})},b}(a)}]),b.factory("ParseUser",["ParseDefaultUser","ParseCustomUser",function(a,b){return null!=b&&new b instanceof a?b:a}]),b.provider("Parse",function(){return{initialize:function(b,c){return a.apiKey=c,a.applicationId=b},$get:["ParseModel","ParseUser","ParseAuth","ParseUtils",function(a,b,c,d){return{BaseUrl:d.BaseUrl,Model:a,User:b,auth:c}}]}}),angular.module("Parse").factory("ParseCustomUser",["ParseDefaultUser",function(a){return a}])}).call(this),function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){(function(){b.exports=function(a){var b;return a.directive("readOnly",function(){return function(a,b,c){return a.$watch(c.readOnly,function(a){var c,d;return d=b.find("input"),c=b.find("button"),a?(d.attr("readonly","readonly"),c.attr("disabled","disabled")):(d.removeAttr("readonly"),c.removeAttr("disabled"))})}}),b={newModification:null},a.controller("BudgetsCtrl",["$scope","TasksService","$routeParams","$location",function(a,c,d,e){var f,g,h,i,j;return j=function(a){return{id:a.objectId,name:a.name,remaining:a.remaining,amount:0}},g=function(d){var e;return null==d&&(d=!1),null===b.newModification||d?b.newModification={reason:"Причина пополнения",total:0,budgets:a.budgets.filter(function(){return function(a){return!a.removed}}(this)).map(j),update:function(){return this.total=this.budgets.reduce(function(a,b){return a+parseInt(b.amount)},0)},validate:function(){var a,b,d,e,f,g,h,i;for(h=this.budgets,d=0,f=h.length;f>d;d++)a=h[d],a.amount=parseInt(a.amount);for(this.update(),b=c.prepareModification({reason:this.reason,total:this.total,date:new Date,budgets:{}}),i=this.budgets,e=0,g=i.length;g>e;e++)a=i[e],b.budgets[a.id]=[a.remaining,a.amount];return b}}:(e=b.newModification.budgets,b.newModification.budgets=a.budgets.filter(function(){return function(a){return!a.removed}}(this)).map(j),b.newModification.budgets.forEach(function(a){var b,c;return a.amount=null!=(b=null!=(c=e.filter(function(b){return b.id===a.id})[0])?c.amount:void 0)?b:0})),a.newModification=b.newModification},i=function(b){var c;return c=a.modifications.filter(function(){return function(a){return a.objectId===b}}(this))[0],c?{reason:c.reason,total:c.total,update:function(){},budgets:a.budgets.map(j).filter(function(){return function(a){return c.budgets[a.id]}}(this)).map(function(){return function(a){return a.remaining=c.budgets[a.id][0],a.amount=c.budgets[a.id][1],a}}(this))}:void e.url("/budgets/new")},f=function(){return a.budgets=c.user.budgets,g(),"new"===d.modification?(a.currentModification=a.newModification,a.readonly=!1):(a.currentModification=i(d.modification),a.readonly=!0)},h=function(){return a.loading.user?void 0:(a.modifications=c.modifications,0===a.modifications.length?c.loadModifications().then(f):f())},a.$on("nih.loaded.user",h),a.$watch("currentModification.budgets",function(){var b;return null!=(b=a.currentModification)?b.update():void 0},!0),a.addBudget=function(){var b;return(b=prompt("Название бюджета"))?c.addBudget(b).then(function(b){return a.newModification.budgets.push(j(b))}):void 0},a.removeBudget=function(a){return a.deleted=!0,c.removeBudget(a.id)},a.makeModification=function(){return c.modifyBudgets(a.currentModification.validate()),a.currentModification=g(!0)},h()}])}}).call(this)},{}],2:[function(a){(function(){var b,c,d,e;c=a("./tasks/model"),d=a("./model/storage"),b=a("./model/parse_storage"),e=angular.module("nailinhead2",["ngRoute","Parse"]).config(["$routeProvider",function(a){return a.when("/",{redirectTo:"/tasks"}).when("/login",{controller:"LoginCtrl",templateUrl:"partial/login.html"}).when("/tasks",{controller:"TasksCtrl",templateUrl:"partial/tasks.html"}).when("/tasks/:budget",{controller:"TasksCtrl",templateUrl:"partial/tasks.html"}).when("/budgets/",{redirectTo:"/budgets/new"}).when("/budgets/:modification",{controller:"BudgetsCtrl",templateUrl:"partial/budgets.html"}).when("/reports/",{controller:"ReportsCtrl",templateUrl:"partial/reports.html"})}]),a("./model/parse_storage")(e),a("./tasks/controller")(e),a("./budgets/controller")(e),a("./reports/controller")(e),a("./tools/ui")(e),angular.module("nailinhead2").service("TasksService",["$q","ParseStorage",function(a,b){var d,e;return d=function(){return a.defer()},e=new c(b,d)}]),angular.module("nailinhead2").filter("notRemoved",function(){return function(a){return a.filter(function(){return function(a){return!a.removed}}(this))}}),angular.module("nailinhead2").controller("MainCtrl",["$scope","TasksService","ParseStorage","$location",function(a,b,c,d){var e;return a.loading={user:!0,tasks:!0},a.login={loading:!0,error:null,username:null,password:null,loggedIn:!1},e=function(){return a.login.loggedIn=!0,a.login.loading=!0,b.loadUser().then(function(){return a.login.loading=!1,a.user=b.user,a.loading.user=!1,a.$broadcast("nih.loaded.user")})},c.checkLoggedIn().then(e,function(){return d.url("/login")}),a.logout=function(){return c.logout(),a.login.loggedIn=!1,d.url("/login")},a.$on("nih.loggedIn",function(){return e(),d.url("/tasks")})}]),angular.module("nailinhead2").controller("LoginCtrl",["$scope","TasksService","ParseStorage",function(a,b,c){return a.doLogin=function(){return c.login(a.login.username,a.login.password).then(function(){return a.$emit("nih.loggedIn"),a.login.error=null},function(b){return a.login.error=b.data.error})}}]),angular.module("nailinhead2").directive("nihNavigation",["$location",function(a){return{link:function(b,c,d){var e,f;return f=d.href||d.nihNavigation,e=function(){return c.toggleClass("selected",a.absUrl().indexOf(f)>-1)},b.$on("$locationChangeSuccess",e),e(),c.on("click",function(){return b.$apply(function(){return a.url(f.substring(1))})})}}}])}).call(this)},{"./budgets/controller":1,"./model/parse_storage":3,"./model/storage":4,"./reports/controller":5,"./tasks/controller":6,"./tasks/model":7,"./tools/ui":10}],3:[function(a,c){(function(){var d,e={}.hasOwnProperty,f=function(a,b){function c(){this.constructor=a}for(var d in b)e.call(b,d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a};d=a("../tools/datings"),c.exports=function(a){return a.config(["ParseProvider",function(a){return a.initialize("N2s46MO6asmNYF8eUHa7xK1otlwO03YOt21ul49Z","uVAJvH7f0i2XpAtuoBVlYobT504MmRlL2GLLxZzS")}]),a.service("ParseStorage",["Parse","$q",function(a,c){var e,g,h,i,j,k,l,m,n;return g=function(a){function b(){return b.__super__.constructor.apply(this,arguments)}return f(b,a),b.configure("Budget","name","projects","remaining","ACL","removed","ownerid"),b}(a.Model),i=function(a){function b(){return b.__super__.constructor.apply(this,arguments)}return f(b,a),b.configure("Task","title","cost1","cost","amount","ACL","ownerid","budgetid","completed","completedAt","completedDate","projects"),b}(a.Model),h=function(a){function b(){return b.__super__.constructor.apply(this,arguments)}return f(b,a),b.configure("Modification","reason","total","budgets","ACL","ownerid","date","month"),b}(a.Model),k=function(a,b){return a.objectId?k(a.constructor.className,a.objectId):{__type:"Pointer",className:a,objectId:b}},m=function(){return a.auth.currentUser.objectId},l=function(){return a.auth.currentUser},n=function(){return k("_User",m())},j=function(a){return{__type:"Date",iso:a.toISOString()}},e=function(){var a;return a={},a[m()]={read:!0,write:!0},a},{checkLoggedIn:function(){return a.auth.resumeSession()},login:function(b,c){return a.auth.login(b,c)},logout:function(){return a.auth.logout()},loadUser:function(){var b;return b=c.defer(),g.query({where:{ownerid:n()}}).then(function(c){return b.resolve({username:a.auth.currentUser.username,budgets:c})}),b.promise},addBudget:function(a){return a.save()},removeBudget:function(a){return a.removed=!0,b.save()},changeBudget:function(a,b){var c,d;for(c in b)d=b[c],a[c]=d;return a.save()},prepareTaskIn:function(a,b){return new i({title:"Новая покупка",cost1:1e3,amount:1,projects:[a.name],budgetid:b,ownerid:n(),ACL:e(),completed:!1})},prepareBudget:function(a){return new g({name:a.name,projects:[a.name],remaining:a.remaining,removed:!1,ownerid:n(),ACL:e()})},addTask:function(a,b){return b.budgetid=k("Budget",a),b.save()},removeTask:function(a){return a.destroy()},completeTask:function(a){var b;return a.completed=!0,b=new Date,a.completedDate=j(b),a.completedAt=d.toOrdinal(b),a.save()},changeTask:function(a,b){var c,d;for(c in b)d=b[c],a[c]=d;return a.save()},moveToBudget:function(a,b){return a.budgetid=k("Budget",b),a.save()},moveToMonth:function(a,b){return a.completedDate=j(d.fromOrdinal(b)),a.completedAt=d.toOrdinal(b),a.save()},prepareModification:function(a){return new h(a)},storeModification:function(a,b){return b=b||new Date,a.ACL=e(),a.ownerid=n(),a.date=j(b),a.month=d.toOrdinal(b),a.save()},uncompleteTask:function(a){return a.completed=!1,a.save()},loadTasks:function(a,b){return i.query({where:{$or:[{ownerid:n(),budgetid:k(a),completed:!0,completedAt:b},{ownerid:n(),budgetid:k(a),completed:!1}]}})},loadModifications:function(){return h.query({where:{ownerid:n()}})},loadCompletedTasksBetween:function(a,b){return i.query({where:{ownerid:n(),completed:!0,completedAt:{$gte:a,$lte:b}}})},modifyBudgetRemaining:function(a){return a.save()}}}])}}).call(this)},{"../tools/datings":9}],4:[function(a,b){(function(){var c,d,e;d=a("../tools/datings"),e={user:{username:"test",budget:function(a){return this.budgets.filter(function(b){return b.objectId===parseInt(a)})[0]},budgetId:5,taskId:5,modId:2,task:function(a){var b,c,d,e,f,g,h,i;for(h=this.budgets,d=0,f=h.length;f>d;d++)for(b=h[d],i=b.tasks,e=0,g=i.length;g>e;e++)if(c=i[e],c.objectId+""==a+"")return c},tasks:function(){var a,b,c,d,e;for(b=[],e=this.budgets,c=0,d=e.length;d>c;c++)a=e[c],b=b.concat(a.tasks);return b},budgets:[{objectId:1,name:"Еда",remaining:15e3,projects:["Еда","Химия"],tasks:[{objectId:1,budgetid:1,title:"Фрукты, овощи, мясо на пельмени, мука",cost1:1500,amount:1,cost:1500,projects:["Еда"],completed:!0,completedAt:d.toOrdinal(new Date)},{objectId:2,budgetid:1,title:"для нг",cost1:2500,amount:1,cost:2500,projects:["Еда"],completed:!0,completedAt:d.toOrdinal(new Date)-1},{objectId:3,budgetid:1,title:"для нг 2",cost1:2500,amount:1,cost:2500,projects:["Еда"],completed:!0,completedAt:d.toOrdinal(new Date)-1},{objectId:4,budgetid:1,title:"средство для стирки",cost1:1e3,amount:1,cost:1e3,projects:["Химия"],completed:!1}]},{objectId:2,name:"Лехе",remaining:5e3,projects:["Лехе"],tasks:[]},{objectId:3,name:"Лиде",remaining:15e3,projects:["Лиде"],tasks:[]},{objectId:4,name:"Банк",remaining:95e3,projects:["Ребенок","Участок","Квартира","Машина"],tasks:[]}],modifications:[{objectId:1,reason:"ЗП декабрь 2014",date:new Date(2014,11,16),month:d.toOrdinal(new Date(2014,11,16)),total:7e4,budgets:{1:[0,2e4],2:[0,5e3],3:[0,15e3],4:[0,3e4]}}]}},c=function(){function a(a){this.defer=a}return a.prototype.promise=function(a){var b;return b=this.defer(),b.resolve(a),b.promise},a.prototype.loadUser=function(){return this.promise(e.user)},a.prototype.loadTasks=function(a,b){return this.promise(e.user.budget(a.objectId).tasks.filter(function(){return function(a){return!a.completed||a.completedAt===b}}(this)))},a.prototype.addBudget=function(a){var b,c,d;b={};for(c in a)d=a[c],b[c]=d;return b.objectId=e.user.budgetId++,b.tasks=[],e.user.budgets.push(b),this.promise(b)},a.prototype.removeBudget=function(a){return e.user.budget(a.objectId).deleted=!0,this.promise(!0)},a.prototype.changeBudget=function(a,b){return e.user.budget(a.objectId).projects=b,this.promise(!0)},a.prototype.addTask=function(a,b){var c,d,f;d={};for(c in b)f=b[c],d[c]=f;return d.objectId=e.user.taskId++,d.budgetid=a,e.user.budget(a).tasks.push(d),this.promise(d)},a.prototype.removeTask=function(a){return e.user.budget(a.budgetid).tasks=e.user.budget(a.budgetid).tasks.filter(function(){return function(b){return b.objectId!==a.objectId}}(this)),this.promise(!0)},a.prototype.completeTask=function(a,b){return a=e.user.task(a.objectId),a.completed=!0,a.completedAt=d.toOrdinal(b||new Date),this.promise(a)},a.prototype.modifyBudgetRemaining=function(a,b){return e.user.budget(a.objectId).remaining+=b,this.promise(e.user.budget(a.objectId))},a.prototype.uncompleteTask=function(a){return a=e.user.task(a.objectId),a.completed=!1,a.completedAt=null,this.promise(a)},a.prototype.changeTask=function(a,b){var c,d;a=e.user.task(a.objectId);for(c in b)d=b[c],a[c]=d;return this.promise(a)},a.prototype.moveToBudget=function(a,b){var c;return a=e.user.task(a.objectId),c=a.objectId,this.removeTask(a),this.addTask(b,a),a.objectId=c,this.promise(a)},a.prototype.moveToMonth=function(a,b){return a=e.user.task(a.objectId),a.completedAt=d.toOrdinal(b||new Date),this.promise(a)},a.prototype.prepareModification=function(a){return a},a.prototype.storeModification=function(a){return a=angular.copy(a),a.objectId=e.user.modId++,a.date=a.date||new Date,a.month=d.toOrdinal(a.date),e.user.modifications.push(a),this.promise(a)},a.prototype.prepareTaskIn=function(a,b){return{title:"Новая покупка",cost1:1e3,amount:1,projects:[a.name],budgetid:b.objectId,completed:!1}},a.prototype.prepareBudget=function(a){return a},a.prototype.loadModifications=function(){return this.promise(e.user.modifications.map(function(){return function(a){return angular.copy(a)}}(this)))},a.prototype.loadCompletedTasksBetween=function(a,b){return this.promise(e.user.tasks().filter(function(){return function(c){return c.completed&&c.completedAt>=a&&c.completedAt<=b}}(this)))},a}(),b.exports=c}).call(this)},{"../tools/datings":9}],5:[function(a,b){(function(){var c;c=a("../tools/datings"),b.exports=function(a){return a.controller("ReportsCtrl",["$scope","$routeParams","$location","TasksService",function(a,b,d,e){return a.loading.report=!0,e.getReport(new Date,2).then(function(b){return a.loading.report=!1,a.report=b,a.report.months=a.report.months.map(c.monthFormat),a.report.projects=a.report.projects.sort(function(a,b){return a.project.localeCompare(b.project)})})}])}}).call(this)},{"../tools/datings":9}],6:[function(a,b){(function(){var c;c=a("../tools/datings"),b.exports=function(a){var b;return b=function(){return new Date},a.directive("nihTaskEditor",["$timeout",function(a){return{restrict:"E",template:'<div class=\'task-editor\'>\n  <button class="icon icon-before-task remove" ng-click="remove({task:task})" title="Удалить">\n    <img src="img/minus.svg"/>\n  </button>\n  <form>\n  <div class=\'title\'>\n    <input ng-model="task.title" name="title" ng-class="{error: error.title}">\n  </div>\n\n  <div class=\'cost-inputs\'>\n    <input ng-model="task.cost1" name="cost1" ng-class="{error: error.cost1}">\n    &times;\n    <input ng-model="task.amount" name="amount" ng-class="{error: error.amount}">\n  </div>\n  <div class="buttons">\n    <button class="icon" ng-click="doSave(task)" ng-disabled="error">\n      <img src="img/check.svg"/>\n    </button>\n    <button class="icon" ng-click="cancel({task:task})">\n      <img src="img/cross.svg"/>\n    </button>\n  </div>\n  </form>\n</div>',scope:{task:"=",save:"&onSave",cancel:"&onCancel",remove:"&onRemove",focusField:"@"},link:function(b,c,d){var e,f;return e=function(a){var d;for(d=a.target;d!==document;){if(d===c[0])return;d=d.parentNode}return b.cancel()},angular.element(document).on("mousedown",e),b.$on("$destroy",function(){return angular.element(document).off("mousedown",e)}),c.on("keydown",function(a){return 27===a.keyCode?b.$apply(function(){return b.cancel()}):void 0}),b.$parent.$watch(d.ngIf,function(){return a(function(){var a;return a=c[0].querySelector("input[name="+(b.focusField||"title")+"]"),a.focus(),a.select()})}),b.error=null,f=function(){var a,c,d;return b.error={},c=!1,""===b.task.title.trim()&&(b.error.title=c=!0),d=parseInt(b.task.cost1),isNaN(d)&&(b.error.cost1=c=!0),a=parseInt(b.task.amount),(isNaN(a)||1>a)&&(b.error.amount=c=!0),c?void 0:b.error=null},b.$watch("task",f,!0),b.doSave=function(){return b.task.cost1=parseInt(b.task.cost1),b.task.amount=parseInt(b.task.amount),b.save({task:b.task})}}}}]),a.controller("TasksCtrl",["$scope","$routeParams","$location","TasksService",function(a,b,d,e){var f;return a.budgets=[],f=function(){return a.loading.user?void 0:(a.budgets=e.user.budgets,0===a.budgets.length?d.url("/budgets/new"):b.budget?(a.loading.tasks=!0,a.currentMonth=parseInt(b.date)||c.nowOrdinal(),a.months=c.monthsAround(c.nowOrdinal(),1).map(function(){return function(a){return{month:a,title:c.monthFormat(a)}}}(this)),e.setBudget(b.budget,a.currentMonth).then(function(){return a.loading.tasks=!1,a.tasks=e.tasks,a.projects=e.projects})):d.url("/tasks/"+a.budgets[0].objectId))},a.$on("nih.loaded.user",f),a.selectDate=function(a){return d.search("date",a)},a.addTask=function(b){return a.editedTask=e.prepareTaskIn(b)},a.editTask=function(b,c){return a.originalTask=b,a.editedTask=angular.copy(b),a.editFocusField=c||"title"},a.resetEdit=function(){return a.editedTask=null},a.isNewTaskForProject=function(a,b){return a&&void 0===a.objectId&&-1!==a.projects.indexOf(b.name)},a.isEditedTask=function(b){return a.editedTask&&a.editedTask.objectId===b.objectId},a.removeTask=function(b){return e.removeTask(b),a.resetEdit()},a.enoughToBuy=function(a){return e.canBuy(a)},a.changeDate=function(a,b){return e.moveToMonth(a,b)},a.saveTask=function(b,c){return b.objectId?(e.changeTask(a.originalTask,b),a.resetEdit()):(e.addTask(b,c),a.addTask(c))},a.cancelTaskEdit=function(){return a.resetEdit()},a.prompt=function(a){return prompt(a)},a.addProject=function(a){return e.addProject(a)},a.deleteProject=function(a){return e.deleteProject(a)},a.moveTaskToProject=function(a,b){return e.changeTask(b,{projects:[a.name]})},a.moveTask=function(a,b){return e.moveToBudget(b,a.objectId)},a.toggle=function(a){return a.completed?e.uncompleteTask(a):e.completeTask(a)},f()}])}}).call(this)},{"../tools/datings":9}],7:[function(a,b){(function(){var c,d,e,f,g,h,i,j=[].slice;i=a("../tools/array"),g=i.removeById,f=i.findById,h=i.set,d=i.addIfNone,e=a("../tools/datings"),c=function(){function a(a,b){this.storage=a,this.defer=b}return a.prototype.promise=function(a){var b;return b=this.defer(),b.resolve(a),b.promise},a.prototype.checkLogin=function(){return this.promise(!0)},a.prototype.login=function(){return this.promise(!0)},a.prototype.logout=function(){return this.promise(!0)},a.prototype.loadUser=function(){return this.storage.loadUser().then(function(a){return function(b){return a.user=b}}(this))},a.prototype.getBudget=function(a){return f(this.user.budgets,a)},a.prototype.getTask=function(a){return f(this.tasks,a)},a.prototype.setBudget=function(a,b){return this.loadTasks(this.getBudget(a),b)},a.prototype.loadTasks=function(a,b){var c;return this.currentBudget=a,this.currentMonth=b,this.projects=[],this.tasks=[],(c=this._getcache(this.currentBudget,this.currentMonth))?(this.tasks=c,this._rearrangeByProjects(),this.promise(this.tasks)):this.storage.loadTasks(this.currentBudget,this.currentMonth).then(function(a){return function(b){return a.tasks=b,a._savecache(a.currentBudget,a.currentMonth,b),a._rearrangeByProjects()}}(this))},a.prototype._savecache=function(a,b,c){var d,e;return null==(d=this.cachedTasks)[e=a.objectId]&&(d[e]={}),this.cachedTasks[a.objectId][b]=c,c},a.prototype._getcache=function(a,b){var c;return null!=(c=this.cachedTasks[a.objectId])?c[b]:void 0},a.prototype._clearcache=function(a){return delete this.cachedTasks[a.objectId]},a.prototype.prepareTaskIn=function(a){return this.storage.prepareTaskIn(a,this.currentBudget)},a.prototype.canBuy=function(a){return this.getTask(a.objectId).cost<=this.currentBudget.remaining},a.prototype._rearrangeByProjects=function(){var a,b,c,d;return a=h(),this.tasks.forEach(function(b){return b.projects.forEach(function(b){return a.push(b)})}),this.currentBudget.projects.forEach(function(b){return a.push(b)}),c=this,b=a.map(function(a){return function(b){return{name:b,tasks:a.tasks.filter(function(a){return-1!==a.projects.indexOf(b)}),isEmpty:function(){return 0===this.tasks.length},canDelete:function(){return this.isEmpty()&&c.currentBudget.name!==b}}}}(this)),(d=this.projects).splice.apply(d,[0,this.projects.length].concat(j.call(b)))},a.prototype.deleteProject=function(a){if(!a.canDelete())throw"Cannot delete non-empty project";return this._modifyBudgetProjects(this.currentBudget,null,a.name),this._rearrangeByProjects()},a.prototype.addProject=function(a){return this._modifyBudgetProjects(this.currentBudget,a),this._rearrangeByProjects()},a.prototype.addBudget=function(a){var b;return b=this.storage.prepareBudget({name:a,remaining:0,projects:[a]}),this.user.budgets.push(b),this.storage.addBudget(b)},a.prototype.removeBudget=function(a){return this.getBudget(a).removed=!0,this.storage.removeBudget(this.getBudget(a))},a.prototype._validateTask=function(a,b){var c;return a=a||{},c=a.objectId,b.cost1&&(b.cost=b.cost1*b.amount),angular.extend(a,b),a.objectId=c,a.projects||(a.projects=[]),a},a.prototype.addTask=function(a,b){return a.projects=[b.name],a=this._validateTask(a,a),this.tasks.push(a),this._rearrangeByProjects(),this.storage.addTask(this.currentBudget.objectId,a)},a.prototype.removeTask=function(a){return g(this.tasks,a),this._rearrangeByProjects(),this.storage.removeTask(a)},a.prototype.completeTask=function(a){return a.completed=!0,this.storage.completeTask(a),this._modifyBudgetRemaining(this.currentBudget,-a.cost)},a.prototype._modifyBudgetRemaining=function(a,b){return a.remaining+=b,this.storage.modifyBudgetRemaining(a,b)},a.prototype.uncompleteTask=function(a){return a.completed=!1,this._modifyBudgetRemaining(this.currentBudget,+a.cost),this.storage.uncompleteTask(a)},a.prototype.changeTask=function(a,b){var c;return a=this.getTask(a.objectId),c=a.cost,a=this._validateTask(a,b),a.completed&&a.cost!==c&&this._modifyBudgetRemaining(this.currentBudget,c-a.cost),this.storage.changeTask(a,b),this._rearrangeByProjects()},a.prototype._modifyBudgetProjects=function(a,b,c){var e;return b&&d(a.projects,b),c&&(e=a.projects.indexOf(c),e>-1&&a.projects.splice(e,1)),this.storage.changeBudget(a,{projects:a.projects})},a.prototype.moveToBudget=function(a,b){var c;return g(this.tasks,a),this._rearrangeByProjects(),a.completed&&this._modifyBudgetRemaining(this.currentBudget,+a.cost),this.storage.moveToBudget(a,b),c=this.getBudget(b),this._modifyBudgetProjects(c,a.projects[0]),a.completed&&this._modifyBudgetRemaining(c,-a.cost),this._clearcache(c)},a.prototype.moveToMonth=function(a,b){return g(this.tasks,a),this._rearrangeByProjects(),this.storage.moveToMonth(a,b),this._clearcache(this.currentBudget)},a.prototype.prepareModification=function(a){return this.storage.prepareModification(a)},a.prototype.modifyBudgets=function(a){var b,c,d,e;e=a.budgets;for(d in e)b=e[d],c=this.getBudget(d),this._modifyBudgetRemaining(c,b[1]);return this.modifications.push(a),this.storage.storeModification(a)},a.prototype.loadModifications=function(){return this.storage.loadModifications().then(function(a){return function(b){return angular.copy(b,a.modifications)}}(this))},a.prototype.getReport=function(a,b){var c,d,f,g;return d=e.toOrdinal(a),c=d-b,f=this.defer(),g=function(){return function(a,b){return null==b&&(b=function(a){return a}),a.reduce(function(a,c){return a+b(c)},0)}}(this),this.storage.loadCompletedTasksBetween(c,d).then(function(a){return function(b){return a.loadModifications().then(function(){var i,j,k,l,m,n,o,p,q,r,s;for(l=function(){s=[];for(var a=c;d>=c?d>=a:a>=d;d>=c?a++:a--)s.push(a);return s}.apply(this),m={months:l.map(e.fromOrdinal),projects:h(b.map(function(a){return a.projects[0]})).map(function(a){return{project:a,permonth:[]}}),modifications:l.map(function(b){return a.modifications.filter(function(a){return a.month===b}).map(function(a){return{title:a.reason,cost:a.total}})})},i=n=0,p=l.length;p>n;i=++n)for(j=l[i],r=m.projects,o=0,q=r.length;q>o;o++)k=r[o],k.permonth[i]=b.filter(function(a){return a.projects[0]===k.project&&a.completedAt===j}),k.permonth[i].cost=g(k.permonth[i],function(a){return a.cost});return m.modifications.cost=g(m.modifications,function(a){return a.cost}),f.resolve(m)})}}(this)),f.promise},a.prototype.user={budgets:[]},a.prototype.currentBudget={},a.prototype.currentMonth=new Date,a.prototype.tasks=[],a.prototype.projects=[],a.prototype.modifications=[],a.prototype.cachedTasks={},a}(),b.exports=c}).call(this)},{"../tools/array":8,"../tools/datings":9}],8:[function(a,b){(function(){var a,c,d,e,f=[].slice;a=function(){function a(a){null==a&&(a=[]),this.array=[],a.forEach(function(a){return function(b){return a.push(b)}}(this))}return a.prototype.push=function(a){return-1===this.array.indexOf(a)?this.array.push(a):void 0},a.prototype.map=function(){var a,b;return a=1<=arguments.length?f.call(arguments,0):[],(b=this.array).map.apply(b,a)},a.prototype.slice=function(){return this.array.slice()},a}(),e=function(a,b,c){var e;return null==c&&(c="id"),e=d(a,b[c],c),e&&-1!==a.indexOf(e)?a.splice(a.indexOf(e),1):void 0},d=function(a,b,c){return null==c&&(c="objectId"),a.filter(function(a){return a[c]===b})[0]},c=function(a,b){return-1===a.indexOf(b)?a.push(b):void 0},b.exports={removeById:e,findById:d,addIfNone:c,set:function(b){return new a(b)}}}).call(this)},{}],9:[function(a,b){(function(){var a,c;a=2010,c="январь, февраль, март, апрель, май, июнь, июль, август, сентябрь, октябрь, ноябрь, декабрь".split(","),b.exports={nowOrdinal:function(){return b.exports.toOrdinal(new Date)},toOrdinal:function(b){return"number"==typeof b?b:12*(b.getFullYear()-a)+b.getMonth()},fromOrdinal:function(b){var c,d;return void 0===b?void 0:b.getFullYear?b:(c=b%12,d=a+Math.floor(b/12),new Date(d,c,1))},monthFormat:function(a){return"number"==typeof a&&(a=b.exports.fromOrdinal(a)),""+c[a.getMonth()]+" "+a.getFullYear()+" "},monthsAround:function(a,c){var d,e,f,g;return e=a+c,f=b.exports.nowOrdinal(),e>f&&(e=f),d=e-2*c-1,function(){g=[];for(var a=d;e>=d?e>=a:a>=e;e>=d?a++:a--)g.push(a);
return g}.apply(this)}}}).call(this)},{}],10:[function(a,b){(function(){var a,c=[].slice;a=function(b,c){var d;return d=b+"",d.length<c?a("0"+d,c):d},b.exports=function(b){var d;return d=null,b.directive("nihDragTask",function(){return function(a,b,c){return b.attr("draggable","true"),b.on("dragstart",function(b){var e;return e=a.$eval(c.nihDragTask),d=e,b.dataTransfer.setData("task",e.objectId),a.$root.$broadcast("nih.task.dragstart")}),b.on("dragend",function(){return d=null,a.$root.$broadcast("nih.task.dragend")})}}),b.directive("nihDropTask",["$timeout",function(a){return function(b,e,f){var g,h,i,j;return g=0,h=function(){return e.hasClass("selected")||b.$eval(f.nihDropUnless,{task:d})},j=function(a){return function(){var b;return b=1<=arguments.length?c.call(arguments,0):[],h()?void 0:a.apply(null,b)}},b.$on("nih.task.dragstart",j(function(){return g=0,e.addClass("candrop")})),b.$on("nih.task.dragend",j(function(){return e.removeClass("candrop readytodrop")})),i=function(a){return void 0!==a.dataTransfer.getData("task")},e.on("dragenter",j(function(a){return g++,i(a)&&e.addClass("readytodrop"),a.stopPropagation()})),e.on("dragleave",j(function(b){return g--,i(b)&&a(function(){return 1>=g?(e.removeClass("readytodrop"),g=0):void 0},10),b.stopPropagation()})),e.on("dragover",j(function(a){return i(a)?a.preventDefault():void 0})),e.on("drop",j(function(a){return e.removeClass("candrop readytodrop"),i(a)?b.$apply(function(){return b.$eval(f.nihDropTask,{task:d})}):void 0}))}}]),b.directive("nihCost",function(){return{template:"<span><strong>{{high}}</strong><em>{{low}}</em></span>",scope:!0,link:function(b,c,d){return b.$watch(d.nihCost,function(c){return b.high=Math.floor(c/1e3),b.low=a(c%1e3,3)})}}}),b.directive("nihBonds",function(){return{replace:!0,template:'<div class="bonds">\n</div>',link:function(a,b,c){return a.$watch(c.nihBonds,function(c){var d,e,f,g;a.b50=[],a.b5=[],a.b1=[],b.empty(),f={bond50:5e4,bond5:5e3,bond1:1e3},g=[];for(d in f)e=f[d],g.push(function(){var a;for(a=[];c>=e;)b.prepend("<span class='"+d+"'></span>"),a.push(c-=e);return a}());return g})}}}),b.directive("countdown",["$timeout",function(a){return function(b,c,d){var e,f,g,h,i;return h=null,g=null,i=0,e=!1,f=function(a){return c.is("input")?c.val(a):c.html(formatCost(a,"&nbsp;")+"")},c.on("focus",function(){return e=!0}).on("blur",function(){return e=!1}),b.$watch(d.countdown,function(j){var k,l,m;if(clearTimeout(h),!e){for(g=parseInt(j),isNaN(g)&&(g=0),c.addClass("start-counting"),l=null!=(m=b.$eval(d.step))?m:1;Math.abs(g-i)/l>MAX_STEPS;)l=2*l;return(k=function(){return e&&(i=g),g===i?(c.removeClass("start-counting"),void f(g)):(g>i?(i+=l,i>g&&(i=g)):(i-=l,g>i&&(i=g)),f(i),h=a(k,10))})()}})}}])}}).call(this)},{}]},{},[1,2,3,4,5,6,7,8,9,10]);