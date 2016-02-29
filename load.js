(function(global,doc){

	var loading=[];
	var modules={};
	var html=doc.documentElement;
	var head=doc.getElementsByTagName('head')[0];
	global.require=function(list,factory,moduleName){
		var name=moduleName||getModuleName();
		var module;
		var dn;
		var cn;
		modules[name]=module={
			id:name,
			state:"loading",
			deps:[],
			factory:factory,
			export:{}
		}
		for(var i=0;i<list.length;i++){
			dn++;
			var mn=list[i];
			var tempName=mn;
			if(mn.lastIndexOf("/")!=-1){
				tempName=mn.slice(mn.lastIndexOf("/")+1);
			}
			modules[name].deps.push(tempName);
			if(modules[mn]&&modules[mn].state=="loaded"){
				cn++;
			}
			if(!modules[mn]){
				createScript(mn);
			}
		}
		if(dn===cn){
			fireFactory(module,factory);
		}else{
			loading.unshift(module);
		}
		checkDeps();
	}

	function createScript(moduleName){

		var script=doc.createElement('script');
		script.src=moduleName+".js";
		script.onload=function(){
			checkDeps();
		}
		head.insertBefore(script,head.firstChild);
	}

	function fireFactory(module,factory){
		var deps=module.deps;
		module.state="loaded";
		var args=[];
		for(var i=0;i<deps.length;i++){
			args.push(modules[deps[i]].export);
		}
		var ret=factory.apply(null,args);
		module.export=ret;
	}

	function checkDeps(){
		for(var i=0;i<loading.length;i++){
			var module=loading[i];
			var deps=module.deps;
			var loaded=true;
			for(var j=0;j<deps.length;j++){
				var obj=modules[deps[j]];
				if(!obj||obj.state=="loading"){
					loaded=false;
					break;
				}
			}
			if(loaded&&module.state=="loading"){
				fireFactory(module,module.factory);
			}
		}
	}

	global.define=function(id,deps,factory){
		if(arguments.length<3){
			factory=deps;
			deps=id;
			id=getModuleName();
		}
		require(deps,factory,id);
	}

	function getModuleName(){

		var path=document.currentScript.src;
		var name=path.slice(path.lastIndexOf('/')+1).replace(".js","");
		return name;
	}

	function init(){
		var scripts=document.getElementsByTagName('script');
		var script;
		var len;
		var url;
		len=scripts.length;
		while(len--){
			script=scripts[len];
			if(url=script.getAttribute('data-main')){
				break;
			}
		}
		createScript(url);
	}

	init();
	global.define.amd={};

})(window,document)