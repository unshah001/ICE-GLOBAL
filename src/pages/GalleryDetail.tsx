import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { BackgroundBeams } from "@/components/ui/background-effects";
import Footer from "@/components/Footer";
import { navItems } from "@/data/expo-data";
import { galleryItems, type GalleryItem, type GalleryComment } from "@/data/gallery-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Mail,
  Link2,
  Twitter,
  Linkedin,
  Facebook,
  MessageSquare,
  Send,
} from "lucide-react";
import NotFound from "./NotFound";

const makeId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
};

const getCommentStorageKey = (id: string) => `gallery-comments-${id}`;
const sectionSlug = (text: string, fallback: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || fallback;

const commentName = (c: GalleryComment) => c.author || "Community member";
const commentInitial = (c: GalleryComment) => commentName(c).trim().charAt(0).toUpperCase() || "U";

const GalleryDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const [item, setItem] = useState<GalleryItem | null>(null);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [form, setForm] = useState({ message: "" });
  const commentsRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authSending, setAuthSending] = useState(false);
  const [pendingAction, setPendingAction] = useState<"like" | "comment" | null>(null);
  const [pendingComment, setPendingComment] = useState<string>("");
  const [cooldown, setCooldown] = useState(0);
  const [authError, setAuthError] = useState("");
  const [visibleComments, setVisibleComments] = useState(5);
  const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [copy, setCopy] = useState({
    badge: "Gallery",
    backLabel: "Back to gallery",
    spreadTitle: "Spread the word",
    spreadBody: "Share this moment with your team or friends. Every repost helps the community grow.",
    commentTitle: "Comments",
    commentPlaceholderName: "Your name",
    commentPlaceholderMessage: "Share your thoughts...",
    commentButton: "Post Comment",
    emptyComments: "Be the first to start the conversation.",
    shareLabel: "Share",
    likesLabel: "Likes",
    storyLabelPrefix: "Story",
  });
  const likedStorageKey = (email?: string | null) => `liked-gallery-${email || "anon"}`;
  const sortComments = (list: GalleryComment[]) =>
    [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const commentSentinelRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1.08, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.85]);
  const commentsParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
    if (!id) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${base}/gallery/${id}`);
        if (!res.ok) throw new Error("Gallery detail fetch failed");
        const data = (await res.json()) as GalleryItem;
        setItem(data);
        const stored = localStorage.getItem(getCommentStorageKey(data.id));
        setComments([]);
        setVisibleComments(0);
        setCommentsCursor(null);
        await loadComments(data.id, undefined, stored ? sortComments(JSON.parse(stored)) : undefined);
        setLikes(data.likes ?? 0);
        setIsLiked(false);
      } catch {
        const fallback = galleryItems.find((entry) => entry.id === id) || null;
        setItem(fallback);
        if (fallback) {
          const stored = localStorage.getItem(getCommentStorageKey(fallback.id));
          const sourceComments = fallback.comments || [];
          setComments(stored ? sortComments(JSON.parse(stored)) : sortComments(sourceComments));
          setVisibleComments(5);
          setCommentsCursor(null);
          setLikes(fallback.likes ?? 0);
        } else {
          setComments([]);
          setVisibleComments(0);
          setCommentsCursor(null);
          setLikes(0);
        }
        setIsLiked(false);
      } finally {
        setIsLoading(false);
      }
    };
    const loadCopy = async () => {
      try {
        const res = await fetch(`${base}/gallery-detail/copy`);
        if (!res.ok) throw new Error("Copy fetch failed");
        const data = await res.json();
        setCopy((prev) => ({ ...prev, ...(data || {}) }));
      } catch {
        // keep defaults
      }
    };
    load();
    loadCopy();
  }, [id]);

  useEffect(() => {
    if (!item) return;
    localStorage.setItem(getCommentStorageKey(item.id), JSON.stringify(comments));
  }, [comments, item]);

  const loadComments = async (galleryId: string, cursor?: string | null, fallback?: GalleryComment[]) => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    if (commentsLoading) return;
    setCommentsLoading(true);
    try {
      const url = new URL(`${base}/gallery/${galleryId}/comments`);
      if (cursor) url.searchParams.set("cursor", cursor);
      url.searchParams.set("limit", "10");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("comments fetch failed");
      const data = await res.json();
      const incoming: GalleryComment[] = sortComments(data?.data || []);
      setComments((prev) => sortComments([...(prev || []), ...incoming]));
      setVisibleComments((prev) => Math.max(prev, 5));
      setCommentsCursor(data?.cursor?.next || null);
    } catch {
      if (fallback) {
        setComments(fallback);
        setVisibleComments(Math.max(fallback.length, 5));
        setCommentsCursor(null);
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user_access_token");
    const storedEmail = localStorage.getItem("user_email");
    if (stored) setUserToken(stored);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    const el = commentSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (visibleComments < comments.length) {
            setVisibleComments((prev) => prev + 5);
            return;
          }
          if (commentsCursor && !commentsLoading && item?.id) {
            loadComments(item.id, commentsCursor);
          }
        });
      },
      { rootMargin: "200px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleComments, comments.length, commentsCursor, commentsLoading, item]);

  if (!item && !isLoading) {
    return <NotFound />;
  }

  if (!item) {
    return null;
  }

    const requireUser = (action: "like" | "comment", messageDraft?: string) => {
      if (!userToken) {
        setPendingAction(action);
        if (action === "comment" && messageDraft) setPendingComment(messageDraft);
        setAuthOpen(true);
        setAuthStep("email");
      return false;
    }
    return true;
  };

  const performLike = async (tokenOverride?: string) => {
    const token = tokenOverride || userToken;
    if (!id || !token) return;
    if (isLiked) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const res = await fetch(`${base}/gallery/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Like failed");
      const data = await res.json();
      setLikes(data.likes ?? likes);
      setIsLiked(true);
      try {
        const key = likedStorageKey(userEmail);
        const current = localStorage.getItem(key);
        const list = current ? (JSON.parse(current) as string[]) : [];
        if (!list.includes(id)) {
          localStorage.setItem(key, JSON.stringify([...list, id]));
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Unable to like right now", variant: "destructive" });
    }
  };

  const handleLike = () => {
    if (!requireUser("like")) return;
    performLike();
  };

  const handleShare = async (hash?: string) => {
    const shareUrl = hash ? `${window.location.href.split("#")[0]}#${hash}` : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url: shareUrl, text: item.excerpt });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard" });
    } catch (err) {
      console.error(err);
      toast({ title: "Unable to share right now", variant: "destructive" });
    }
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${item.title} — ${item.excerpt}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noreferrer");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noreferrer");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${item.title} — ${item.excerpt} ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noreferrer");
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`${item.title} — ${item.excerpt}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank", "noreferrer");
  };

  const handleShareReddit = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(item.title);
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, "_blank", "noreferrer");
  };


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Unable to copy", variant: "destructive" });
    }
  };

  const requestOtp = async () => {
    if (cooldown > 0) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setAuthSending(true);
    try {
      const res = await fetch(`${base}/user-auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      if (!res.ok) throw new Error("OTP failed");
      setAuthStep("code");
      toast({ title: "Check your email for the code" });
      setCooldown(90);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast({ title: "Unable to send code", variant: "destructive" });
    } finally {
      setAuthSending(false);
    }
  };

  const verifyOtp = async () => {
    if (authStep !== "code") return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    setAuthSending(true);
    try {
      const res = await fetch(`${base}/user-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, otp: authCode }),
      });
      if (!res.ok) {
        setAuthError("Invalid or expired code. Try again.");
        throw new Error("Verify failed");
      }
      const data = await res.json();
      setUserToken(data.accessToken);
      setUserEmail(data.user?.email || authEmail);
      localStorage.setItem("user_access_token", data.accessToken);
      localStorage.setItem("user_email", data.user?.email || authEmail);
      window.dispatchEvent(new Event("auth-change"));
      setAuthError("");
      try {
        const key = likedStorageKey(data.user?.email || authEmail);
        const stored = localStorage.getItem(key);
        if (stored && id && JSON.parse(stored)?.includes?.(id)) {
          setIsLiked(true);
        }
      } catch {
        // ignore
      }
      setAuthOpen(false);
      setAuthStep("email");
      setAuthCode("");
      if (pendingAction === "like") {
        performLike(data.accessToken);
      }
      if (pendingAction === "comment" && pendingComment) {
        const message = pendingComment;
        setPendingComment("");
        setForm({ message: "" });
        setPendingAction(null);
        await submitComment(message, data.accessToken);
        return;
      }
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      toast({ title: "Invalid code", variant: "destructive" });
    } finally {
      setAuthSending(false);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.message.trim()) {
      toast({ title: "Add a comment to post.", variant: "destructive" });
      return;
    }
    if (!requireUser("comment", form.message.trim())) return;
    if (!id || !userToken) return;
    await submitComment(form.message.trim());
    setForm({ message: "" });
  };

  const submitComment = async (message: string, tokenOverride?: string) => {
    const token = tokenOverride || userToken;
    if (!id || !token) return;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    const commentPayload: GalleryComment = {
      id: makeId(),
      author: "You",
      message,
      date: new Date().toISOString(),
    };
    try {
      const res = await fetch(`${base}/gallery/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentPayload),
      });
      if (res.status === 404) {
        // Fallback: store locally so user sees their comment
        setComments((prev) => sortComments([commentPayload, ...prev]));
        setVisibleComments((prev) => Math.max(prev, 1));
        try {
          const key = getCommentStorageKey(id);
          localStorage.setItem(key, JSON.stringify([commentPayload, ...comments]));
        } catch {
          // ignore storage errors
        }
        toast({ title: "Comment submitted", description: "Saved locally; item not found on server." });
        return;
      }
      if (!res.ok) throw new Error("Comment failed");
      const body = await res.json();
      if (body?.comments) {
        setComments(sortComments(body.comments));
        setVisibleComments((prev) => Math.max(prev, 5));
        setCommentsCursor(null);
      }
      toast({ title: "Comment submitted" });
    } catch (err) {
      console.error(err);
      toast({ title: "Unable to post comment", variant: "destructive" });
    }
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FloatingNavbar navItems={navItems} />

      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <BackgroundBeams className="z-0" />
        <div className="container-custom relative z-10">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {copy.backLabel}
          </Link>

          <div className="mt-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl shadow-primary/10"
            >
              <motion.img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                style={{ scale: heroScale, opacity: heroOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_45%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.15),transparent_45%)]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{item.year}</Badge>
                <Badge>{item.category}</Badge>
                <span className="text-sm text-muted-foreground">by {item.brand}</span>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">{item.title}</h1>
                <p className="text-lg text-muted-foreground mt-3">{item.excerpt}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary-foreground" : ""}`} />
                  {likes} {likes === 1 ? "Like" : "Likes"}
                </Button>
                <Button variant="outline" onClick={() => handleShare()} className="flex items-center gap-2 min-w-[140px]">
                  <Share2 className="w-4 h-4" />
                  {copy.shareLabel}
                </Button>
                <Button
                  variant="ghost"
                  onClick={scrollToComments}
                  className="text-muted-foreground hover:text-primary flex items-center gap-2 min-w-[140px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} Comments
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-2 space-y-10">
            {item.article.map((section, idx) => {
              const anchor = `story-${sectionSlug(section.heading, String(idx))}`;
              return (
                <motion.article
                  key={section.heading}
                  id={anchor}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: idx * 0.06 }}
                  viewport={{ once: true, margin: "-40px" }}
                  className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 md:p-8 shadow-xl shadow-primary/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.2),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.18),transparent_40%)]" />
                  <div className="relative flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
                      {copy.storyLabelPrefix} {idx + 1}
                    </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleShare(anchor)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {copy.shareLabel}
                        </Button>
                        <Button variant="outline" size="sm" onClick={scrollToComments}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-semibold">{section.heading}</h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{section.body}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Badge variant="secondary">{item.year}</Badge>
                      <Badge>{item.category}</Badge>
                      <Badge variant="outline" className="text-xs">
                        #{item.brand}
                      </Badge>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-6 space-y-4 border border-border/70">
            <h3 className="text-xl font-display font-semibold">About this capture</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>Year</span>
                <span className="text-foreground font-medium">{item.year}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Category</span>
                <span className="text-foreground font-medium">{item.category}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Brand</span>
                <span className="text-foreground font-medium">{item.brand}</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-border/60">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                View more moments
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="comments" ref={commentsRef} className="section-padding bg-card/40 border-t border-border/60">
        <div className="container-custom grid lg:grid-cols-3 gap-10 lg:gap-14">
          <motion.div className="lg:col-span-2 space-y-6" style={{ y: commentsParallax }}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-semibold">{copy.commentTitle}</h3>
              <Badge variant="secondary">{comments.length}</Badge>
            </div>

            <form onSubmit={handleCommentSubmit} className="glass rounded-xl p-5 space-y-4 shadow-lg shadow-primary/5">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">{copy.commentPlaceholderMessage}</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder={copy.commentPlaceholderMessage}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userEmail ? "Posting as a verified member" : "Login is required before posting"}
                  </p>
                </div>
              </div>
              <Button type="submit">{copy.commentButton}</Button>
            </form>

            <div className="space-y-4">
              {comments.slice(0, visibleComments).map((comment) => (
                <div key={comment.id} className="rounded-xl border border-border/70 p-4 bg-card/70 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {commentInitial(comment)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{commentName(comment)}</span>
                          <Badge variant="outline" className="text-[11px]">
                            {new Date(comment.date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{comment.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-muted-foreground">{copy.emptyComments}</p>
              )}
              <div ref={commentSentinelRef} className="h-6 w-full" />
            </div>
          </motion.div>

          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-xl shadow-primary/10 space-y-4 self-start lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Share2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-lg font-display font-semibold">{copy.spreadTitle}</h4>
                <p className="text-sm text-muted-foreground">{copy.spreadBody}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy link
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleShareTwitter}>
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="ghost" className="w-full" onClick={handleShareLinkedIn}>
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleShareFacebook}>
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" onClick={handleShareWhatsApp}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShareTelegram}>
                  <Send className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="ghost" className="w-full" onClick={handleShareReddit}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Reddit
                </Button>
                <div />
              </div>
              <Button variant={isLiked ? "default" : "secondary"} className="w-full" onClick={handleLike}>
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-primary text-primary-foreground" : ""}`} />
                {likes} {copy.likesLabel}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={authOpen} onOpenChange={(open) => setAuthOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </span>
              {authStep === "email" ? "Login to continue" : "Enter your code"}
            </DialogTitle>
          </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We use email-based OTP for a quick, passwordless login. Codes expire in 10 minutes.
                </p>
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  disabled={authStep === "code"}
                />
                <Button className="w-full" onClick={requestOtp} disabled={authSending || !authEmail || cooldown > 0}>
                  {authSending ? <Heart className="w-4 h-4 animate-pulse mr-2" /> : null}
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
                <label className="text-sm font-medium">6-digit code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setAuthStep("email")} disabled={authSending}>
                    Back
                  </Button>
                  <Button onClick={verifyOtp} disabled={authSending || authCode.length !== 6 || authStep !== "code"}>
                    {authSending ? <Heart className="w-4 h-4 animate-pulse mr-2" /> : null}
                    Verify & continue
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default GalleryDetail;
