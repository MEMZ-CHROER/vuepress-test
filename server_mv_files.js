const express = require("express");
const fileUpload = require("express-fileupload");
const OSS = require("ali-oss");
const fs = require("fs");
const app = express();
const port = 3008;

const client = new OSS({
  region: "oss-cn-beijing", // 例如：'oss-cn-hangzhou'
  accessKeyId: "LTAI5tAXKstjRGHGLcvNn61J",
  accessKeySecret: "fOseXeur3OpajvSM3oabeKtd0PoKQY",
  bucket: "teaching-materials-bucket",
  secure: true, // 使用HTTPS
  cname: true, // 启用自有域名配置
  endpoint: "download.chaosmile.com", // 你的自有域名
});

app.use(fileUpload());

app.post("/api/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const sampleFile = req.files.sampleFile;
  const customFilename = req.body.filename; // 获取自定义文件名参数
  console.log("---------------");
  const re = Client.main();
  console.log("re", re);
  // 保存文件到指定目录
  sampleFile.mv(__dirname + "/uploads/" + customFilename, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    try {
      const result = await client.put(
        `files/${customFilename}`,
        "uploads/" + customFilename
      );
      if (result.res.statusCode !== 200) {
        return res.status(500).json({ message: "upload error." });
      }
      // 设置文件权限为公共读
      await client.putACL(`files/${customFilename}`, "public-read");
      // console.log("文件已上传并设置为公共读权限，访问URL为:", result.url);
    } catch (error) {
      return res.status(500).json({ message: "upload error." });
    }
    // 上传成功后删除本地
    const filePath = __dirname + "/uploads/" + customFilename;
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ message: "upload error." });
    }
    // fs.unlinkSync(filePath); // 删除文件 vercel不让创建文件，那么使用文件更新
    res.status(200).json({ code: 200, message: "upload success." });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
