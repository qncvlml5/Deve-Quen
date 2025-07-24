import { promises as fs } from 'fs';
import path from 'path';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { postsConfig } from "@/config/posts";
import { notFound } from 'next/navigation';

// 生成静态路径
export async function generateStaticParams() {
  return postsConfig.posts.map((post) => ({
    slug: post.slug.replace('posts/', ''),
  }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = postsConfig.posts.find(p => p.slug === `posts/${params.slug}`);

  if (!post) {
    notFound();
  }

  // 读取静态 HTML 文件
  const postSlug = post.slug.replace('posts/', '');
  const postHtmlPath = path.join(process.cwd(), 'src/app/posts', postSlug, 'page.html');
  let postHtml = '';
  
  try {
    postHtml = await fs.readFile(postHtmlPath, 'utf8');
  } catch (error) {
    console.error(`Error reading HTML file for ${postSlug}:`, error);
    postHtml = post.html; // 如果读取失败，使用配置中的 HTML
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_48px] -z-10"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[1200px] w-[1200px] rounded-full bg-neutral-400 opacity-10 blur-[100px]"></div>
      </div>

      <Navbar />

      <main className="flex-grow">
        <article className="relative z-20 w-[896px] mx-auto mt-32 mb-12">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: postHtml }} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
} 