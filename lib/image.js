const fs = require('fs');
const Jimp = require('jimp');
const mime = require('mime-types');
const debug = require('debug')('idm:image');
const base64_img = require('base64-img');
const uuid = require('uuid');

const types = ['jpg', 'jpeg', 'png'];

exports.check = function (image_path) {
  return new Promise((resolve, reject) => {
    const image_mime = mime.lookup(image_path);

    if (image_mime && types.includes(String(image_mime.split('/')[1]))) {
      resolve('Image valid');
    } else {
      reject('Image format not valid');
    }
  });
};

exports.destroy = function (image_path) {
  return new Promise(function (resolve, reject) {
    if (image_path === 'public/img/users/default') {
      resolve();
    } else {
      fs.unlink('./' + image_path, (err) => {
        if (err) {
          reject('Fail image delete');
        } else {
          resolve('Image deleted');
        }
      });
    }
  });
};

exports.destroy_several = function (files) {
  let i = files.length;
  return new Promise(function (resolve, reject) {
    files.forEach(function (filepath) {
      i--;
      if (filepath === 'public/img/users/default') {
        if (i <= 0) {
          resolve();
        }
      } else {
        fs.unlink(filepath, function (err) {
          if (err) {
            reject(err);
          } else if (i <= 0) {
            resolve('Images deleted');
          }
        });
      }
    });
  });
};

exports.crop = function (image_path, crop_points) {
  return Jimp.read(image_path)
    .then(function (image) {
      return Promise.resolve(
        image
          .crop(Number(crop_points.x), Number(crop_points.y), Number(crop_points.w), Number(crop_points.h))
          .write(image_path)
      );
    })
    .catch(function (error) {
      debug('Error: ', error);
      return Promise.reject('Fail image crop');
    });
};

exports.toImage = function (image64, image_path) {
  const image_name = uuid.v4();
  return new Promise(function (resolve, reject) {
    if (image64) {
      base64_img.img('data:image/png;base64,' + image64, image_path, image_name, function (err) {
        if (err) {
          reject(err);
        }
        resolve(image_name + '.png');
      });
    } else {
      resolve();
    }
  });
};

exports.to64 = function (image_path, image_name) {
  return new Promise(function (resolve, reject) {
    base64_img.base64(image_path + image_name, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
