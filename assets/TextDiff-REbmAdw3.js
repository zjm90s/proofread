import{d as V}from"./index-_Ysoi3hW.js";import{_ as y}from"./plugin-vueexport-helper-DlAUqK2U.js";import{r as T,a as x,c as g,b as e,w as t,d as r,o as k,e as v,f as b}from"./index-m5EY2iFm.js";const C={class:"text-diff"},H=["innerHTML"],A=["innerHTML"],L={__name:"TextDiff",setup(M){const s=T({text1:"",text2:""}),i=x(""),p=x(""),w=()=>{const d=s.text1.replaceAll(/(。|！|？|\.)/g,`$1
`),a=s.text2.replaceAll(/(。|！|？|\.)/g,`$1
`),c=V(d,a);let l="",o="";c.forEach(n=>{n.added?o=f(o,n.value,"#97f295"):n.removed?l=f(l,n.value,"#ffb6ba"):(l=f(l,n.value,"#fff"),o=f(o,n.value,"#fff"))}),l=l.replaceAll(`
`,"<br/>"),o=o.replaceAll(`
`,"<br/>"),i.value=l,p.value=o},f=(d,a,c)=>(d=d+'<span style="white-space: pre-wrap; word-spacing: 0.25em; border-radius: .2em; background-color: '+c+'">'+a+"</span>",d);return(d,a)=>{const c=r("el-input"),l=r("el-form-item"),o=r("el-button"),n=r("el-form"),_=r("el-col"),u=r("el-row"),h=r("el-text");return k(),g("div",C,[e(u,null,{default:t(()=>[e(_,null,{default:t(()=>[e(n,{model:s,"label-width":"auto"},{default:t(()=>[e(l,{label:"文本1"},{default:t(()=>[e(c,{modelValue:s.text1,"onUpdate:modelValue":a[0]||(a[0]=m=>s.text1=m),type:"textarea",rows:5},null,8,["modelValue"])]),_:1}),e(l,{label:"文本2"},{default:t(()=>[e(c,{modelValue:s.text2,"onUpdate:modelValue":a[1]||(a[1]=m=>s.text2=m),type:"textarea",rows:5},null,8,["modelValue"])]),_:1}),e(l,{style:{float:"right","margin-top":"5px"}},{default:t(()=>[e(o,{type:"primary",onClick:w,style:{width:"100px"}},{default:t(()=>[v("比对")]),_:1})]),_:1})]),_:1},8,["model"])]),_:1})]),_:1}),e(u,{class:"text-label"},{default:t(()=>[e(h,null,{default:t(()=>[v("比对结果：")]),_:1})]),_:1}),e(u,{class:"diff-result"},{default:t(()=>[e(_,{span:12},{default:t(()=>[b("div",{innerHTML:i.value},null,8,H)]),_:1}),e(_,{span:12},{default:t(()=>[b("div",{innerHTML:p.value},null,8,A)]),_:1})]),_:1})])}}},E=y(L,[["__scopeId","data-v-34383d3c"]]);export{E as default};
