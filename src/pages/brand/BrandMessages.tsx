import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from "@/hooks/useMessages";
import { Send, Search, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function BrandMessages() {
  const { user } = useAuth();
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: messages, isLoading: loadingMessages } = useMessages(selectedUserId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedUserId) {
      setSelectedUserId(conversations[0].id);
    }
  }, [conversations, selectedUserId]);

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedUserId) {
      markAsRead.mutate(selectedUserId);
    }
  }, [selectedUserId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    await sendMessage.mutateAsync({ toUserId: selectedUserId, content: newMessage });
    setNewMessage("");
  };

  const selectedConversation = conversations?.find((c) => c.id === selectedUserId);
  const filteredConversations = conversations?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)]">
        <Card className="h-full">
          <div className="grid md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-5rem)]">
                {loadingConversations ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : filteredConversations && filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn("p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors", selectedUserId === conv.id && "bg-muted")}
                      onClick={() => setSelectedUserId(conv.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src={conv.avatar} /><AvatarFallback>{conv.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conv.name}</p>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(conv.timestamp)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><span className="text-xs text-white">{conv.unread}</span></div>)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a conversation from an influencer profile</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center gap-3">
                    <Avatar><AvatarImage src={selectedConversation.avatar} /><AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{selectedConversation.name}</p><p className="text-xs text-muted-foreground capitalize">{selectedConversation.userType}</p></div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {loadingMessages ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                      ) : messages && messages.length > 0 ? (
                        messages.map((msg) => (
                          <div key={msg.id} className={cn("flex", msg.fromUserId === user?.id ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[70%] rounded-lg px-4 py-2", msg.fromUserId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{formatTimestamp(msg.createdAt)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8"><p className="text-sm">No messages yet. Start the conversation!</p></div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()} disabled={sendMessage.isPending} />
                      <Button onClick={handleSendMessage} className="bg-gradient-primary" disabled={sendMessage.isPending || !newMessage.trim()}>
                        {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

