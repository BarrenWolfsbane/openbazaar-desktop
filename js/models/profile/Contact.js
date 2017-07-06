import BaseModel from '../BaseModel';
import app from '../../app';
import is from 'is_js';
import SocialAccounts from '../../collections/profile/SocialAccounts';

export default class extends BaseModel {
  defaults() {
    return {
      website: '',
      email: '',
      phoneNumber: '',
      social: new SocialAccounts(),
    };
  }

  get nested() {
    return {
      social: SocialAccounts,
    };
  }

  get maxSocialAccounts() {
    return 30;
  }

  validate(attrs) {
    const errObj = {};
    const addError = (fieldName, error) => {
      errObj[fieldName] = errObj[fieldName] || [];
      errObj[fieldName].push(error);
    };


    if (attrs.email && is.not.email(attrs.email)) {
      addError('email', app.polyglot.t('contactModelErrors.provideValidEmail'));
    }

    if (attrs.website && is.not.url(attrs.website)) {
      addError('website', app.polyglot.t('contactModelErrors.provideValidURL'));
    }

    const socialAccounts = attrs.social;
    // used to give errors on dupes of the same type
    const groupedByType = socialAccounts.groupBy('type');

    if (attrs.social.length > this.maxSocialAccounts) {
      addError('socialAccounts',
        app.polyglot('contactModelErrors.tooManySocialAccounts', { max: this.maxSocialAccounts }));
    }

    socialAccounts.forEach((socialMd) => {
      const socialAttrs = socialMd.attributes;

      // if there are dupes of the same type, give an error to all
      // dupes after the first one
      if (groupedByType[socialAttrs.type].length > 1 &&
        groupedByType[socialAttrs.type].indexOf(socialMd) > 0) {
        addError(`social[${socialMd.cid}].type`,
          app.polyglot.t('contactModelErrors.duplicateSocialAccount'));
      }
    });

    if (Object.keys(errObj).length) return errObj;

    return undefined;
  }
}
