import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { blogCategoriesQuery, blogPostsQuery } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `مقاله ${params.slug} | مجله ۲۰کام` },
      {
        name: "description",
        content: "مقاله تخصصی مجله ۲۰کام درباره تولید، کیفیت و صنعت محصولات آردی.",
      },
      { property: "og:title", content: "مجله ۲۰کام" },
      { property: "og:description", content: "مقاله تخصصی درباره تولید و کیفیت محصولات آردی." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams();
  const { data: posts, isLoading } = useQuery(blogPostsQuery);
  const { data: cats } = useQuery(blogCategoriesQuery);

  const post = (posts ?? []).find((p) => p.slug === slug && p.is_published);
  const category = cats?.find((c) => c.id === post?.category_id);
  const related = (posts ?? [])
    .filter((p) => p.is_published && p.id !== post?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-24">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="text-2xl">مقاله یافت نشد</h1>
          <Button asChild className="mt-6">
            <Link to="/blog">بازگشت به مجله</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container-page py-10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          بازگشت به مجله
        </Link>

        <header className="mx-auto mt-6 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {category ? (
              <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
                {category.name}
              </span>
            ) : null}
            <span>{formatDate(post.published_at)}</span>
          </div>
          <h1 className="mt-5 text-3xl leading-[1.5] md:text-4xl md:leading-[1.4]">{post.title}</h1>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">{post.excerpt}</p>
        </header>

        {post.cover_image ? (
          <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl shadow-lift">
            <img
              src={post.cover_image}
              alt={post.title}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="article-body mx-auto mt-10 max-w-3xl text-base">
          {post.content
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="container-page pb-16">
          <h2 className="mb-6 text-2xl">مقالات مرتبط</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                categoryName={cats?.find((c) => c.id === item.category_id)?.name}
              />
            ))}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
