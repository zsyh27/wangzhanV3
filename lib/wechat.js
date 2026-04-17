const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class WechatService {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.accessTokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.accessTokenExpiry && Date.now() < this.accessTokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.appId}&secret=${this.config.appSecret}`
    );

    if (response.data.errcode) {
      throw new Error(`获取access_token失败: ${response.data.errmsg}`);
    }

    this.accessToken = response.data.access_token;
    this.accessTokenExpiry = Date.now() + (response.data.expires_in - 600) * 1000;

    return this.accessToken;
  }

  async addDraft(articles) {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`,
      { articles }
    );

    if (response.data.errcode) {
      throw new Error(`新增草稿失败: ${response.data.errmsg}`);
    }

    return response.data.media_id;
  }

  async publishDraft(mediaId) {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${accessToken}`,
      { media_id: mediaId }
    );

    if (response.data.errcode) {
      throw new Error(`发布草稿失败: ${response.data.errmsg}`);
    }

    return {
      publish_id: response.data.publish_id,
      msg_data_id: response.data.msg_data_id
    };
  }

  async uploadImage(imagePath) {
    const accessToken = await this.getAccessToken();

    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.errcode) {
      throw new Error(`上传图片失败: ${response.data.errmsg}`);
    }

    return response.data.url;
  }

  async uploadPermanentMedia(imagePath) {
    const accessToken = await this.getAccessToken();

    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));
    formData.append('type', 'image');

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.errcode) {
      throw new Error(`上传永久素材失败: ${response.data.errmsg}`);
    }

    return response.data.media_id;
  }
}

const wechatConfig = {
  appId: process.env.WECHAT_APPID || '',
  appSecret: process.env.WECHAT_APPSECRET || ''
};

const wechatService = new WechatService(wechatConfig);

module.exports = {
  wechatService
};
