import{l as I}from"./textLayer-CbzWQtk9.js";import{_ as U}from"./plugin-vueexport-helper-DlAUqK2U.js";import{a as d,c as j,b as o,w as r,u,g as z,h as q,d as p,o as C,e as m,f as E,t as G,i as k,E as B}from"./index-m5EY2iFm.js";const J={class:"ref-dup-check"},K=["innerHTML"],O={__name:"RefDupCheck",setup(Q){const b=d(),w=d();let y=null,_=d(1),c=d(0),g=d(1),h=d(1),V=d(""),D=d(0),P=d(0),x=d(!1);const N=l=>{let e=new FileReader;e.readAsArrayBuffer(l.raw),e.onload=()=>{w.value=e.result,_.value=1,c.value=0}},S=l=>{var e,a;(e=b.value)==null||e.clearFiles(),(a=b.value)==null||a.handleStart(l[0])},F=l=>{y=l,c.value=l.numPages},H=()=>{P.value=D.value.offsetHeight,x.value=!0,A().then(l=>{let e=l.join(`
`);V.value=R(e)}).catch(l=>{B.error(l.message)}).finally(()=>{x.value=!1})},R=l=>{l=M(l);let e=l.split(`
`),a={};e.forEach(t=>{let n=t.replaceAll(/^\[.*?\]/g,"");a[n]==null?a[n]=!1:a[n]==!1&&(a[n]=!0)});let s="";return e.forEach(t=>{let n=t.replaceAll(/^\[.*?\]/g,"");a[n]?s=T(s,t,"#ffb6ba"):s=T(s,t,"#fff"),s=s+"<br/>"}),s},A=()=>{if(g.value>h.value)throw new Error("开始页不能大于结束页");let l=[];for(let e=g.value;e<=h.value;e++)l.push(new Promise((a,s)=>{y.getPage(e).then(t=>{t.getTextContent().then(n=>{let f=L(n);a(f)})}).catch(t=>{B.error(t.message)})}));return Promise.all(l)},L=l=>{let e=0;for(let s=0;s<l.items.length;s++){let t=l.items[s],n=t.transform[4]+t.width;n>e&&(e=n)}let a="";for(let s=0;s<l.items.length;s++){let t=l.items[s];if(a=a+t.str,s<l.items.length-1){let n=l.items[s+1],f=t.transform[4]+t.width;t.transform[5]-n.transform[5]>t.height&&f<e-10&&(a=a+`
`)}}return a},M=l=>{let e="";for(let a=0;a<l.length;a++)switch(l[a]){case".":e+="。";break;case",":e+="，";break;case";":e+="；";break;case":":e+="：";break;case"!":e+="！";break;case"?":e+="？";break;default:e+=l[a]}return e},T=(l,e,a)=>(l=l+'<span style="white-space: pre-wrap; border-radius: .2em; background-color: '+a+'">'+e+"</span>",l);return(l,e)=>{const a=p("el-button"),s=p("el-upload"),t=p("el-col"),n=p("el-row"),f=p("el-text"),X=p("el-scrollbar"),v=p("el-input-number");return C(),j("div",J,[o(n,{class:"pdf-upload"},{default:r(()=>[o(t,null,{default:r(()=>[o(s,{ref_key:"pdfFile",ref:b,"auto-upload":!1,limit:1,"on-change":N,"on-exceed":S},{default:r(()=>[o(a,{type:"primary"},{default:r(()=>[m("上传文件")]),_:1})]),_:1},512)]),_:1})]),_:1}),o(n,{class:"text-label"},{default:r(()=>[o(t,{span:12},{default:r(()=>[o(f,{tag:"b"},{default:r(()=>[m("PDF原文：")]),_:1})]),_:1}),o(t,{span:12},{default:r(()=>[o(f,{tag:"b"},{default:r(()=>[m("检测结果：")]),_:1})]),_:1})]),_:1}),o(n,{class:"diff-pdf"},{default:r(()=>[o(t,{span:12},{default:r(()=>[E("div",{ref_key:"pdfDiv",ref:D},[o(u(I),{"text-layer":"",source:w.value,page:u(_),onLoaded:F},null,8,["source","page"])],512)]),_:1}),o(t,{span:12},{default:r(()=>[o(X,{height:u(P)},{default:r(()=>[E("div",{innerHTML:u(V)},null,8,K)]),_:1},8,["height"])]),_:1})]),_:1}),u(c)?(C(),z(n,{key:0,class:"diff-pdf-page"},{default:r(()=>[o(t,{span:12},{default:r(()=>[o(f,{class:"mx-1"},{default:r(()=>[m("共"+G(u(c))+"页 - 页码：",1)]),_:1}),o(v,{modelValue:u(_),"onUpdate:modelValue":e[0]||(e[0]=i=>k(_)?_.value=i:_=i),min:1,max:u(c),precision:0},null,8,["modelValue","max"])]),_:1}),o(t,{span:12},{default:r(()=>[o(f,{class:"mx-1"},{default:r(()=>[m("页码范围：")]),_:1}),o(v,{modelValue:u(g),"onUpdate:modelValue":e[1]||(e[1]=i=>k(g)?g.value=i:g=i),min:1,max:u(c),precision:0,controls:!1,style:{width:"75px"}},null,8,["modelValue","max"]),m(" ~ "),o(v,{modelValue:u(h),"onUpdate:modelValue":e[2]||(e[2]=i=>k(h)?h.value=i:h=i),min:1,max:u(c),precision:0,controls:!1,style:{width:"75px"}},null,8,["modelValue","max"]),o(a,{type:"primary",loading:u(x),disabled:u(x),onClick:H,style:{width:"100px","margin-left":"20px"}},{default:r(()=>[m("去重")]),_:1},8,["loading","disabled"])]),_:1})]),_:1})):q("",!0)])}}},$=U(O,[["__scopeId","data-v-9fa7ac18"]]);export{$ as default};
