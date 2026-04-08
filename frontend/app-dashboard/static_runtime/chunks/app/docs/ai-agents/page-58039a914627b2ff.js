(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1624],{7810:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]])},21628:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},33036:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>g});var a=s(95155),r=s(98500),i=s.n(r),n=s(12115),l=s(96035),o=s(49619);let d=(0,s(90425).A)("brain",[["path",{d:"M12 18V5",key:"adv99a"}],["path",{d:"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",key:"1e3is1"}],["path",{d:"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",key:"1gqd8o"}],["path",{d:"M17.997 5.125a4 4 0 0 1 2.526 5.77",key:"iwvgf7"}],["path",{d:"M18 18a4 4 0 0 0 2-7.464",key:"efp6ie"}],["path",{d:"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",key:"1gq6am"}],["path",{d:"M6 18a4 4 0 0 1-2-7.464",key:"k1g0md"}],["path",{d:"M6.003 5.125a4 4 0 0 0-2.526 5.77",key:"q97ue3"}]]);var c=s(92564),m=s(7810),p=s(44071),h=s(94514),x=s(67635),u=s(21628);function g(){let[e,t]=(0,n.useState)(null),[s,r]=(0,n.useState)("support"),g=(e,s)=>{navigator.clipboard.writeText(e),t(s),setTimeout(()=>t(null),2e3)},y={support:{name:"Customer Support",description:"Handle FAQs, troubleshooting, and general inquiries",prompt:`You are a helpful customer support agent for [Company Name].

Business Information:
- Hours: 10 AM - 7 PM IST, Monday to Saturday
- Return Policy: 7 days from delivery
- Website: www.example.com

Your Role:
- Answer common questions about products and services
- Help with order tracking and status updates
- Guide customers through troubleshooting steps
- Escalate complex issues to human agents

Rules:
- Be friendly, professional, and patient
- If unsure, admit it and offer to connect with a human
- Never make promises you can't keep
- Always confirm customer satisfaction before closing`},sales:{name:"Sales Assistant",description:"Qualify leads, recommend products, and close deals",prompt:`You are a sales assistant for [Company Name].

Product Categories:
- Category A: ₹999 - ₹4,999
- Category B: ₹5,000 - ₹19,999
- Category C: ₹20,000+

Your Goals:
- Understand customer needs through questions
- Recommend suitable products based on requirements
- Address objections and concerns
- Guide towards purchase or demo booking

Conversation Flow:
1. Greet and qualify (budget, timeline, requirements)
2. Present 2-3 relevant options
3. Handle questions and objections
4. Close with CTA (buy now, book demo, schedule call)`},lead:{name:"Lead Qualification",description:"Capture lead information and score prospects",prompt:`You are a lead qualification bot for [Company Name].

Qualification Criteria:
- Company Size: <10, 10-50, 50-200, 200+
- Budget: <1L, 1-5L, 5-20L, 20L+
- Timeline: Immediate, 1-3 months, 3-6 months, 6+ months
- Decision Maker: Yes/No

Data to Collect:
1. Full Name
2. Company Name
3. Email Address
4. Phone Number
5. Requirements

Scoring:
- Hot Lead: Budget >5L + Immediate timeline + Decision maker
- Warm Lead: Any 2 criteria met
- Cold Lead: Information collection only`}},f=`// Create an AI Agent via API
const response = await fetch('https://api.aimstore.in/v1/ai-agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ak_live_xxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Support Bot',
    type: 'support',
    isActive: true,
    systemPrompt: 'You are a helpful support agent...',
    handoffRules: {
      keywords: ['manager', 'complaint', 'refund'],
      confidenceThreshold: 0.6,
      maxFailedAttempts: 3
    },
    knowledgeBase: ['FAQ document', 'Product catalog']
  })
});

const agent = await response.json();
console.log('Agent created:', agent.id);`;return(0,a.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,a.jsx)("nav",{className:"bg-white border-b border-gray-200 sticky top-0 z-50",children:(0,a.jsxs)("div",{className:"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",children:[(0,a.jsxs)(i(),{href:"/docs",className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center",children:(0,a.jsx)(l.A,{className:"w-5 h-5 text-white"})}),(0,a.jsx)("span",{className:"text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",children:"Aimstors Solution"})]}),(0,a.jsx)(i(),{href:"/docs",className:"text-blue-600 hover:underline",children:"← Back to Docs"})]})}),(0,a.jsxs)("main",{className:"max-w-4xl mx-auto px-6 py-16",children:[(0,a.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,a.jsx)("div",{className:"p-3 bg-purple-100 text-purple-600 rounded-xl",children:(0,a.jsx)(o.A,{className:"w-6 h-6"})}),(0,a.jsx)("h1",{className:"text-4xl font-extrabold text-gray-900",children:"AI Agents"})]}),(0,a.jsx)("p",{className:"text-xl text-gray-600 mb-12",children:"Deploy intelligent AI chatbots powered by Google Gemini for 24/7 automated customer support."}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Overview"}),(0,a.jsx)("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[{icon:(0,a.jsx)(d,{className:"w-5 h-5"}),title:"Powered by Gemini",desc:"Advanced AI understanding"},{icon:(0,a.jsx)(c.A,{className:"w-5 h-5"}),title:"Natural Conversations",desc:"Human-like responses"},{icon:(0,a.jsx)(m.A,{className:"w-5 h-5"}),title:"Smart Handoff",desc:"Escalate when needed"},{icon:(0,a.jsx)(p.A,{className:"w-5 h-5"}),title:"Analytics",desc:"Track performance"}].map((e,t)=>(0,a.jsx)("div",{className:"bg-white rounded-xl p-4 border border-gray-200",children:(0,a.jsxs)("div",{className:"flex items-center gap-3",children:[(0,a.jsx)("div",{className:"p-2 bg-purple-100 text-purple-600 rounded-lg",children:e.icon}),(0,a.jsxs)("div",{children:[(0,a.jsx)("h4",{className:"font-semibold text-gray-900",children:e.title}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:e.desc})]})]})},t))})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Agent Types & Prompts"}),(0,a.jsxs)("div",{className:"bg-white rounded-2xl border border-gray-200 overflow-hidden",children:[(0,a.jsx)("div",{className:"flex border-b border-gray-200",children:["support","sales","lead"].map(e=>(0,a.jsx)("button",{onClick:()=>r(e),className:`flex-1 px-4 py-3 text-sm font-medium transition-colors ${s===e?"bg-purple-50 text-purple-700 border-b-2 border-purple-600":"text-gray-600 hover:bg-gray-50"}`,children:y[e].name},e))}),(0,a.jsxs)("div",{className:"p-6",children:[(0,a.jsx)("p",{className:"text-gray-600 mb-4",children:y[s].description}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"System Prompt Template"}),(0,a.jsx)("button",{onClick:()=>g(y[s].prompt,s),className:"flex items-center gap-1 text-gray-400 hover:text-white",children:e===s?(0,a.jsx)(h.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto whitespace-pre-wrap",children:(0,a.jsx)("code",{children:y[s].prompt})})]})]})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Human Handoff"}),(0,a.jsx)("p",{className:"text-gray-600 mb-4",children:"Configure when the agent should transfer conversations to human agents:"}),(0,a.jsx)("div",{className:"bg-white rounded-xl border border-gray-200 overflow-hidden",children:(0,a.jsxs)("table",{className:"w-full",children:[(0,a.jsx)("thead",{className:"bg-gray-50",children:(0,a.jsxs)("tr",{children:[(0,a.jsx)("th",{className:"px-4 py-3 text-left text-sm font-semibold text-gray-900",children:"Trigger"}),(0,a.jsx)("th",{className:"px-4 py-3 text-left text-sm font-semibold text-gray-900",children:"Description"})]})}),(0,a.jsx)("tbody",{className:"divide-y divide-gray-100",children:[{trigger:"Confidence < 60%",description:"AI is unsure about the response"},{trigger:"Keywords detected",description:'"speak to human", "manager", "complaint"'},{trigger:"3+ failed attempts",description:"Customer repeats same question"},{trigger:"Payment issues",description:"Refunds, payment failures"},{trigger:"Explicit request",description:"Customer asks for human support"}].map((e,t)=>(0,a.jsxs)("tr",{children:[(0,a.jsx)("td",{className:"px-4 py-3 text-sm font-medium text-gray-900",children:e.trigger}),(0,a.jsx)("td",{className:"px-4 py-3 text-sm text-gray-600",children:e.description})]},t))})]})})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"API Integration"}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"create-agent.js"}),(0,a.jsx)("button",{onClick:()=>g(f,"api-example"),className:"flex items-center gap-1 text-gray-400 hover:text-white",children:"api-example"===e?(0,a.jsx)(h.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:f})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Analytics & Metrics"}),(0,a.jsx)("div",{className:"grid grid-cols-2 gap-4",children:[{metric:"Total Conversations",desc:"Number of chats handled by the agent"},{metric:"Resolution Rate",desc:"Percentage resolved without human handoff"},{metric:"Avg Response Time",desc:"Time to first response (typically <2s)"},{metric:"Customer Satisfaction",desc:"Based on post-chat feedback"},{metric:"Handoff Rate",desc:"Percentage transferred to humans"},{metric:"Intent Recognition",desc:"Accuracy of understanding queries"}].map((e,t)=>(0,a.jsxs)("div",{className:"bg-white rounded-lg p-4 border border-gray-200",children:[(0,a.jsx)("p",{className:"font-semibold text-gray-900",children:e.metric}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:e.desc})]},t))})]}),(0,a.jsxs)("div",{className:"bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100",children:[(0,a.jsx)("h3",{className:"font-bold text-gray-900 mb-2",children:"Next Steps"}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-4",children:[(0,a.jsxs)(i(),{href:"/docs/api-reference",className:"text-blue-600 hover:underline flex items-center gap-1",children:["API Reference ",(0,a.jsx)(u.A,{className:"w-4 h-4"})]}),(0,a.jsxs)(i(),{href:"/docs/webhooks",className:"text-blue-600 hover:underline flex items-center gap-1",children:["Webhooks ",(0,a.jsx)(u.A,{className:"w-4 h-4"})]}),(0,a.jsxs)(i(),{href:"/ai-agents",className:"text-blue-600 hover:underline flex items-center gap-1",children:["Create Agent ",(0,a.jsx)(u.A,{className:"w-4 h-4"})]})]})]})]}),(0,a.jsx)("footer",{className:"bg-gray-900 text-white py-8",children:(0,a.jsx)("div",{className:"max-w-7xl mx-auto px-6 text-center text-gray-400",children:(0,a.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Aimstors Solution. All rights reserved."]})})})]})}},44071:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]])},49619:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]])},67635:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},81171:(e,t,s)=>{Promise.resolve().then(s.bind(s,33036))},90425:(e,t,s)=>{"use strict";s.d(t,{A:()=>o});var a=s(12115);let r=(...e)=>e.filter((e,t,s)=>!!e&&""!==e.trim()&&s.indexOf(e)===t).join(" ").trim(),i=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,s)=>s?s.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,a.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:i,className:l="",children:o,iconNode:d,...c},m)=>(0,a.createElement)("svg",{ref:m,...n,width:t,height:t,stroke:e,strokeWidth:i?24*Number(s)/Number(t):s,className:r("lucide",l),...!o&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,t])=>(0,a.createElement)(e,t)),...Array.isArray(o)?o:[o]])),o=(e,t)=>{let s=(0,a.forwardRef)(({className:s,...n},o)=>(0,a.createElement)(l,{ref:o,iconNode:t,className:r(`lucide-${i(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,s),...n}));return s.displayName=i(e),s}},92564:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("message-circle",[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]])},94514:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},96035:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});let a=(0,s(90425).A)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]])}},e=>{e.O(0,[8500,8441,3794,7358],()=>e(e.s=81171)),_N_E=e.O()}]);