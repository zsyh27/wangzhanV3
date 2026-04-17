import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const appId = process.env.WECHAT_APPID || '';
    const appSecret = process.env.WECHAT_APPSECRET || '';
    
    const configured = appId && appSecret;
    
    return NextResponse.json({
      success: true,
      configured
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '检查微信配置失败'
    }, { status: 500 });
  }
}
