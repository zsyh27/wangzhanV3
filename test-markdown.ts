import { getAllContent } from './lib/markdown'

async function test() {
  console.log('Testing getAllContent function...')
  const news = await getAllContent('news')
  console.log('News count:', news.length)
  console.log('News:', news)
}

test().catch(console.error)
