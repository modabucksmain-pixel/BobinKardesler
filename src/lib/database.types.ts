export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image: string | null
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
          author_id: string | null
          reading_time: number
          views: number
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          featured_image?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          reading_time?: number
          views?: number
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          featured_image?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          reading_time?: number
          views?: number
        }
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      blog_post_categories: {
        Row: {
          blog_post_id: string
          category_id: string
        }
        Insert: {
          blog_post_id: string
          category_id: string
        }
        Update: {
          blog_post_id?: string
          category_id?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      youtube_cache: {
        Row: {
          id: string
          cache_key: string
          data: Json
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          cache_key: string
          data?: Json
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          cache_key?: string
          data?: Json
          expires_at?: string
          created_at?: string
        }
      }
      video_suggestions: {
        Row: {
          id: string
          title: string
          description: string
          submitter_name: string | null
          submitter_email: string | null
          status: string
          votes: number
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          submitter_name?: string | null
          submitter_email?: string | null
          status?: string
          votes?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          submitter_name?: string | null
          submitter_email?: string | null
          status?: string
          votes?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      video_watch_history: {
        Row: {
          id: string
          video_id: string
          user_identifier: string
          watched_at: string
          watch_duration: number | null
        }
        Insert: {
          id?: string
          video_id: string
          user_identifier: string
          watched_at?: string
          watch_duration?: number | null
        }
        Update: {
          id?: string
          video_id?: string
          user_identifier?: string
          watched_at?: string
          watch_duration?: number | null
        }
      }
      community_posts: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string | null
          author_id: string | null
          published: boolean
          pinned: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url?: string | null
          author_id?: string | null
          published?: boolean
          pinned?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string | null
          author_id?: string | null
          published?: boolean
          pinned?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string
          publish_at: string
          published: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content: string
          publish_at?: string
          published?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          content?: string
          publish_at?: string
          published?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          youtube_video_id: string | null
          github_url: string | null
          thumbnail_url: string
          components: string | null
          featured: boolean
          views: number
          likes: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          youtube_video_id?: string | null
          github_url?: string | null
          thumbnail_url: string
          components?: string | null
          featured?: boolean
          views?: number
          likes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          youtube_video_id?: string | null
          github_url?: string | null
          thumbnail_url?: string
          components?: string | null
          featured?: boolean
          views?: number
          likes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          question: string
          description: string | null
          status: 'active' | 'closed'
          end_date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          description?: string | null
          status?: 'active' | 'closed'
          end_date: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          description?: string | null
          status?: 'active' | 'closed'
          end_date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          vote_count: number
          position: number
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          vote_count?: number
          position: number
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          vote_count?: number
          position?: number
        }
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_ip: string
          user_fingerprint: string | null
          voted_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_ip: string
          user_fingerprint?: string | null
          voted_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_ip?: string
          user_fingerprint?: string | null
          voted_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          subscribed_at: string
          is_active: boolean
          unsubscribe_token: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribe_token?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribe_token?: string
        }
      }
      giveaways: {
        Row: {
          id: string
          title: string
          description: string
          prize: string
          image_url: string | null
          start_date: string
          end_date: string
          status: string
          winner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          prize: string
          image_url?: string | null
          start_date: string
          end_date: string
          status?: string
          winner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          prize?: string
          image_url?: string | null
          start_date?: string
          end_date?: string
          status?: string
          winner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      giveaway_participants: {
        Row: {
          id: string
          giveaway_id: string
          name: string
          email: string
          participated_at: string
        }
        Insert: {
          id?: string
          giveaway_id: string
          name: string
          email: string
          participated_at?: string
        }
        Update: {
          id?: string
          giveaway_id?: string
          name?: string
          email?: string
          participated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          body: string
          tags: string[]
          status: 'open' | 'in_progress' | 'resolved'
          created_by: string | null
          created_by_email: string | null
          google_connected: boolean
          solution_reply_id: string | null
          last_activity_at: string
          created_at: string
          updated_at: string
          view_count: number
          is_locked: boolean
        }
        Insert: {
          id?: string
          title: string
          body: string
          tags?: string[]
          status?: 'open' | 'in_progress' | 'resolved'
          created_by?: string | null
          created_by_email?: string | null
          google_connected?: boolean
          solution_reply_id?: string | null
          last_activity_at?: string
          created_at?: string
          updated_at?: string
          view_count?: number
          is_locked?: boolean
        }
        Update: {
          id?: string
          title?: string
          body?: string
          tags?: string[]
          status?: 'open' | 'in_progress' | 'resolved'
          created_by?: string | null
          created_by_email?: string | null
          google_connected?: boolean
          solution_reply_id?: string | null
          last_activity_at?: string
          created_at?: string
          updated_at?: string
          view_count?: number
          is_locked?: boolean
        }
      }
      forum_replies: {
        Row: {
          id: string
          thread_id: string
          body: string
          author_id: string | null
          author_email: string | null
          is_admin_response: boolean
          is_solution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          body: string
          author_id?: string | null
          author_email?: string | null
          is_admin_response?: boolean
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          body?: string
          author_id?: string | null
          author_email?: string | null
          is_admin_response?: boolean
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
