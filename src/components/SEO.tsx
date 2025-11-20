import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video';
  publishedTime?: string;
  modifiedTime?: string;
}

export function SEO({
  title = 'Bobin Kardeşler - Underground Elektrik & Teknoloji',
  description = 'Underground elektrik projeleri, elektronik devreler ve teknoloji eğitim içerikleri. Arduino, güç elektroniği, amplifikatör projeleri ve daha fazlası.',
  image = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:type', content: type },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];

    if (url) {
      metaTags.push({ property: 'og:url', content: url });
    }

    if (publishedTime) {
      metaTags.push({ property: 'article:published_time', content: publishedTime });
    }

    if (modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    }

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);

      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    });
  }, [title, description, image, url, type, publishedTime, modifiedTime]);

  return null;
}
