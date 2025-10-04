
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
    }
  }, [currentConversation]);

  const fetchConversations = async () => {
    try {
      if (!user) {
        // For non-authenticated users, load from localStorage
        const localConversations = localStorage.getItem('chat_conversations');
        if (localConversations) {
          setConversations(JSON.parse(localConversations));
        }
        setLoadingConversations(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations. Please try refreshing the page.');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      if (!user) {
        // For non-authenticated users, load from localStorage
        const localMessages = localStorage.getItem(`chat_messages_${conversationId}`);
        if (localMessages) {
          setMessages(JSON.parse(localMessages));
        } else {
          setMessages([]);
        }
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load conversation messages.');
    }
  };

  const createNewConversation = async () => {
    try {
      const title = `Enhanced Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      
      if (!user) {
        // For non-authenticated users, create local conversation
        const localConversation: Conversation = {
          id: `local-${Date.now()}`,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedConversations = [localConversation, ...conversations];
        setConversations(updatedConversations);
        localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
        setCurrentConversation(localConversation.id);
        setMessages([]);
        toast.success('New conversation started! Sign in to save your chat history.');
        return;
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user?.id,
          title
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data.id);
      setMessages([]);
      toast.success('New enhanced conversation started!');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation. Please try again.');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      if (!user || conversationId.startsWith('local-')) {
        // For non-authenticated users or local conversations
        const updatedConversations = conversations.filter(c => c.id !== conversationId);
        setConversations(updatedConversations);
        localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
        localStorage.removeItem(`chat_messages_${conversationId}`);
        
        if (currentConversation === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
        return;
      }

      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation. Please try again.');
    }
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      created_at: new Date().toISOString()
    };

    if (!user || conversationId.startsWith('local-')) {
      // For non-authenticated users, save to localStorage
      const existingMessages = localStorage.getItem(`chat_messages_${conversationId}`);
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(message);
      localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(messages));
      return message;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role,
          content
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  const generateSmartTitle = (message: string): string => {
    // Extract key topics from the message for better conversation titles
    const codeKeywords = ['website', 'react', 'javascript', 'css', 'html', 'code', 'function', 'component'];
    const designKeywords = ['design', 'ui', 'ux', 'layout', 'style', 'color', 'responsive'];
    const helpKeywords = ['help', 'how', 'what', 'why', 'explain', 'debug', 'fix', 'error'];
    
    const lowerMessage = message.toLowerCase();
    
    if (codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return `💻 ${message.substring(0, 40)}...`;
    } else if (designKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return `🎨 ${message.substring(0, 40)}...`;
    } else if (helpKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return `❓ ${message.substring(0, 40)}...`;
    }
    
    return message.length > 40 ? `${message.substring(0, 40)}...` : message;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    let conversationId = currentConversation;
    
    // Create new conversation automatically if none exists
    if (!conversationId) {
      try {
        const title = generateSmartTitle(inputMessage);
        
        if (!user) {
          // For non-authenticated users, create local conversation
          const localConversation: Conversation = {
            id: `local-${Date.now()}`,
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          conversationId = localConversation.id;
          setCurrentConversation(conversationId);
          const updatedConversations = [localConversation, ...conversations];
          setConversations(updatedConversations);
          localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
        } else {
          const { data, error } = await supabase
            .from('chat_conversations')
            .insert({
              user_id: user?.id,
              title
            })
            .select()
            .single();

          if (error) throw error;
          conversationId = data.id;
          setCurrentConversation(conversationId);
          setConversations(prev => [data, ...prev]);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to create conversation. Please try again.');
        return;
      }
    }

    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Save user message first
      const savedUserMessage = await saveMessage(conversationId, 'user', userMessage);
      setMessages(prev => [...prev, savedUserMessage]);

      // Show enhanced loading message
      console.log('🚀 Calling enhanced Gemini API with conversation ID:', conversationId);
      console.log('📝 User message:', userMessage);
      console.log('🧠 Conversation context will be used for better responses');

      // Call enhanced Gemini API with conversation history
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: userMessage,
          conversationId
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to get AI response. Please try again.');
      }

      if (data.error) {
        console.error('AI API error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Enhanced AI response received');
      console.log('🎯 Response includes context awareness and improved formatting');

      // Save assistant response
      const savedAssistantMessage = await saveMessage(conversationId, 'assistant', data.response);
      setMessages(prev => [...prev, savedAssistantMessage]);

      // Update conversation timestamp for authenticated users
      if (user && !conversationId.startsWith('local-')) {
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else if (!user) {
        // Update local conversation timestamp
        const updatedConversations = conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, updated_at: new Date().toISOString() }
            : conv
        );
        setConversations(updatedConversations);
        localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
      }

      // Show success message for enhanced features
      if (data.enhanced) {
        console.log('🌟 Enhanced AI features active: context awareness, better formatting, code generation');
        
        // Show special toast for multi-prompt responses
        if (data.multiPrompt && data.promptCount) {
          toast.success(`✅ Successfully processed ${data.promptCount} prompts in sequence!`);
        }
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      
      // Restore the input message so user can retry
      setInputMessage(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    inputMessage,
    isLoading,
    loadingConversations,
    setCurrentConversation,
    setInputMessage,
    createNewConversation,
    deleteConversation,
    sendMessage,
    handleKeyPress
  };
};
