import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Send, Bot, User, Loader2, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessageToGemini, ChatMessage, InfluencerData } from '@/lib/gemini';

interface AIChatbotProps {
  userType: 'brand' | 'influencer';
  userName?: string;
  influencers?: InfluencerData[];
  brandInfo?: any;
  influencerInfo?: any;
  /** If true, shows as a dashboard card instead of floating button */
  variant?: 'floating' | 'card';
}

export function AIChatbot({ userType, userName, influencers, brandInfo, influencerInfo, variant = 'floating' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getWelcomeMessage = (): string => {
    if (userType === 'brand') {
      return `👋 Hi${userName ? ` ${userName}` : ''}! I'm your AI assistant for influencer marketing. I can help you:\n\n• Find the perfect influencers for your campaigns\n• Explain why specific influencers are recommended\n• Provide insights on engagement rates and audience demographics\n• Answer questions about the platform\n\nWhat would you like to know?`;
    }
    return `👋 Hi${userName ? ` ${userName}` : ''}! I'm your AI assistant. I can help you:\n\n• Understand brand opportunities\n• Improve your profile visibility\n• Learn about collaboration best practices\n• Answer platform questions\n\nHow can I assist you today?`;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, userType, userName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessageToGemini(
        userMessage.content,
        messages,
        { userType, userName, influencers, brandInfo, influencerInfo }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = userType === 'brand' 
    ? [
        "Find influencers for fashion campaigns",
        "Who has the highest engagement?",
        "Recommend tech influencers"
      ]
    : [
        "How can I get more brand deals?",
        "Tips to improve my profile",
        "What makes a good collaboration?"
      ];

  // Chat content component (shared between card and dialog)
  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 flex-shrink-0",
                  message.role === 'user'
                    ? "bg-primary"
                    : "bg-gradient-to-r from-purple-600 to-blue-600"
                )}>
                  <div className="flex h-full w-full items-center justify-center">
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600">
                  <div className="flex h-full w-full items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions (only show when no messages yet) */}
            {messages.length === 1 && !isLoading && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5 px-3"
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t p-4">
        {error && (
          <p className="text-xs text-destructive mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Card variant - shows as a dashboard card
  if (variant === 'card') {
    return (
      <>
        <Card
          className="border-0 bg-gradient-to-br from-purple-600 to-blue-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          onClick={() => setIsOpen(true)}
        >
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-1">AI Assistant</h3>
                <p className="text-white/80">Powered by Gemini</p>
              </div>
              <Sparkles className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-white/90 mb-6 leading-relaxed text-base">
              {userType === 'brand'
                ? "Ask me to find the perfect influencers, explain recommendations, or answer any questions about influencer marketing."
                : "Get tips on improving your profile, understanding brand opportunities, and growing your presence."
              }
            </p>
            <Button
              className="w-full bg-white text-purple-700 hover:bg-white/90 font-semibold"
            >
              Start Chatting
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Dialog for chat */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl h-[80vh] p-0 gap-0 flex flex-col">
            <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-white">ICY AI Assistant</DialogTitle>
                  <p className="text-xs text-white/80">Powered by Gemini</p>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ChatContent />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Floating variant (default) - hidden since we're using card variant
  return null;
}

