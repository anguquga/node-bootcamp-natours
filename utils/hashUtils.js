const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.bcryptoHash = async (objectToHash) => {
  return await bcrypt.hash(objectToHash, 12);
};

exports.bcryptoCompare = async (objectToCompare, hashObject) => {
  return await bcrypt.compare(objectToCompare, hashObject);
};

exports.createCryptoTokens = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return { resetToken: resetToken, hashToken: hashToken };
};

exports.hashCryptoToken = (token) => {
  const hashToken = crypto.createHash('sha256').update(token).digest('hex');
  return hashToken;
};

exports.generateJWTToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.validateJWTToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET);
};
