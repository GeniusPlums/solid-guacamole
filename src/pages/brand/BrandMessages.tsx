import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock conversation data
const mockConversations = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "",
    lastMessage: "Looking forward to the collaboration!",
    timestamp: "2 min ago",
    unread: 2,
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "",
    lastMessage: "I'll send over the content drafts tomorrow",
    timestamp: "1 hour ago",
    unread: 0,
  },
  {
    id: "3",
    name: "Emma Williams",
    avatar: "",
    lastMessage: "Thanks for the opportunity!",
    timestamp: "Yesterday",
    unread: 0,
  },
];

const mockMessages = [
  { id: "1", sender: "other", text: "Hi! I'm excited about this collaboration opportunity.", timestamp: "10:30 AM" },
  { id: "2", sender: "me", text: "Great to hear! We think you'd be a perfect fit for our summer campaign.", timestamp: "10:32 AM" },
  { id: "3", sender: "other", text: "That sounds amazing! What kind of content are you looking for?", timestamp: "10:35 AM" },
  { id: "4", sender: "me", text: "We're looking for 2 Instagram posts and 1 Reel showcasing our new product line.", timestamp: "10:38 AM" },
  { id: "5", sender: "other", text: "Looking forward to the collaboration!", timestamp: "10:40 AM" },
];

export default function BrandMessages() {
  const { profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    setNewMessage("");
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
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-5rem)]">
                {mockConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedConversation.id === conv.id && "bg-muted"
                    )}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conv.name}</p>
                          <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-white">{conv.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          msg.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-gradient-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

