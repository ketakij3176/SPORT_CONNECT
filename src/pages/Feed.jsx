import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, Send, Image } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function Feed() {
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [sportTag, setSportTag] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['feed-comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 200),
  });

  const postMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      setNewPost('');
      setSportTag('');
      toast.success('Post shared!');
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, likes, like_count }) => base44.entities.Post.update(id, { likes, like_count }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed-posts'] }),
  });

  const commentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments'] });
      setCommentTexts(prev => ({ ...prev, [vars.post_id]: '' }));
    },
  });

  const handleLike = (post) => {
    const likes = post.likes || [];
    const isLiked = likes.includes(user?.email);
    const newLikes = isLiked ? likes.filter(e => e !== user?.email) : [...likes, user?.email];
    likeMutation.mutate({ id: post.id, likes: newLikes, like_count: newLikes.length });
  };

  const handleComment = (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    commentMutation.mutate({ post_id: postId, author_email: user?.email, author_name: user?.full_name, content: text });
  };

  const getPostComments = (postId) => comments.filter(c => c.post_id === postId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Community Feed</h1>

      {/* Create Post */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share a match update, achievement, or photo..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <Input
              value={sportTag}
              onChange={e => setSportTag(e.target.value)}
              placeholder="Sport tag (optional)"
              className="w-40 h-8 text-xs"
            />
            <Button
              size="sm"
              onClick={() => postMutation.mutate({ author_email: user?.email, author_name: user?.full_name, content: newPost, sport_tag: sportTag })}
              disabled={!newPost.trim() || postMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No posts yet. Be the first to share!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => {
            const isLiked = (post.likes || []).includes(user?.email);
            const postComments = getPostComments(post.id);
            const isOpen = showComments[post.id];

            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{post.author_name || 'Player'}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      {post.sport_tag && <Badge variant="secondary" className="ml-auto text-xs">{post.sport_tag}</Badge>}
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {post.image_url && (
                      <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full max-h-80 object-cover" />
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                      <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                        <span>{post.like_count || 0}</span>
                      </button>
                      <button onClick={() => setShowComments(prev => ({...prev, [post.id]: !prev[post.id]}))} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{postComments.length}</span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        {postComments.map(c => (
                          <div key={c.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2 flex-1">
                              <p className="text-xs font-medium">{c.author_name}</p>
                              <p className="text-sm">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={commentTexts[post.id] || ''}
                            onChange={e => setCommentTexts(prev => ({...prev, [post.id]: e.target.value}))}
                            placeholder="Write a comment..."
                            className="h-9 text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <Button size="sm" variant="outline" onClick={() => handleComment(post.id)}>
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}