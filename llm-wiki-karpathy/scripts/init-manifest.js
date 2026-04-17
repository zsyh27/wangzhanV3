#!/usr/bin/env node

const path = require('path');
const mm = require('../lib/manifest-manager');

const ROOT_DIR = path.join(__dirname, '..');
const RAW_DIR = path.join(ROOT_DIR, 'raw');

async function main() {
  console.log('========================================');
  console.log('  LLM Wiki - 初始化素材清单');
  console.log('========================================');
  console.log();

  try {
    // 1. 扫描 raw/ 目录
    console.log('📁 扫描 raw/ 目录...');
    const files = await mm.scanRawDirectory();
    
    if (files.length === 0) {
      console.log('⚠️  raw/ 目录中没有找到任何文件');
      console.log();
      console.log('请先将原始素材放入 raw/ 目录，例如：');
      console.log('  raw/pdfs/产品手册.pdf');
      console.log('  raw/articles/技术文章.md');
      console.log();
      return;
    }

    console.log(`✅ 找到 ${files.length} 个文件`);
    console.log();

    // 2. 读取现有清单
    console.log('📖 读取现有清单...');
    let manifest = await mm.readManifest();
    
    console.log(`✅ 现有清单中有 ${manifest.length} 条记录`);
    console.log();

    // 3. 扫描并更新清单
    console.log('🔄 扫描并更新清单...');
    let updatedCount = 0;
    let newCount = 0;
    let existingCount = 0;

    for (const file of files) {
      console.log(`  处理: ${file.name}`);
      
      // 计算 MD5
      const checkSum = await mm.calculateMD5(file.path);
      
      // 查找是否已存在
      const existing = mm.findSource(manifest, file.name);
      
      if (existing) {
        existingCount++;
        console.log(`    ⏭️  已存在于清单中`);
        
        // 检查文件是否修改
        if (existing.check_sum !== checkSum) {
          console.log(`    📝 文件已修改，标记为 pending`);
          mm.updateSource(manifest, file.name, {
            date_modified: file.mtime,
            status: 'pending',
            check_sum: checkSum,
            version: mm.incrementVersion(existing.version)
          });
          updatedCount++;
        }
      } else {
        newCount++;
        console.log(`    ➕ 新增记录`);
        
        mm.addSource(manifest, {
          filename: file.name,
          date_modified: file.mtime,
          check_sum: checkSum
        });
      }
    }

    console.log();
    console.log('📊 统计:');
    console.log(`  已存在: ${existingCount} 个`);
    console.log(`  新增: ${newCount} 个`);
    console.log(`  更新: ${updatedCount} 个`);
    console.log(`  总计: ${manifest.length} 个`);
    console.log();

    // 4. 写入清单
    console.log('💾 写入清单到 manifests/raw-sources.csv...');
    await mm.writeManifest(manifest);
    console.log('✅ 写入完成');
    console.log();

    // 5. 显示待处理素材
    const pending = manifest.filter(item => item.status === 'pending');
    if (pending.length > 0) {
      console.log('📋 待处理的素材:');
      pending.forEach(item => {
        console.log(`  - ${item.filename} (${item.type})`);
      });
      console.log();
      console.log('接下来运行:');
      console.log('  node scripts/ingest.js');
      console.log();
    } else {
      console.log('✅ 所有素材都已处理完成');
      console.log();
    }

    console.log('========================================');
    console.log('  初始化完成！');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 错误:');
    console.error(error);
    process.exit(1);
  }
}

main();
