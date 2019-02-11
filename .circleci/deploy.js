const FtpDeploy = require('ftp-deploy')
const ftpDeploy = new FtpDeploy()

const config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: __dirname + '/../public/',
  remoteRoot: '/deploy_test',
  include: ['*'],
}

ftpDeploy.deploy(config, function(err) {
  if (err) console.log(err)
  else console.log('finished')
})
