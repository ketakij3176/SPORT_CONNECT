import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, ArrowLeft, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [activeConvo, setActiveConvo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const toEmail = urlParams.get('to');
  const toName = urlParams.get('name');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-updated_date', 100);
      return all.filter(c => c.participants?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', activeConvo?.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: activeConvo?.id }, 'created_date', 200),
    enabled: !!activeConvo?.id,
    refetchInterval: 3000,
  });

  // Auto-start convo from URL param
  useEffect(() => {
    if (toEmail && user?.email && conversations.length >= 0) {
      const existing = conversations.find(c => c.participants?.includes(toEmail));
      if (existing) {
        setActiveConvo(existing);
      }
    }
  }, [toEmail, user?.email, conversations]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      let convo = activeConvo;
      if (!convo && toEmail) {
        convo = await base44.entities.Conversation.create({
          participants: [user.email, toEmail],
          participant_names: [user.full_name, toName || toEmail],
          last_message: content,
          last_message_time: new Date().toISOString(),
        });
        setActiveConvo(convo);
      }
      if (convo) {
        await base44.entities.Message.create({
          conversation_id: convo.id,
          sender_email: user.email,
          sender_name: user.full_name,
          content,
        });
        await base44.entities.Conversation.update(convo.id, {
          last_message: content,
          last_message_time: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherName = (convo) => {
    const idx = convo.participants?.indexOf(user?.email);
    const otherIdx = idx === 0 ? 1 : 0;
    return convo.participant_names?.[otherIdx] || convo.participants?.[otherIdx] || 'User';
  };

  const filteredConvos = conversations.filter(c => {
    const name = getOtherName(c).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        {/* Conversation List */}
        <Card className={`md:col-span-1 overflow-hidden ${activeConvo ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-80px)]">
            {filteredConvos.length === 0 && !toEmail ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* New conversation from URL */}
                {toEmail && !conversations.find(c => c.participants?.includes(toEmail)) && (
                  <button
                    onClick={() => setActiveConvo({ id: null, participants: [user?.email, toEmail], participant_names: [user?.full_name, toName] })}
                    className="w-full p-4 text-left hover:bg-muted transition-colors bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{toName || toEmail}</p>
                        <p className="text-xs text-primary">Start conversation</p>
                      </div>
                    </div>
                  </button>
                )}
                {filteredConvos.map(convo => (
                  <button
                    key={convo.id}
                    onClick={() => setActiveConvo(convo)}
                    className={`w-full p-4 text-left hover:bg-muted transition-colors ${activeConvo?.id === convo.id ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{getOtherName(convo)}</p>
                        <p className="text-xs text-muted-foreground truncate">{convo.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className={`md:col-span-2 overflow-hidden flex flex-col ${!activeConvo ? 'hidden md:flex' : ''}`}>
          {activeConvo ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConvo(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{getOtherName(activeConvo)}</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map(msg => {
                    const isMine = msg.sender_email === user?.email;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === 'Enter' && newMessage.trim() && sendMutation.mutate(newMessage)}
                />
                <Button onClick={() => newMessage.trim() && sendMutation.mutate(newMessage)} disabled={sendMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}