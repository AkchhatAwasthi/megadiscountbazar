import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  Trash2,
  Save,
  AlertCircle,
  Eye,
  Instagram
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const InstagramPosts = () => {
  const supabaseClient = supabase;
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    embed_html: '',
    caption: '',
    is_active: true,
    sort_order: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<InstagramPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('instagram_posts')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Instagram posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .insert([{
          embed_html: newPost.embed_html,
          caption: newPost.caption,
          is_active: newPost.is_active,
          sort_order: newPost.sort_order || posts.length + 1
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post created successfully'
      });

      setNewPost({
        embed_html: '',
        caption: '',
        is_active: true,
        sort_order: 0
      });

      fetchPosts();
    } catch (error) {
      console.error('Error creating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editData) return;

    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({
          embed_html: editData.embed_html,
          caption: editData.caption,
          is_active: editData.is_active,
          sort_order: editData.sort_order
        })
        .eq('id', editData.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post updated successfully'
      });

      setEditingId(null);
      setEditData(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('instagram_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post deleted successfully'
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete Instagram post',
        variant: 'destructive'
      });
    }
  };

  const startEditing = (post: InstagramPost) => {
    setEditingId(post.id);
    setEditData({ ...post });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const movePost = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = posts.findIndex(post => post.id === id);
    if (currentIndex === -1) return;

    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;

    const updatedPosts = [...posts];
    const temp = updatedPosts[currentIndex].sort_order;
    updatedPosts[currentIndex].sort_order = updatedPosts[newIndex].sort_order;
    updatedPosts[newIndex].sort_order = temp;

    setPosts(updatedPosts);

    try {
      // Update both posts in database
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[currentIndex].sort_order })
        .eq('id', updatedPosts[currentIndex].id);

      if (error) throw error;

      const { error: error2 } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[newIndex].sort_order })
        .eq('id', updatedPosts[newIndex].id);

      if (error2) throw error2;
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sort order',
        variant: 'destructive'
      });
      fetchPosts(); // Revert to original order
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--color-brand-red-light)',
          borderTopColor: 'var(--color-brand-red)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid var(--color-border-default)', borderRadius: 8,
    fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)', outline: 'none',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Instagram style={{ width: 22, height: 22, color: '#E1306C' }} />
          Instagram Feed
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage your social media presence</p>
      </div>

      {/* Add New Post Card */}
      <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Instagram style={{ width: 18, height: 18, color: '#E1306C' }} />
          <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Add New Instagram Post</span>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="max-sm:grid-cols-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="embed_html" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Embed HTML</label>
              <Textarea
                id="embed_html"
                placeholder="Paste Instagram embed HTML here"
                value={newPost.embed_html}
                onChange={(e) => setNewPost({ ...newPost, embed_html: e.target.value })}
                rows={6}
                style={{ ...inputStyle, padding: '10px 12px', resize: 'vertical', minHeight: 100 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="caption" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Caption</label>
              <Textarea
                id="caption"
                placeholder="Enter caption for the post"
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                rows={3}
                style={{ ...inputStyle, padding: '10px 12px', resize: 'vertical', minHeight: 80 }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20,
            background: 'var(--color-surface-page)', border: '1px solid var(--color-brand-red-light)', borderRadius: 8, padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch
                id="is_active"
                checked={newPost.is_active}
                onCheckedChange={(checked) => setNewPost({ ...newPost, is_active: checked })}
                className="data-[state=checked]:bg-[var(--color-brand-red)]"
              />
              <label htmlFor="is_active" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', cursor: 'pointer' }}>Active</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label htmlFor="sort_order" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Sort Order:</label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={newPost.sort_order || ''}
                onChange={(e) => setNewPost({ ...newPost, sort_order: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, height: 36, padding: '0 12px', width: 100 }}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: saving ? '#5A8FFF' : 'var(--color-brand-red)', color: 'var(--color-surface-card)',
                border: 'none', borderRadius: 8, padding: '8px 18px',
                fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red-deep)'; }}
              onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red)'; }}
            >
              <PlusCircle style={{ width: 16, height: 16 }} />
              {saving ? 'Adding...' : 'Add Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Posts */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
          Existing Posts <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 400 }}>({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 48, background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12,
          }}>
            <AlertCircle style={{ width: 40, height: 40, color: '#CBD5E1', marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>No Instagram posts found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
            className="max-lg:grid-cols-2 max-sm:grid-cols-1">
            {posts.map((post) => (
              <div key={post.id} style={{
                background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
              >
                <div style={{ padding: 16 }}>
                  {editingId === post.id && editData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Embed HTML</label>
                        <Textarea
                          value={editData.embed_html}
                          onChange={(e) => setEditData({ ...editData, embed_html: e.target.value })}
                          rows={4}
                          style={{ ...inputStyle, padding: '8px 10px', resize: 'vertical', fontSize: 13 }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Caption</label>
                        <Textarea
                          value={editData.caption}
                          onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                          rows={2}
                          style={{ ...inputStyle, padding: '8px 10px', resize: 'vertical', fontSize: 13 }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch
                          checked={editData.is_active}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                          className="data-[state=checked]:bg-[var(--color-brand-red)]"
                        />
                        <Label style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Active</Label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort Order</label>
                        <Input
                          type="number"
                          min="0"
                          value={editData.sort_order}
                          onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                          style={{ ...inputStyle, height: 36, padding: '0 10px', fontSize: 13 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={handleUpdatePost}
                          disabled={saving}
                          style={{
                            flex: 1, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: 'var(--color-brand-red)', color: 'var(--color-surface-card)', border: 'none', borderRadius: 8,
                            fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                          }}
                        >
                          <Save style={{ width: 14, height: 14 }} />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          style={{
                            flex: 1, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', color: 'var(--color-text-secondary)',
                            border: '1.5px solid var(--color-border-default)', borderRadius: 8,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Embed preview */}
                      <div style={{
                        aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8,
                        background: 'var(--color-admin-table-head)', border: '1px solid var(--color-border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div
                          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, overflow: 'hidden', transform: 'scale(0.85)', transformOrigin: 'top center' }}
                          dangerouslySetInnerHTML={{ __html: post.embed_html }}
                        />
                      </div>

                      {/* Caption */}
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.caption}
                      </p>

                      {/* Status + order */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--color-admin-table-head)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                            background: post.is_active ? '#EAF3DE' : '#FCEBEB',
                            color: post.is_active ? '#27500A' : '#A32D2D',
                          }}>
                            {post.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>#{post.sort_order}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => startEditing(post)}
                            style={{
                              width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 6,
                              color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-admin-table-head)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <Eye style={{ width: 16, height: 16 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            style={{
                              width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 6,
                              color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = '#FCEBEB';
                              (e.currentTarget as HTMLElement).style.color = '#A32D2D';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                            }}
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                      </div>

                      {/* Reorder buttons */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => movePost(post.id, 'up')}
                          disabled={posts.findIndex(p => p.id === post.id) === 0}
                          style={{
                            flex: 1, height: 30, border: '1px solid var(--color-border-default)', borderRadius: 6,
                            background: 'var(--color-surface-card)', fontSize: 13, color: 'var(--color-text-secondary)',
                            cursor: posts.findIndex(p => p.id === post.id) === 0 ? 'not-allowed' : 'pointer',
                            opacity: posts.findIndex(p => p.id === post.id) === 0 ? 0.4 : 1,
                            transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ↑ Up
                        </button>
                        <button
                          type="button"
                          onClick={() => movePost(post.id, 'down')}
                          disabled={posts.findIndex(p => p.id === post.id) === posts.length - 1}
                          style={{
                            flex: 1, height: 30, border: '1px solid var(--color-border-default)', borderRadius: 6,
                            background: 'var(--color-surface-card)', fontSize: 13, color: 'var(--color-text-secondary)',
                            cursor: posts.findIndex(p => p.id === post.id) === posts.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: posts.findIndex(p => p.id === post.id) === posts.length - 1 ? 0.4 : 1,
                            transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ↓ Down
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPosts;
