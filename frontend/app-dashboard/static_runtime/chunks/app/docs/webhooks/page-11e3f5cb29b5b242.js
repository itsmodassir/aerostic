(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6439],{63:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("webhook",[["path",{d:"M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",key:"q3hayz"}],["path",{d:"m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06",key:"1go1hn"}],["path",{d:"m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8",key:"qlwsc0"}]])},439:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},5928:(e,s,t)=>{Promise.resolve().then(t.bind(t,40730))},21628:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},40730:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>u});var a=t(95155),r=t(98500),i=t.n(r),l=t(12115),d=t(96035),n=t(63),c=t(94514),o=t(67635),m=t(439),x=t(41585),h=t(53961),p=t(52484),g=t(21628);function u(){let[e,s]=(0,l.useState)(null),t=(e,t)=>{navigator.clipboard.writeText(e),s(t),setTimeout(()=>s(null),2e3)},r=[{name:"message.received",description:"Triggered when a new message is received from a customer",payload:`{
  "event": "message.received",
  "timestamp": "2026-01-30T15:45:00Z",
  "data": {
    "id": "msg_abc123",
    "from": "+919876543210",
    "type": "text",
    "text": "Hi, I need help with my order",
    "wamid": "wamid.ABGGFlC..."
  }
}`},{name:"message.sent",description:"Triggered when a message is successfully sent",payload:`{
  "event": "message.sent",
  "timestamp": "2026-01-30T15:45:05Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "sent",
    "wamid": "wamid.ABGGFlC..."
  }
}`},{name:"message.delivered",description:"Triggered when a message is delivered to the recipient",payload:`{
  "event": "message.delivered",
  "timestamp": "2026-01-30T15:45:10Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "delivered",
    "deliveredAt": "2026-01-30T15:45:10Z"
  }
}`},{name:"message.read",description:"Triggered when a message is read by the recipient",payload:`{
  "event": "message.read",
  "timestamp": "2026-01-30T15:46:00Z",
  "data": {
    "id": "msg_def456",
    "to": "+919876543210",
    "status": "read",
    "readAt": "2026-01-30T15:46:00Z"
  }
}`},{name:"message.failed",description:"Triggered when a message fails to send",payload:`{
  "event": "message.failed",
  "timestamp": "2026-01-30T15:45:05Z",
  "data": {
    "id": "msg_ghi789",
    "to": "+919876543210",
    "status": "failed",
    "error": {
      "code": "INVALID_RECIPIENT",
      "message": "Phone number is not on WhatsApp"
    }
  }
}`},{name:"contact.created",description:"Triggered when a new contact is added",payload:`{
  "event": "contact.created",
  "timestamp": "2026-01-30T15:45:00Z",
  "data": {
    "id": "contact_xyz",
    "phone": "+919876543210",
    "name": "John Doe",
    "tags": ["new", "website"]
  }
}`}],u=`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expectedSignature}\`;
}

// Express.js middleware example
app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const signature = req.headers['x-aimstors-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body);
  console.log('Received event:', event.event);
  
  // Process the event...
  
  res.status(200).json({ received: true });
});`;return(0,a.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,a.jsx)("nav",{className:"bg-white border-b border-gray-200 sticky top-0 z-50",children:(0,a.jsxs)("div",{className:"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",children:[(0,a.jsxs)(i(),{href:"/docs",className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center",children:(0,a.jsx)(d.A,{className:"w-5 h-5 text-white"})}),(0,a.jsx)("span",{className:"text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",children:"Aimstors Solution"})]}),(0,a.jsx)(i(),{href:"/docs",className:"text-blue-600 hover:underline",children:"← Back to Docs"})]})}),(0,a.jsxs)("main",{className:"max-w-4xl mx-auto px-6 py-16",children:[(0,a.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,a.jsx)("div",{className:"p-3 bg-purple-100 text-purple-600 rounded-xl",children:(0,a.jsx)(n.A,{className:"w-6 h-6"})}),(0,a.jsx)("h1",{className:"text-4xl font-extrabold text-gray-900",children:"Webhooks"})]}),(0,a.jsx)("p",{className:"text-xl text-gray-600 mb-12",children:"Receive real-time notifications for message events, status updates, and more."}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Setting Up Webhooks"}),(0,a.jsx)("div",{className:"bg-white rounded-2xl p-6 border border-gray-200",children:(0,a.jsxs)("ol",{className:"list-decimal pl-6 space-y-4 text-gray-600",children:[(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Create an endpoint"}),(0,a.jsx)("br",{}),"Set up an HTTPS endpoint on your server to receive webhook events."]}),(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Configure in Dashboard"}),(0,a.jsx)("br",{}),"Go to Dashboard → Developer → Webhooks and add your endpoint URL."]}),(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Select events"}),(0,a.jsx)("br",{}),"Choose which events you want to receive notifications for."]}),(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Verify signatures"}),(0,a.jsx)("br",{}),"Always verify the webhook signature to ensure requests are from Aimstors Solution."]})]})})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Event Types"}),(0,a.jsx)("div",{className:"space-y-4",children:r.map((s,r)=>(0,a.jsxs)("div",{className:"bg-white rounded-xl border border-gray-200 overflow-hidden",children:[(0,a.jsxs)("div",{className:"p-4 border-b border-gray-100",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between",children:[(0,a.jsx)("div",{className:"flex items-center gap-3",children:(0,a.jsx)("code",{className:"px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-sm",children:s.name})}),(0,a.jsx)("button",{onClick:()=>t(s.payload,s.name),className:"flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700",children:e===s.name?(0,a.jsx)(c.A,{className:"w-4 h-4 text-green-500"}):(0,a.jsx)(o.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("p",{className:"text-gray-600 text-sm mt-2",children:s.description})]}),(0,a.jsx)("pre",{className:"p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:s.payload})})]},r))})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2",children:[(0,a.jsx)(m.A,{className:"w-6 h-6 text-green-600"}),"Signature Verification"]}),(0,a.jsx)("div",{className:"bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6",children:(0,a.jsxs)("div",{className:"flex items-start gap-3",children:[(0,a.jsx)(x.A,{className:"w-5 h-5 text-amber-600 mt-0.5"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"font-medium text-amber-800",children:"Security Best Practice"}),(0,a.jsx)("p",{className:"text-amber-700 text-sm",children:"Always verify webhook signatures to prevent spoofed requests."})]})]})}),(0,a.jsxs)("p",{className:"text-gray-600 mb-4",children:["Every webhook request includes an ",(0,a.jsx)("code",{className:"px-1 bg-gray-100 rounded",children:"X-Aimstors Solution-Signature"})," header. Verify this signature using your webhook secret:"]}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"verify-signature.js"}),(0,a.jsx)("button",{onClick:()=>t(u,"verify"),className:"flex items-center gap-1 text-gray-400 hover:text-white",children:"verify"===e?(0,a.jsx)(c.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(o.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:u})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2",children:[(0,a.jsx)(h.A,{className:"w-6 h-6 text-purple-600"}),"Retry Policy"]}),(0,a.jsx)("p",{className:"text-gray-600 mb-4",children:"If your endpoint returns a non-2xx status code, we'll retry the webhook with exponential backoff:"}),(0,a.jsx)("div",{className:"bg-white rounded-xl border border-gray-200 overflow-hidden",children:(0,a.jsxs)("table",{className:"w-full",children:[(0,a.jsx)("thead",{className:"bg-gray-50",children:(0,a.jsxs)("tr",{children:[(0,a.jsx)("th",{className:"px-4 py-3 text-left text-sm font-semibold text-gray-900",children:"Attempt"}),(0,a.jsx)("th",{className:"px-4 py-3 text-left text-sm font-semibold text-gray-900",children:"Delay"})]})}),(0,a.jsx)("tbody",{className:"divide-y divide-gray-100",children:[{attempt:1,delay:"Immediate"},{attempt:2,delay:"30 seconds"},{attempt:3,delay:"5 minutes"},{attempt:4,delay:"30 minutes"},{attempt:5,delay:"2 hours"}].map(e=>(0,a.jsxs)("tr",{children:[(0,a.jsxs)("td",{className:"px-4 py-3 text-sm text-gray-600",children:["Attempt ",e.attempt]}),(0,a.jsx)("td",{className:"px-4 py-3 text-sm text-gray-900 font-medium",children:e.delay})]},e.attempt))})]})}),(0,a.jsx)("p",{className:"text-gray-500 text-sm mt-4",children:"After 5 failed attempts, the webhook will be marked as failed and you'll receive an email notification."})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Best Practices"}),(0,a.jsx)("div",{className:"grid grid-cols-2 gap-4",children:[{title:"Respond quickly",desc:"Return a 200 status within 5 seconds"},{title:"Process async",desc:"Queue events for background processing"},{title:"Handle duplicates",desc:"Use event IDs to detect duplicates"},{title:"Use HTTPS",desc:"Secure your endpoint with TLS"}].map((e,s)=>(0,a.jsxs)("div",{className:"bg-white rounded-xl p-4 border border-gray-200",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2 mb-2",children:[(0,a.jsx)(p.A,{className:"w-5 h-5 text-green-500"}),(0,a.jsx)("h4",{className:"font-semibold text-gray-900",children:e.title})]}),(0,a.jsx)("p",{className:"text-sm text-gray-600",children:e.desc})]},s))})]}),(0,a.jsxs)("div",{className:"bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100",children:[(0,a.jsx)("h3",{className:"font-bold text-gray-900 mb-2",children:"Next Steps"}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-4",children:[(0,a.jsxs)(i(),{href:"/docs/api-reference",className:"text-blue-600 hover:underline flex items-center gap-1",children:["API Reference ",(0,a.jsx)(g.A,{className:"w-4 h-4"})]}),(0,a.jsxs)(i(),{href:"/docs/ai-agents",className:"text-blue-600 hover:underline flex items-center gap-1",children:["AI Agents ",(0,a.jsx)(g.A,{className:"w-4 h-4"})]})]})]})]}),(0,a.jsx)("footer",{className:"bg-gray-900 text-white py-8",children:(0,a.jsx)("div",{className:"max-w-7xl mx-auto px-6 text-center text-gray-400",children:(0,a.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Aimstors Solution. All rights reserved."]})})})]})}},41585:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]])},52484:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},53961:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},67635:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},90425:(e,s,t)=>{"use strict";t.d(s,{A:()=>n});var a=t(12115);let r=(...e)=>e.filter((e,s,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===s).join(" ").trim(),i=e=>{let s=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,t)=>t?t.toUpperCase():s.toLowerCase());return s.charAt(0).toUpperCase()+s.slice(1)};var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let d=(0,a.forwardRef)(({color:e="currentColor",size:s=24,strokeWidth:t=2,absoluteStrokeWidth:i,className:d="",children:n,iconNode:c,...o},m)=>(0,a.createElement)("svg",{ref:m,...l,width:s,height:s,stroke:e,strokeWidth:i?24*Number(t)/Number(s):t,className:r("lucide",d),...!n&&!(e=>{for(let s in e)if(s.startsWith("aria-")||"role"===s||"title"===s)return!0;return!1})(o)&&{"aria-hidden":"true"},...o},[...c.map(([e,s])=>(0,a.createElement)(e,s)),...Array.isArray(n)?n:[n]])),n=(e,s)=>{let t=(0,a.forwardRef)(({className:t,...l},n)=>(0,a.createElement)(d,{ref:n,iconNode:s,className:r(`lucide-${i(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...l}));return t.displayName=i(e),t}},94514:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},96035:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]])}},e=>{e.O(0,[8500,8441,3794,7358],()=>e(e.s=5928)),_N_E=e.O()}]);