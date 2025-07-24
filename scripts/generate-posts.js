const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// 配置 marked 选项
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false
});

// 从文件名生成 slug
function generateSlug(filename) {
  // 移除 .md 扩展名
  const nameWithoutExt = filename.replace(/\.md$/, '');
  // 将文件名转换为小写并用连字符替换空格
  return `posts/${nameWithoutExt.toLowerCase().replace(/\s+/g, '-')}`;
}

// 读取 posts 目录下的所有 md 文件
const postsDirectory = path.join(__dirname, '../src/posts');
const posts = [];

// 读取所有 md 文件
const files = fs.readdirSync(postsDirectory);
for (const file of files) {
  if (file.endsWith('.md')) {
    const filePath = path.join(postsDirectory, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // 解析 frontmatter
    const { data, content } = matter(fileContent);
    
    // 生成 HTML
    const html = marked.parse(content);
    
    // 创建 post 对象
    const post = {
      title: data.title,
      description: data.description,
      date: data.date || "2024-03-20", // 添加默认日期
      image: data.image,
      slug: generateSlug(file), // 使用文件名生成 slug
      tags: data.tags,
      author: data.author,
      readTime: data.readTime || "5", // 添加默认阅读时间
      content: content,
      html: html
    };
    
    posts.push(post);

    // 生成静态 HTML 文件
    const postSlug = post.slug.replace('posts/', '');
    const postHtmlPath = path.join(__dirname, '../src/app/posts', postSlug, 'page.html');
    
    // 确保目录存在
    fs.mkdirSync(path.dirname(postHtmlPath), { recursive: true });
    
    // 写入 HTML 文件
    fs.writeFileSync(postHtmlPath, html);
  }
}

// 生成 posts.ts 文件内容
const postsConfig = {
  title: "Blog Posts",
  description: "Technical articles, tutorials, and insights about web development and EdgeOne platform.",
  backButton: "Back to Home",
  noPosts: "No posts found matching your search.",
  searchPlaceholder: "Search posts by title...",
  pagination: {
    previous: "Previous",
    next: "Next"
  },
  posts: posts
};

// 生成 TypeScript 文件内容
const tsContent = `// This file is auto-generated. Do not edit manually.
import { Post } from '@/types/post';

export const postsConfig = ${JSON.stringify(postsConfig, null, 2)} as const;
`;

// 写入文件
const outputPath = path.join(__dirname, '../src/config/posts.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('Posts generated successfully!'); 