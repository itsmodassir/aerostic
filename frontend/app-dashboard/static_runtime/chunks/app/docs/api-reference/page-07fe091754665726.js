(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3299],{7810:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]])},21362:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},29050:(e,t,a)=>{Promise.resolve().then(a.bind(a,39320))},39320:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>y});var s=a(95155),r=a(98500),i=a.n(r),n=a(12115),o=a(52905),l=a(56204),d=a(7810),c=a(48368),m=a(53961),p=a(96035),h=a(66088),x=a(21362),u=a(94514),g=a(67635);function y(){let[e,t]=(0,n.useState)("authentication"),[a,r]=(0,n.useState)(null),[y,b]=(0,n.useState)(null),f=(e,t)=>{navigator.clipboard.writeText(e),r(t),setTimeout(()=>r(null),2e3)},j=[{id:"authentication",name:"Authentication",icon:(0,s.jsx)(o.A,{className:"w-4 h-4"})},{id:"messages",name:"Messages",icon:(0,s.jsx)(l.A,{className:"w-4 h-4"})},{id:"contacts",name:"Contacts",icon:(0,s.jsx)(d.A,{className:"w-4 h-4"})},{id:"templates",name:"Templates",icon:(0,s.jsx)(c.A,{className:"w-4 h-4"})},{id:"ai-agents",name:"AI Agents",icon:(0,s.jsx)(m.A,{className:"w-4 h-4"})}],A={authentication:[{id:"auth-header",method:"HEADER",path:"Authorization",title:"API Key Authentication",description:"All API requests must include your API key in the Authorization header.",request:`curl -X GET https://api.aimstore.in/v1/me \\
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`,response:`{
  "id": "tenant_abc123",
  "name": "My Business",
  "email": "business@example.com",
  "plan": "growth",
  "api_calls_remaining": 45000
}`,params:[]}],messages:[{id:"send-template",method:"POST",path:"/messages/send",title:"Send Template Message",description:"Send a pre-approved WhatsApp template message to a recipient.",request:`curl -X POST https://api.aimstore.in/v1/messages/send \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "template": "order_confirmation",
    "language": "en",
    "variables": ["John", "ORD-12345", "₹1,499"]
  }'`,response:`{
  "id": "msg_abc123xyz",
  "status": "sent",
  "to": "+919876543210",
  "template": "order_confirmation",
  "wamid": "wamid.ABGGFlCGhYoIBRgB...",
  "timestamp": "2026-01-30T15:45:00Z"
}`,params:[{name:"to",type:"string",required:!0,desc:"Recipient phone number with country code"},{name:"template",type:"string",required:!0,desc:"Template name (must be approved)"},{name:"language",type:"string",required:!1,desc:"Template language code (default: en)"},{name:"variables",type:"array",required:!1,desc:"Variable values for template placeholders"}]},{id:"send-text",method:"POST",path:"/messages/text",title:"Send Text Message",description:"Send a plain text message (only works within 24-hour window).",request:`curl -X POST https://api.aimstore.in/v1/messages/text \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "text": "Hello! How can I help you today?"
  }'`,response:`{
  "id": "msg_def456abc",
  "status": "sent",
  "to": "+919876543210",
  "type": "text",
  "timestamp": "2026-01-30T15:46:00Z"
}`,params:[{name:"to",type:"string",required:!0,desc:"Recipient phone number"},{name:"text",type:"string",required:!0,desc:"Message text (max 4096 chars)"}]},{id:"list-messages",method:"GET",path:"/messages",title:"List Messages",description:"Retrieve a paginated list of messages.",request:`curl -X GET "https://api.aimstore.in/v1/messages?limit=20&status=delivered" \\
  -H "Authorization: Bearer ak_live_xxxxx"`,response:`{
  "data": [
    {
      "id": "msg_abc123",
      "to": "+919876543210",
      "status": "delivered",
      "type": "template",
      "timestamp": "2026-01-30T15:45:00Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}`,params:[{name:"limit",type:"number",required:!1,desc:"Number of results (1-100, default: 20)"},{name:"offset",type:"number",required:!1,desc:"Pagination offset"},{name:"status",type:"string",required:!1,desc:"Filter by status: sent, delivered, read, failed"}]}],contacts:[{id:"create-contact",method:"POST",path:"/contacts",title:"Create Contact",description:"Add a new contact to your address book.",request:`curl -X POST https://api.aimstore.in/v1/contacts \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+919876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "tags": ["customer", "premium"]
  }'`,response:`{
  "id": "contact_xyz789",
  "phone": "+919876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "tags": ["customer", "premium"],
  "createdAt": "2026-01-30T15:45:00Z"
}`,params:[{name:"phone",type:"string",required:!0,desc:"Phone number with country code"},{name:"name",type:"string",required:!1,desc:"Contact name"},{name:"email",type:"string",required:!1,desc:"Email address"},{name:"tags",type:"array",required:!1,desc:"Tags for segmentation"}]},{id:"list-contacts",method:"GET",path:"/contacts",title:"List Contacts",description:"Retrieve all contacts with optional filtering.",request:`curl -X GET "https://api.aimstore.in/v1/contacts?tag=premium&limit=50" \\
  -H "Authorization: Bearer ak_live_xxxxx"`,response:`{
  "data": [
    {
      "id": "contact_xyz789",
      "phone": "+919876543210",
      "name": "John Doe",
      "tags": ["customer", "premium"]
    }
  ],
  "pagination": {
    "total": 2500,
    "limit": 50,
    "hasMore": true
  }
}`,params:[{name:"tag",type:"string",required:!1,desc:"Filter by tag"},{name:"limit",type:"number",required:!1,desc:"Results per page (max 100)"}]}],templates:[{id:"list-templates",method:"GET",path:"/templates",title:"List Templates",description:"Get all message templates with their approval status.",request:`curl -X GET https://api.aimstore.in/v1/templates \\
  -H "Authorization: Bearer ak_live_xxxxx"`,response:`{
  "data": [
    {
      "name": "order_confirmation",
      "category": "UTILITY",
      "language": "en",
      "status": "APPROVED",
      "components": [
        {
          "type": "BODY",
          "text": "Hi {{1}}, your order {{2}} has been confirmed!"
        }
      ]
    }
  ]
}`,params:[]},{id:"create-template",method:"POST",path:"/templates",title:"Create Template",description:"Submit a new template for Meta approval.",request:`curl -X POST https://api.aimstore.in/v1/templates \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "welcome_message",
    "category": "MARKETING",
    "language": "en",
    "components": [
      {
        "type": "BODY",
        "text": "Welcome {{1}}! Thanks for joining us."
      }
    ]
  }'`,response:`{
  "name": "welcome_message",
  "status": "PENDING",
  "message": "Template submitted for review"
}`,params:[{name:"name",type:"string",required:!0,desc:"Unique template name (lowercase, underscores)"},{name:"category",type:"string",required:!0,desc:"MARKETING, UTILITY, or AUTHENTICATION"},{name:"language",type:"string",required:!0,desc:"Language code (e.g., en, hi)"},{name:"components",type:"array",required:!0,desc:"Template components (HEADER, BODY, FOOTER)"}]}],"ai-agents":[{id:"list-agents",method:"GET",path:"/ai-agents",title:"List AI Agents",description:"Get all configured AI agents.",request:`curl -X GET https://api.aimstore.in/v1/ai-agents \\
  -H "Authorization: Bearer ak_live_xxxxx"`,response:`{
  "data": [
    {
      "id": "agent_abc123",
      "name": "Sales Bot",
      "type": "sales",
      "isActive": true,
      "stats": {
        "conversations": 1234,
        "resolutionRate": 85.5
      }
    }
  ]
}`,params:[]},{id:"create-agent",method:"POST",path:"/ai-agents",title:"Create AI Agent",description:"Create a new AI agent with custom configuration.",request:`curl -X POST https://api.aimstore.in/v1/ai-agents \\
  -H "Authorization: Bearer ak_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Support Bot",
    "type": "support",
    "systemPrompt": "You are a helpful support agent...",
    "handoffRules": {
      "keywords": ["manager", "complaint"],
      "confidenceThreshold": 0.6
    }
  }'`,response:`{
  "id": "agent_def456",
  "name": "Support Bot",
  "type": "support",
  "isActive": true,
  "createdAt": "2026-01-30T15:45:00Z"
}`,params:[{name:"name",type:"string",required:!0,desc:"Agent display name"},{name:"type",type:"string",required:!0,desc:"Agent type: support, sales, lead_qual, custom"},{name:"systemPrompt",type:"string",required:!0,desc:"Instructions for AI behavior"},{name:"handoffRules",type:"object",required:!1,desc:"Rules for human handoff"}]}]}[e]||[];return(0,s.jsxs)("div",{className:"min-h-screen bg-gray-50 flex",children:[(0,s.jsxs)("aside",{className:"w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto",children:[(0,s.jsx)("div",{className:"p-4 border-b border-gray-200",children:(0,s.jsxs)(i(),{href:"/docs",className:"flex items-center gap-2",children:[(0,s.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center",children:(0,s.jsx)(p.A,{className:"w-4 h-4 text-white"})}),(0,s.jsx)("span",{className:"font-bold text-gray-900",children:"API Reference"})]})}),(0,s.jsxs)("nav",{className:"p-4",children:[(0,s.jsx)("p",{className:"text-xs font-semibold text-gray-400 uppercase mb-3",children:"Endpoints"}),j.map(a=>(0,s.jsxs)("button",{onClick:()=>t(a.id),className:`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors ${e===a.id?"bg-blue-50 text-blue-700":"text-gray-600 hover:bg-gray-100"}`,children:[a.icon,(0,s.jsx)("span",{className:"font-medium",children:a.name})]},a.id))]}),(0,s.jsx)("div",{className:"p-4 border-t border-gray-200",children:(0,s.jsx)(i(),{href:"/",className:"text-sm text-gray-500 hover:text-gray-700",children:"← Back to Website"})})]}),(0,s.jsx)("main",{className:"flex-1 ml-64 p-8",children:(0,s.jsxs)("div",{className:"max-w-4xl",children:[(0,s.jsxs)("div",{className:"mb-8",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold text-gray-900 capitalize",children:e.replace("-"," ")}),(0,s.jsxs)("p",{className:"text-gray-600 mt-2",children:["authentication"===e&&"Learn how to authenticate your API requests.","messages"===e&&"Send and manage WhatsApp messages programmatically.","contacts"===e&&"Manage your contact lists and segmentation.","templates"===e&&"Create and manage message templates.","ai-agents"===e&&"Configure AI-powered chatbot agents."]})]}),(0,s.jsx)("div",{className:"space-y-6",children:A.map(e=>(0,s.jsxs)("div",{className:"bg-white rounded-2xl border border-gray-200 overflow-hidden",children:[(0,s.jsxs)("div",{className:"p-6 cursor-pointer hover:bg-gray-50 transition-colors",onClick:()=>b(y===e.id?null:e.id),children:[(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsx)("span",{className:`px-2 py-1 text-xs font-mono font-bold rounded ${"POST"===e.method?"bg-green-100 text-green-700":"GET"===e.method?"bg-blue-100 text-blue-700":"PUT"===e.method?"bg-amber-100 text-amber-700":"DELETE"===e.method?"bg-red-100 text-red-700":"bg-gray-100 text-gray-700"}`,children:e.method}),(0,s.jsx)("code",{className:"text-gray-900 font-mono",children:e.path})]}),y===e.id?(0,s.jsx)(h.A,{className:"w-5 h-5 text-gray-400"}):(0,s.jsx)(x.A,{className:"w-5 h-5 text-gray-400"})]}),(0,s.jsx)("h3",{className:"text-lg font-bold text-gray-900 mt-2",children:e.title}),(0,s.jsx)("p",{className:"text-gray-600 mt-1",children:e.description})]}),y===e.id&&(0,s.jsxs)("div",{className:"border-t border-gray-200",children:[e.params&&e.params.length>0&&(0,s.jsxs)("div",{className:"p-6 bg-gray-50",children:[(0,s.jsx)("h4",{className:"font-semibold text-gray-900 mb-3",children:"Parameters"}),(0,s.jsxs)("table",{className:"w-full text-sm",children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{className:"text-left text-gray-500",children:[(0,s.jsx)("th",{className:"pb-2",children:"Name"}),(0,s.jsx)("th",{className:"pb-2",children:"Type"}),(0,s.jsx)("th",{className:"pb-2",children:"Required"}),(0,s.jsx)("th",{className:"pb-2",children:"Description"})]})}),(0,s.jsx)("tbody",{children:e.params.map((e,t)=>(0,s.jsxs)("tr",{className:"border-t border-gray-200",children:[(0,s.jsx)("td",{className:"py-2 font-mono text-blue-600",children:e.name}),(0,s.jsx)("td",{className:"py-2 text-gray-600",children:e.type}),(0,s.jsx)("td",{className:"py-2",children:e.required?(0,s.jsx)("span",{className:"text-red-600",children:"Yes"}):(0,s.jsx)("span",{className:"text-gray-400",children:"No"})}),(0,s.jsx)("td",{className:"py-2 text-gray-600",children:e.desc})]},t))})]})]}),(0,s.jsxs)("div",{className:"p-6",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,s.jsx)("h4",{className:"font-semibold text-gray-900",children:"Request"}),(0,s.jsxs)("button",{onClick:()=>f(e.request,`${e.id}-req`),className:"flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700",children:[a===`${e.id}-req`?(0,s.jsx)(u.A,{className:"w-4 h-4 text-green-500"}):(0,s.jsx)(g.A,{className:"w-4 h-4"}),"Copy"]})]}),(0,s.jsx)("pre",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:(0,s.jsx)("code",{children:e.request})})]}),(0,s.jsxs)("div",{className:"p-6 pt-0",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,s.jsx)("h4",{className:"font-semibold text-gray-900",children:"Response"}),(0,s.jsxs)("button",{onClick:()=>f(e.response,`${e.id}-res`),className:"flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700",children:[a===`${e.id}-res`?(0,s.jsx)(u.A,{className:"w-4 h-4 text-green-500"}):(0,s.jsx)(g.A,{className:"w-4 h-4"}),"Copy"]})]}),(0,s.jsx)("pre",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:(0,s.jsx)("code",{children:e.response})})]})]})]},e.id))})]})})]})}},48368:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},52905:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("key",[["path",{d:"m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4",key:"g0fldk"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}]])},53961:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},56204:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]])},66088:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},67635:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},90425:(e,t,a)=>{"use strict";a.d(t,{A:()=>l});var s=a(12115);let r=(...e)=>e.filter((e,t,a)=>!!e&&""!==e.trim()&&a.indexOf(e)===t).join(" ").trim(),i=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,a)=>a?a.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,s.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:i,className:o="",children:l,iconNode:d,...c},m)=>(0,s.createElement)("svg",{ref:m,...n,width:t,height:t,stroke:e,strokeWidth:i?24*Number(a)/Number(t):a,className:r("lucide",o),...!l&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,t])=>(0,s.createElement)(e,t)),...Array.isArray(l)?l:[l]])),l=(e,t)=>{let a=(0,s.forwardRef)(({className:a,...n},l)=>(0,s.createElement)(o,{ref:l,iconNode:t,className:r(`lucide-${i(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,a),...n}));return a.displayName=i(e),a}},94514:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},96035:(e,t,a)=>{"use strict";a.d(t,{A:()=>s});let s=(0,a(90425).A)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]])}},e=>{e.O(0,[8500,8441,3794,7358],()=>e(e.s=29050)),_N_E=e.O()}]);