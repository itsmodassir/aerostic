import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  isStreaming?: boolean;
  isComplete?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const streamingMessageRef = useRef<string>("");

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('🔌 Connecting to real-time chat WebSocket...');
    
    const wsUrl = 'wss://tsyxndzqsadatwcbbdrv.functions.supabase.co/realtime-chat';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ Real-time chat WebSocket connected');
      setIsConnected(true);
      toast.success('Real-time chat connected!');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Received WebSocket message:', data);

      switch (data.type) {
        case 'connection_established':
          console.log('🎯 Connection established:', data.message);
          break;

        case 'typing_start':
          console.log('⌨️ AI started typing...');
          setIsLoading(true);
          break;

        case 'response_start':
          console.log('🚀 AI response started streaming');
          streamingMessageRef.current = "";
          
          // Add a new streaming message
          const streamingMessage: Message = {
            id: `streaming-${Date.now()}`,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
            isStreaming: true,
            isComplete: false
          };
          
          setMessages(prev => [...prev, streamingMessage]);
          setIsLoading(false);
          break;

        case 'response_chunk':
          console.log('📝 Streaming chunk received:', data.content);
          streamingMessageRef.current += data.content;
          
          // Update the streaming message
          setMessages(prev => 
            prev.map(msg => 
              msg.isStreaming && !msg.isComplete
                ? { ...msg, content: streamingMessageRef.current }
                : msg
            )
          );
          break;

        case 'response_complete':
          console.log('✅ AI response streaming completed');
          
          // Mark the streaming message as complete and save it
          setMessages(prev => 
            prev.map(msg => 
              msg.isStreaming && !msg.isComplete
                ? { 
                    ...msg, 
                    content: data.fullResponse,
                    isStreaming: false, 
                    isComplete: true,
                    id: `msg-${Date.now()}`
                  }
                : msg
            )
          );
          
          // Save to database if user is authenticated
          if (user && currentConversation) {
            saveMessage(currentConversation, 'assistant', data.fullResponse);
          }
          break;

        case 'error':
          console.error('❌ WebSocket error:', data.message);
          toast.error(data.message);
          setIsLoading(false);
          break;
      }
    };

    wsRef.current.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connectWebSocket();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
      toast.error('Connection error. Attempting to reconnect...');
    };
  }, [user, currentConversation]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Load conversations and messages (existing logic)
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
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      if (!user || conversationId.startsWith('local-')) {
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
        created_at: msg.created_at,
        isComplete: true
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      created_at: new Date().toISOString(),
      isComplete: true
    };

    if (!user || conversationId.startsWith('local-')) {
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
        created_at: data.created_at,
        isComplete: true
      };
    } catch (error) {
      console.error('Error saving message:', error);
      return message;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) {
      if (!isConnected) {
        toast.error('Not connected to real-time chat. Reconnecting...');
        connectWebSocket();
      }
      return;
    }

    let conversationId = currentConversation;
    
    // Create new conversation if none exists
    if (!conversationId) {
      const title = inputMessage.length > 40 ? `${inputMessage.substring(0, 40)}...` : inputMessage;
      
      if (!user) {
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
        try {
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
        } catch (error) {
          console.error('Error creating conversation:', error);
          toast.error('Failed to create conversation');
          return;
        }
      }
    }

    const userMessage = inputMessage;
    setInputMessage("");

    // Add user message to UI immediately
    const userMsgObject: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      isComplete: true
    };
    
    setMessages(prev => [...prev, userMsgObject]);

    // Save user message
    if (user && !conversationId.startsWith('local-')) {
      await saveMessage(conversationId, 'user', userMessage);
    } else if (!user) {
      const existingMessages = localStorage.getItem(`chat_messages_${conversationId}`);
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(userMsgObject);
      localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(messages));
    }

    // Send message via WebSocket for real-time AI response
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending message to WebSocket:', userMessage);
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: userMessage,
        conversationId
      }));
    } else {
      toast.error('Connection lost. Please wait for reconnection...');
      connectWebSocket();
    }
  };

  const createNewConversation = async () => {
    setCurrentConversation(null);
    setMessages([]);
    toast.success('New conversation started!');
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      if (!user || conversationId.startsWith('local-')) {
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
      toast.error('Failed to delete conversation');
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
    isConnected,
    setCurrentConversation,
    setInputMessage,
    createNewConversation,
    deleteConversation,
    sendMessage,
    handleKeyPress
  };
};