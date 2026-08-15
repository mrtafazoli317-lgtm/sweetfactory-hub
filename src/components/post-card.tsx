import { Link } from "@tanstack/react-router";
import type { BlogPost } from "@/lib/data";
import { formatDate } from "@/lib/format";

export function PostCard({
  post,
  categoryName,
}: {
  post: BlogPost;
  categoryName?: string | undefined;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="aspect-[3/2] overflow-hidden bg-muted">
        <img
          src={post.cover_image || "/images/blog-koloche.jpg"}
          alt={post.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {categoryName ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
              {categoryName}
            </span>
          ) : null}
          <span>{formatDate(post.published_at)}</span>
        </div>
        <h3 className="text-base font-bold leading-8">{post.title}</h3>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
      </div>
    </Link>
  );
}
