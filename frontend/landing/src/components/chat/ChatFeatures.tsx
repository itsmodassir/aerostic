
import { MessageCircle, Plus, Bot } from "lucide-react";

const ChatFeatures = () => {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Smart Conversations</h3>
        <p className="text-sm text-gray-600">Powered by Google Gemini AI for intelligent responses</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Plus className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Multiple Chats</h3>
        <p className="text-sm text-gray-600">Create and manage multiple conversation threads</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Bot className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Persistent History</h3>
        <p className="text-sm text-gray-600">All your conversations are saved and accessible</p>
      </div>
    </div>
  );
};

export default ChatFeatures;
