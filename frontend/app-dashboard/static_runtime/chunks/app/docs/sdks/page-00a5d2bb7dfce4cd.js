(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4156],{6962:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]])},10762:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]])},21628:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},22164:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]])},24642:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("package",[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]])},52475:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("code",[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]])},53961:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},67635:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},72453:(e,s,t)=>{Promise.resolve().then(t.bind(t,79909))},79909:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>b});var a=t(95155),r=t(98500),n=t.n(r),l=t(12115),i=t(96035),o=t(24642),d=t(6962),c=t(10762),m=t(94514),x=t(67635),h=t(53961),g=t(52475),p=t(22164),u=t(21628);function b(){let[e,s]=(0,l.useState)(null),[t,r]=(0,l.useState)("node"),b=(e,t)=>{navigator.clipboard.writeText(e),s(t),setTimeout(()=>s(null),2e3)},v={node:{name:"Node.js",version:"2.1.0",status:"stable",install:"npm install @aimstors/sdk",init:`const Aimstors Solution = require('@aimstors/sdk');

const client = new Aimstors Solution({
  apiKey: process.env.AIMSTORS_API_KEY
});`,sendMessage:`// Send a template message
const response = await client.messages.send({
  to: '+919876543210',
  template: 'order_confirmation',
  language: 'en',
  variables: ['John', 'ORD-12345', '₹1,499']
});

console.log('Message ID:', response.id);
console.log('Status:', response.status);`,webhook:`// Handle webhook events
app.post('/webhook', express.json(), (req, res) => {
  const event = req.body;
  
  switch (event.event) {
    case 'message.received':
      console.log('New message from:', event.data.from);
      break;
    case 'message.delivered':
      console.log('Message delivered:', event.data.id);
      break;
  }
  
  res.status(200).json({ received: true });
});`},python:{name:"Python",version:"1.8.0",status:"stable",install:"pip install aimstors",init:`from aimstors import Aimstors Solution
import os

client = Aimstors Solution(api_key=os.environ['AIMSTORS_API_KEY'])`,sendMessage:`# Send a template message
response = client.messages.send(
    to='+919876543210',
    template='order_confirmation',
    language='en',
    variables=['John', 'ORD-12345', '₹1,499']
)

print(f"Message ID: {response.id}")
print(f"Status: {response.status}")`,webhook:`# Flask webhook handler
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    event = request.json
    
    if event['event'] == 'message.received':
        print(f"New message from: {event['data']['from']}")
    elif event['event'] == 'message.delivered':
        print(f"Message delivered: {event['data']['id']}")
    
    return jsonify({'received': True}), 200`},php:{name:"PHP",version:"1.5.0",status:"beta",install:"composer require aimstors/sdk",init:`<?php
use Aimstors Solution\\Client;

$client = new Client(getenv('AIMSTORS_API_KEY'));`,sendMessage:`<?php
// Send a template message
$response = $client->messages->send([
    'to' => '+919876543210',
    'template' => 'order_confirmation',
    'language' => 'en',
    'variables' => ['John', 'ORD-12345', '₹1,499']
]);

echo "Message ID: " . $response->id . "\\n";
echo "Status: " . $response->status . "\\n";`,webhook:`<?php
// Laravel webhook handler
Route::post('/webhook', function (Request $request) {
    $event = $request->all();
    
    switch ($event['event']) {
        case 'message.received':
            Log::info('New message from: ' . $event['data']['from']);
            break;
        case 'message.delivered':
            Log::info('Message delivered: ' . $event['data']['id']);
            break;
    }
    
    return response()->json(['received' => true]);
});`},go:{name:"Go",version:"0.9.0",status:"alpha",install:"go get github.com/aimstors/aimstors-go",init:`package main

import (
    "os"
    aimstors "github.com/aimstors/aimstors-go"
)

func main() {
    client := aimstors.NewClient(os.Getenv("AIMSTORS_API_KEY"))
}`,sendMessage:`// Send a template message
response, err := client.Messages.Send(&aimstors.SendMessageParams{
    To:        "+919876543210",
    Template:  "order_confirmation",
    Language:  "en",
    Variables: []string{"John", "ORD-12345", "₹1,499"},
})

if err != nil {
    log.Fatal(err)
}

fmt.Printf("Message ID: %s\\n", response.ID)
fmt.Printf("Status: %s\\n", response.Status)`,webhook:`// HTTP webhook handler
func webhookHandler(w http.ResponseWriter, r *http.Request) {
    var event aimstors.WebhookEvent
    json.NewDecoder(r.Body).Decode(&event)
    
    switch event.Event {
    case "message.received":
        log.Printf("New message from: %s", event.Data.From)
    case "message.delivered":
        log.Printf("Message delivered: %s", event.Data.ID)
    }
    
    json.NewEncoder(w).Encode(map[string]bool{"received": true})
}`}},f=v[t];return(0,a.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,a.jsx)("nav",{className:"bg-white border-b border-gray-200 sticky top-0 z-50",children:(0,a.jsxs)("div",{className:"max-w-7xl mx-auto px-6 py-4 flex items-center justify-between",children:[(0,a.jsxs)(n(),{href:"/docs",className:"flex items-center gap-2",children:[(0,a.jsx)("div",{className:"w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center",children:(0,a.jsx)(i.A,{className:"w-5 h-5 text-white"})}),(0,a.jsx)("span",{className:"text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",children:"Aimstors Solution"})]}),(0,a.jsx)(n(),{href:"/docs",className:"text-blue-600 hover:underline",children:"← Back to Docs"})]})}),(0,a.jsxs)("main",{className:"max-w-4xl mx-auto px-6 py-16",children:[(0,a.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,a.jsx)("div",{className:"p-3 bg-indigo-100 text-indigo-600 rounded-xl",children:(0,a.jsx)(o.A,{className:"w-6 h-6"})}),(0,a.jsx)("h1",{className:"text-4xl font-extrabold text-gray-900",children:"SDK Libraries"})]}),(0,a.jsx)("p",{className:"text-xl text-gray-600 mb-12",children:"Official client libraries for integrating Aimstors Solution into your applications."}),(0,a.jsx)("div",{className:"grid grid-cols-4 gap-4 mb-12",children:["node","python","php","go"].map(e=>(0,a.jsxs)("button",{onClick:()=>r(e),className:`p-4 rounded-xl border-2 transition-all ${t===e?"border-blue-500 bg-blue-50":"border-gray-200 bg-white hover:border-gray-300"}`,children:[(0,a.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,a.jsx)("span",{className:"font-bold text-gray-900",children:v[e].name}),(0,a.jsx)("span",{className:`px-2 py-0.5 text-xs rounded ${"stable"===v[e].status?"bg-green-100 text-green-700":"beta"===v[e].status?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`,children:v[e].status})]}),(0,a.jsxs)("p",{className:"text-sm text-gray-500",children:["v",v[e].version]})]},e))}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2",children:[(0,a.jsx)(d.A,{className:"w-5 h-5"})," Installation"]}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(c.A,{className:"w-4 h-4"}),(0,a.jsx)("span",{children:"Terminal"})]}),(0,a.jsx)("button",{onClick:()=>b(f.install,"install"),className:"text-gray-400 hover:text-white",children:"install"===e?(0,a.jsx)(m.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm",children:(0,a.jsx)("code",{children:f.install})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2",children:[(0,a.jsx)(h.A,{className:"w-5 h-5"})," Quick Start"]}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"Initialize the client"}),(0,a.jsx)("button",{onClick:()=>b(f.init,"init"),className:"text-gray-400 hover:text-white",children:"init"===e?(0,a.jsx)(m.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:f.init})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsxs)("h2",{className:"text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2",children:[(0,a.jsx)(g.A,{className:"w-5 h-5"})," Send a Message"]}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"Send template message"}),(0,a.jsx)("button",{onClick:()=>b(f.sendMessage,"send"),className:"text-gray-400 hover:text-white",children:"send"===e?(0,a.jsx)(m.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:f.sendMessage})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Webhook Handler"}),(0,a.jsxs)("div",{className:"bg-gray-900 rounded-xl overflow-hidden",children:[(0,a.jsxs)("div",{className:"px-4 py-2 bg-gray-800 text-gray-400 text-sm flex items-center justify-between",children:[(0,a.jsx)("span",{children:"Handle webhook events"}),(0,a.jsx)("button",{onClick:()=>b(f.webhook,"webhook"),className:"text-gray-400 hover:text-white",children:"webhook"===e?(0,a.jsx)(m.A,{className:"w-4 h-4 text-green-400"}):(0,a.jsx)(x.A,{className:"w-4 h-4"})})]}),(0,a.jsx)("pre",{className:"p-4 text-gray-100 text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:f.webhook})})]})]}),(0,a.jsxs)("section",{className:"mb-12",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Resources"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,a.jsxs)("a",{href:"#",className:"flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors",children:[(0,a.jsx)(p.A,{className:"w-5 h-5 text-gray-400"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"font-medium text-gray-900",children:"GitHub Repository"}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"View source code and examples"})]})]}),(0,a.jsxs)("a",{href:"#",className:"flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors",children:[(0,a.jsx)(p.A,{className:"w-5 h-5 text-gray-400"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("p",{className:"font-medium text-gray-900",children:"npm / PyPI Package"}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"View on package registry"})]})]})]})]}),(0,a.jsxs)("div",{className:"bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100",children:[(0,a.jsx)("h3",{className:"font-bold text-gray-900 mb-2",children:"Next Steps"}),(0,a.jsxs)("div",{className:"flex flex-wrap gap-4",children:[(0,a.jsxs)(n(),{href:"/docs/api-reference",className:"text-blue-600 hover:underline flex items-center gap-1",children:["API Reference ",(0,a.jsx)(u.A,{className:"w-4 h-4"})]}),(0,a.jsxs)(n(),{href:"/docs/webhooks",className:"text-blue-600 hover:underline flex items-center gap-1",children:["Webhooks ",(0,a.jsx)(u.A,{className:"w-4 h-4"})]})]})]})]}),(0,a.jsx)("footer",{className:"bg-gray-900 text-white py-8",children:(0,a.jsx)("div",{className:"max-w-7xl mx-auto px-6 text-center text-gray-400",children:(0,a.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Aimstors Solution. All rights reserved."]})})})]})}},90425:(e,s,t)=>{"use strict";t.d(s,{A:()=>o});var a=t(12115);let r=(...e)=>e.filter((e,s,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===s).join(" ").trim(),n=e=>{let s=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,t)=>t?t.toUpperCase():s.toLowerCase());return s.charAt(0).toUpperCase()+s.slice(1)};var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let i=(0,a.forwardRef)(({color:e="currentColor",size:s=24,strokeWidth:t=2,absoluteStrokeWidth:n,className:i="",children:o,iconNode:d,...c},m)=>(0,a.createElement)("svg",{ref:m,...l,width:s,height:s,stroke:e,strokeWidth:n?24*Number(t)/Number(s):t,className:r("lucide",i),...!o&&!(e=>{for(let s in e)if(s.startsWith("aria-")||"role"===s||"title"===s)return!0;return!1})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,s])=>(0,a.createElement)(e,s)),...Array.isArray(o)?o:[o]])),o=(e,s)=>{let t=(0,a.forwardRef)(({className:t,...l},o)=>(0,a.createElement)(i,{ref:o,iconNode:s,className:r(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...l}));return t.displayName=n(e),t}},94514:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},96035:(e,s,t)=>{"use strict";t.d(s,{A:()=>a});let a=(0,t(90425).A)("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]])}},e=>{e.O(0,[8500,8441,3794,7358],()=>e(e.s=72453)),_N_E=e.O()}]);