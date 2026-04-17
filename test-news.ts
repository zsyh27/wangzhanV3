import { getAllContent, getContentBySlug } from './lib/markdown'

async function test() {
  console.log('Testing getAllContent function...')
  const news = await getAllContent('news')
  console.log('News count:', news.length)
  console.log('News:', news)
  
  console.log('\nTesting getContentBySlug function...')
  const newsItem = await getContentBySlug('news', '123123')
  console.log('News item:', newsItem)
}

test().catch(console.error)
