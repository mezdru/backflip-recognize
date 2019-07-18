const mailjet = require ('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const UrlHelper = require('./url.helper');

const defaultBannerUrl = 'https://wingzy.com/images/home/fly_away.jpg';
const defaultLogoUrl = 'https://wingzy.com/wingzy.png';
const defaultEmitter = 'bonjour@wingzy.com';
const defaultEmitterName = 'Wingzy';

exports.sendRecognizeEmail = (recipientEmail, wingsList, organisation, ctaUrl, recipientLocale) => {
  return mailjet
  .post("send")
  .request({
    "FromEmail": defaultEmitter,
    "FromName": defaultEmitterName,
    "MJ-TemplateID": (recipientLocale === 'fr' ? '916066' : '916002'),
    "MJ-TemplateLanguage": true,
    "Recipients": [
      { "Email": recipientEmail }
    ],
    "Vars": {
      "wingsList": wingsList,
      "orgBannerUrl": (organisation && organisation.cover ? organisation.cover.url || defaultBannerUrl : defaultBannerUrl),
      "orgLogoUrl": (organisation && organisation.logo ? organisation.logo.url || defaultLogoUrl : defaultLogoUrl),
      "ctaUrl": ctaUrl,
      "orgName": organisation ? organisation.name : null,
      "orgUrl": (new UrlHelper(organisation.tag, null, null, recipientLocale)).getUrl()
    }
  });
}