const OSS = require("ali-oss");
const { STS } = require("ali-oss");
const express = require("express");
const fileUpload = require("express-fileupload");
const md5 = require("md5");
const app = express();
const port = 3008;

const sts = new STS({
  // 填写步骤1创建的RAM用户AccessKey。
  accessKeyId: "LTAI5tEyUFs6DzbLUyNjqqWh",
  accessKeySecret: "JZMfGCRZJXgpPCxLRsBoBRBNZBJXnc",
});

app.use(fileUpload());

app.post("/api/sts", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).send("No username or password.");
  }
  if (username !== md5("chaosmile") || password !== md5("chaosmilepassword")) {
    return res.status(400).send("username or password error.");
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const filename = req.body.filename;
  const file = req.files.file;
  if (!filename) {
    return res.status(400).send("No filename.");
  }
  if (!file) {
    return res.status(400).send("No file.");
  }

  sts
    .assumeRole(
      "acs:ram::1079401000307191:role/noirole",
      ``,
      "900",
      "sessiontest"
    )
    .then(async (result) => {
      try {
        const client = new OSS({
          region: "oss-cn-beijing",
          accessKeyId: result.credentials.AccessKeyId,
          accessKeySecret: result.credentials.AccessKeySecret,
          stsToken: result.credentials.SecurityToken,
          bucket: "teaching-materials-bucket",
          secure: true, // 使用HTTPS
          cname: true, // 启用自有域名配置
          endpoint: "download.chaosmile.com", // 你的自有域名
        });

        const options = {
          meta: { temp: "noi" },
          mime: "cpp",
          headers: {
            "Content-Type": "text/plain",
            "x-oss-object-acl": "public-read",
          },
        };
        const response = await client.put(
          `files/${filename}`,
          file.data,
          options
        );
        res
          .status(200)
          .json({ code: 200, data: response?.url, message: "upload success." });
      } catch (err) {
        res.status(500).json({ code: 500, message: err.message ?? "上传错误" });
      }
    })
    .catch((err) => {
      res.status(500).json({ code: 500, message: err.message });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
